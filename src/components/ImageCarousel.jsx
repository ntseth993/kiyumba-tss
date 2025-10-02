import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './ImageCarousel.css';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className="image-carousel">
        <div className="carousel-main">
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            onClick={() => setShowFullscreen(true)}
            className="carousel-image"
          />

          {images.length > 1 && (
            <>
              <button
                className="carousel-button prev"
                onClick={goToPrevious}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className="carousel-button next"
                onClick={goToNext}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>

              <div className="carousel-counter">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="carousel-thumbnails">
            {images.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {showFullscreen && (
        <div className="carousel-fullscreen" onClick={() => setShowFullscreen(false)}>
          <button className="fullscreen-close" onClick={() => setShowFullscreen(false)}>
            <X size={32} />
          </button>

          <img
            src={images[currentIndex]}
            alt={`Fullscreen ${currentIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <>
              <button
                className="carousel-button prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft size={32} />
              </button>

              <button
                className="carousel-button next"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight size={32} />
              </button>

              <div className="carousel-counter">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ImageCarousel;
