/**
 * Utilidades para optimización de imágenes
 */

/**
 * Genera URL optimizada de Cloudinary
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName || !publicId) {
    return publicId; // Fallback a URL original
  }

  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`
  ].join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
};

/**
 * Genera URLs responsivas para diferentes tamaños
 */
export const getResponsiveImageUrls = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 1200 })
  };
};

/**
 * Preload de imagen crítica
 */
export const preloadImage = (src) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};