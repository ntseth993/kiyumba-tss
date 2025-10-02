// Image processing utility functions
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export const getCroppedImg = async (imageSrc, crop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = crop.width;
  croppedCanvas.height = crop.height;

  const croppedCtx = croppedCanvas.getContext('2d');

  croppedCtx.drawImage(
    canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return croppedCanvas;
};

export const applyImageEffects = async (canvas, effects) => {
  const ctx = canvas.getContext('2d');
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  
  // Copy original image
  tempCtx.drawImage(canvas, 0, 0);
  
  // Clear original canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Apply effects chain
  ctx.filter = `brightness(${100 + effects.brightness}%) 
                contrast(${100 + effects.contrast}%) 
                saturate(${100 + effects.saturation}%)`;
  
  ctx.drawImage(tempCanvas, 0, 0);
  
  return canvas;
};

export const applyEffectsToImage = async (image, effects, crop, rotation) => {
  try {
    // First apply crop and rotation
    const croppedCanvas = await getCroppedImg(image, crop, rotation);
    
    // Then apply effects
    const processedCanvas = await applyImageEffects(croppedCanvas, effects);
    
    // Convert to blob with high quality
    const blob = await new Promise(resolve => {
      processedCanvas.toBlob(resolve, 'image/jpeg', 0.95);
    });
    
    return new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

export const dataUrlToFile = (dataUrl, fileName) => {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  } catch (error) {
    console.error('Error converting dataURL to File:', error);
    throw new Error('Failed to convert image format');
  }
};