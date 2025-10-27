// Performance Optimization Service
// Handles code splitting, lazy loading, caching, and performance monitoring

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.prefetchedComponents = new Set();
    this.lazyLoadedComponents = new Map();
    this.performanceMetrics = {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0
    };

    this.init();
  }

  // Initialize performance monitoring
  init() {
    this.measurePerformance();
    this.setupIntersectionObserver();
    this.setupServiceWorker();
    this.preloadCriticalResources();
  }

  // Measure and track performance metrics
  measurePerformance() {
    // Web Vitals measurement
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((value) => {
          this.performanceMetrics.cumulativeLayoutShift = value;
          this.logMetric('CLS', value);
        });

        getFID((value) => {
          this.performanceMetrics.firstInputDelay = value;
          this.logMetric('FID', value);
        });

        getFCP((value) => {
          this.performanceMetrics.firstContentfulPaint = value;
          this.logMetric('FCP', value);
        });

        getLCP((value) => {
          this.performanceMetrics.largestContentfulPaint = value;
          this.logMetric('LCP', value);
        });

        getTTFB((value) => {
          this.logMetric('TTFB', value);
        });
      });
    }

    // Custom performance measurements
    if (performance.timing) {
      window.addEventListener('load', () => {
        const timing = performance.timing;
        this.performanceMetrics.loadTime = timing.loadEventEnd - timing.navigationStart;
        this.logMetric('LoadTime', this.performanceMetrics.loadTime);
      });
    }
  }

  // Log performance metrics
  logMetric(name, value) {
    console.log(`Performance Metric - ${name}: ${value}`);

    // Store in localStorage for debugging
    const metrics = JSON.parse(localStorage.getItem('performanceMetrics') || '{}');
    metrics[name] = value;
    metrics.timestamp = Date.now();
    localStorage.setItem('performanceMetrics', JSON.stringify(metrics));
  }

  // Get performance metrics
  getMetrics() {
    return { ...this.performanceMetrics };
  }

  // Lazy load components
  lazyLoadComponent(componentName, importFunction) {
    if (this.lazyLoadedComponents.has(componentName)) {
      return this.lazyLoadedComponents.get(componentName);
    }

    const lazyComponent = React.lazy(() =>
      importFunction().catch(error => {
        console.error(`Failed to lazy load ${componentName}:`, error);
        // Return fallback component
        return {
          default: () => (
            <div className="error-placeholder">
              <p>Failed to load component. Please refresh the page.</p>
            </div>
          )
        };
      })
    );

    this.lazyLoadedComponents.set(componentName, lazyComponent);
    return lazyComponent;
  }

  // Preload critical resources
  preloadCriticalResources() {
    // Preload critical fonts
    this.preloadFont('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    // Preload critical images
    const criticalImages = [
      '/photo/1.jpg',
      '/photo/2.jpg',
      '/photo/3.jpg'
    ];

    criticalImages.forEach(imagePath => {
      this.preloadImage(imagePath);
    });
  }

  // Preload font
  preloadFont(fontUrl) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'style';
    link.onload = () => {
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = fontUrl;
      document.head.appendChild(styleLink);
    };
    document.head.appendChild(link);
  }

  // Preload image
  preloadImage(imagePath) {
    const img = new Image();
    img.src = imagePath;
  }

  // Prefetch component for faster loading
  prefetchComponent(componentPath) {
    if (this.prefetchedComponents.has(componentPath)) {
      return;
    }

    this.prefetchedComponents.add(componentPath);

    // Use requestIdleCallback if available, otherwise setTimeout
    const scheduleWork = window.requestIdleCallback || ((callback) => setTimeout(callback, 1));

    scheduleWork(() => {
      import(componentPath).catch(error => {
        console.warn(`Failed to prefetch ${componentPath}:`, error);
      });
    });
  }

  // Setup intersection observer for lazy loading
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, using fallback');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;

            // Load images
            if (element.dataset.src) {
              this.loadImage(element);
            }

            // Prefetch components
            if (element.dataset.prefetch) {
              this.prefetchComponent(element.dataset.prefetch);
            }

            // Trigger custom load functions
            if (element.dataset.onload) {
              const loadFunction = new Function(element.dataset.onload);
              loadFunction();
            }

            this.observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }

  // Observe element for lazy loading
  observeElement(element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  // Load image when in viewport
  loadImage(imgElement) {
    const src = imgElement.dataset.src;
    if (src) {
      imgElement.src = src;
      imgElement.removeAttribute('data-src');

      imgElement.onload = () => {
        imgElement.classList.add('loaded');
      };
    }
  }

  // Smart caching system
  setCache(key, data, ttl = 3600000) { // Default 1 hour TTL
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, cacheEntry);

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to store cache in localStorage:', error);
    }
  }

  // Get cached data
  getCache(key) {
    // Check memory cache first
    const memoryCache = this.cache.get(key);
    if (memoryCache && this.isCacheValid(memoryCache)) {
      return memoryCache.data;
    }

    // Check localStorage cache
    try {
      const storedCache = localStorage.getItem(`cache_${key}`);
      if (storedCache) {
        const cacheEntry = JSON.parse(storedCache);
        if (this.isCacheValid(cacheEntry)) {
          // Restore to memory cache
          this.cache.set(key, cacheEntry);
          return cacheEntry.data;
        } else {
          // Remove expired cache
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve cache from localStorage:', error);
    }

    return null;
  }

  // Check if cache entry is still valid
  isCacheValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  // Clear expired cache entries
  clearExpiredCache() {
    // Clear memory cache
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.cache.delete(key);
      }
    }

    // Clear localStorage cache
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const cacheEntry = JSON.parse(localStorage.getItem(key));
          if (!this.isCacheValid(cacheEntry)) {
            keysToRemove.push(key);
          }
        } catch (error) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Cached API request
  async cachedRequest(url, options = {}, cacheKey = null, ttl = 300000) { // 5 min default TTL
    const key = cacheKey || `api_${url}_${JSON.stringify(options)}`;

    // Try to get from cache first
    const cachedData = this.getCache(key);
    if (cachedData) {
      return cachedData;
    }

    // Make API request
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the response
      this.setCache(key, data, ttl);

      return data;
    } catch (error) {
      console.error('Cached request failed:', error);
      throw error;
    }
  }

  // Setup service worker for caching
  setupServiceWorker() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  // Code splitting helper
  async loadFeature(featureName) {
    switch (featureName) {
      case 'charts':
        return import('../components/Charts');
      case 'calendar':
        return import('../components/Calendar');
      case 'editor':
        return import('../components/Editor');
      case 'maps':
        return import('../components/Map');
      case 'video':
        return import('../components/VideoPlayer');
      default:
        throw new Error(`Unknown feature: ${featureName}`);
    }
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }

  // Performance recommendations
  getRecommendations() {
    const recommendations = [];
    const metrics = this.getMetrics();

    if (metrics.loadTime > 3000) {
      recommendations.push('Consider optimizing initial bundle size');
    }

    if (metrics.firstContentfulPaint > 2000) {
      recommendations.push('Implement critical CSS inlining');
    }

    if (metrics.largestContentfulPaint > 4000) {
      recommendations.push('Optimize largest contentful paint elements');
    }

    if (metrics.firstInputDelay > 100) {
      recommendations.push('Reduce JavaScript execution time');
    }

    if (metrics.cumulativeLayoutShift > 0.25) {
      recommendations.push('Fix layout shifts with proper dimensions');
    }

    return recommendations;
  }

  // Debounce function for performance
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  // Throttle function for performance
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Virtual scrolling helper
  createVirtualScroll(items, itemHeight, containerHeight) {
    const totalHeight = items.length * itemHeight;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const bufferSize = 5;

    return {
      totalHeight,
      visibleCount,
      bufferSize,
      getVisibleRange: (scrollTop) => {
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(start + visibleCount + bufferSize, items.length);
        return { start: Math.max(0, start - bufferSize), end };
      }
    };
  }
}

// React components for lazy loading
export const LazyLoadWrapper = ({ children, fallback = null, className = '' }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Performance monitoring hook
export const usePerformance = () => {
  const [metrics, setMetrics] = React.useState({});

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceOptimizer.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// Cache hook for React components
export const useCache = (key, fetchFunction, ttl = 300000) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Try cache first
        const cachedData = performanceOptimizer.getCache(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        setLoading(true);
        const freshData = await fetchFunction();

        // Cache the result
        performanceOptimizer.setCache(key, freshData, ttl);

        setData(freshData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, fetchFunction, ttl]);

  return { data, loading, error };
};

// Create singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

export default performanceOptimizer;
