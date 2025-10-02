// utility to create a cropped image data URL from react-easy-crop output
// returns a cropped image DataURL supporting rotation
export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // set canvas to bounding box size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw the rotated image on an offscreen canvas then crop
  const offCanvas = document.createElement('canvas');
  offCanvas.width = bBoxWidth;
  offCanvas.height = bBoxHeight;
  const offCtx = offCanvas.getContext('2d');

  // move to center and rotate
  offCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  offCtx.rotate(rotRad);
  offCtx.drawImage(image, -image.width / 2, -image.height / 2);

  // now crop from the offscreen canvas
  const sx = pixelCrop.x;
  const sy = pixelCrop.y;
  const sWidth = pixelCrop.width;
  const sHeight = pixelCrop.height;

  const cropped = offCtx.getImageData(sx, sy, sWidth, sHeight);

  // draw to final canvas
  ctx.putImageData(cropped, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.9);
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', error => reject(error));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
  const rot = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rot) * width) + Math.abs(Math.sin(rot) * height),
    height: Math.abs(Math.sin(rot) * width) + Math.abs(Math.cos(rot) * height)
  };
}
