import { useEffect, useState } from 'react';

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of image paths
  const images = ['https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/611e77220cd10cee.png?q=20', 'https://rukminim1.flixcart.com/fk-p-flap/1600/270/image/611e77220cd10cee.png?q=20', 'https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/611e77220cd10cee.png?q=20'];

  // Function to handle automatic scrolling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="carousel">
      {images.map((image, index) => (
        <div
          key={index}
          className={`slide ${index === currentIndex ? 'active' : ''}`}
        >
          <img src={image} alt={`Image ${index + 1}`} />
        </div>
      ))}
    </div>
  );
};

export default Carousel;
