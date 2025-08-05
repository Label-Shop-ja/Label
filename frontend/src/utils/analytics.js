// Google Analytics 4 configuration
export const initGA4 = () => {
  const GA_ID = import.meta.env.VITE_GA4_ID;
  
  if (!GA_ID || import.meta.env.VITE_APP_ENV !== 'production') {
    console.log('Analytics disabled in development');
    return;
  }

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (path, title) => {
  if (window.gtag && import.meta.env.VITE_APP_ENV === 'production') {
    window.gtag('config', import.meta.env.VITE_GA4_ID, {
      page_path: path,
      page_title: title,
    });
  }
};

// Track events
export const trackEvent = (action, category = 'general', label = '', value = 0) => {
  if (window.gtag && import.meta.env.VITE_APP_ENV === 'production') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.log('Event tracked:', { action, category, label, value });
  }
};

// Track user actions
export const trackUserAction = (action, details = {}) => {
  trackEvent(action, 'user_interaction', JSON.stringify(details));
};

// Track business metrics
export const trackBusinessMetric = (metric, value, details = {}) => {
  trackEvent(metric, 'business', JSON.stringify(details), value);
};

// Track errors
export const trackError = (error, context = {}) => {
  trackEvent('error', 'application', error.message || 'Unknown error');
};