// SEO and meta tags management hook
import { useEffect } from 'react';

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Label - Gestión Empresarial`;
    }

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'Label', 'property');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', image, 'name');
    
    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'Label Team');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
  }, [title, description, keywords, image, url, type]);
};

const updateMetaTag = (name, content, attribute = 'name') => {
  if (!content) return;
  
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};