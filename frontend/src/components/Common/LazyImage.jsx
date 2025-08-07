// Optimized lazy loading image component
import React, { useState, useRef, useEffect } from 'react';
import { trackEvent } from '../../utils/analytics';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/placeholder.svg',
  quality = 'auto',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef();
  const startTime = useRef(Date.now());

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Optimize Cloudinary URLs
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc || !originalSrc.includes('cloudinary')) {
      return originalSrc;
    }

    // Add Cloudinary transformations for optimization
    const transformations = [
      'f_auto', // Auto format (WebP, AVIF when supported)
      `q_${quality}`, // Quality
      'c_scale,w_auto', // Auto width scaling
      'dpr_auto' // Auto DPR for retina displays
    ].join(',');

    return originalSrc.replace('/upload/', `/upload/${transformations}/`);
  };

  const handleLoad = () => {
    const loadTime = Date.now() - startTime.current;
    setIsLoaded(true);
    
    // Track slow image loads
    if (loadTime > 2000) {
      trackEvent('slow_image_load', 'performance', src, loadTime);
    }
  };

  const handleError = () => {
    setError(true);
    trackEvent('image_load_error', 'errors', src);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={error ? placeholder : getOptimizedSrc(src)}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;