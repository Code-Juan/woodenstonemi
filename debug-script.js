/**
 * Enhanced Debug Script for The Wooden Stone Website
 * 
 * This script provides comprehensive debugging and performance monitoring
 * for the frontend application.
 */

// Debug configuration
const DEBUG_CONFIG = {
    enabled: true,
    logLevel: 'debug', // 'error', 'warn', 'info', 'debug'
    performanceMonitoring: true,
    errorTracking: true,
    consolePrefix: '🔍 [Wooden Stone Debug]'
};

// Debug logger
const debugLogger = {
    error: (message, ...args) => {
        if (DEBUG_CONFIG.enabled && ['error', 'warn', 'info', 'debug'].includes(DEBUG_CONFIG.logLevel)) {
            console.error(`${DEBUG_CONFIG.consolePrefix} ❌ ERROR:`, message, ...args);
        }
    },
    warn: (message, ...args) => {
        if (DEBUG_CONFIG.enabled && ['warn', 'info', 'debug'].includes(DEBUG_CONFIG.logLevel)) {
            console.warn(`${DEBUG_CONFIG.consolePrefix} ⚠️ WARN:`, message, ...args);
        }
    },
    info: (message, ...args) => {
        if (DEBUG_CONFIG.enabled && ['info', 'debug'].includes(DEBUG_CONFIG.logLevel)) {
            console.info(`${DEBUG_CONFIG.consolePrefix} ℹ️ INFO:`, message, ...args);
        }
    },
    debug: (message, ...args) => {
        if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.logLevel === 'debug') {
            console.log(`${DEBUG_CONFIG.consolePrefix} 🔍 DEBUG:`, message, ...args);
        }
    }
};

// Performance monitoring
const performanceMonitor = {
    marks: new Map(),
    measures: new Map(),
    
    start: (name) => {
        if (DEBUG_CONFIG.performanceMonitoring) {
            const startTime = performance.now();
            performanceMonitor.marks.set(name, startTime);
            debugLogger.debug(`Performance mark started: ${name}`);
        }
    },
    
    end: (name) => {
        if (DEBUG_CONFIG.performanceMonitoring && performanceMonitor.marks.has(name)) {
            const startTime = performanceMonitor.marks.get(name);
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            performanceMonitor.measures.set(name, duration);
            debugLogger.debug(`Performance mark ended: ${name} (${duration.toFixed(2)}ms)`);
            
            if (duration > 100) { // Log slow operations
                debugLogger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
            }
            
            performanceMonitor.marks.delete(name);
        }
    },
    
    measure: (name, callback) => {
        return async (...args) => {
            performanceMonitor.start(name);
            try {
                const result = await callback(...args);
                performanceMonitor.end(name);
                return result;
            } catch (error) {
                performanceMonitor.end(name);
                throw error;
            }
        };
    }
};

// Error tracking
const errorTracker = {
    errors: [],
    warnings: [],
    
    trackError: (error, context = {}) => {
        if (DEBUG_CONFIG.errorTracking) {
            const errorInfo = {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                context
            };
            
            errorTracker.errors.push(errorInfo);
            debugLogger.error('Error tracked:', errorInfo);
            
            // Log to console for immediate visibility
            console.error('🚨 Error occurred:', error);
            console.error('Context:', context);
        }
    },
    
    trackWarning: (message, context = {}) => {
        if (DEBUG_CONFIG.errorTracking) {
            const warningInfo = {
                message,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                context
            };
            
            errorTracker.warnings.push(warningInfo);
            debugLogger.warn('Warning tracked:', warningInfo);
        }
    },
    
    getStats: () => {
        return {
            totalErrors: errorTracker.errors.length,
            totalWarnings: errorTracker.warnings.length,
            errors: errorTracker.errors,
            warnings: errorTracker.warnings
        };
    }
};

// Global error handler
window.addEventListener('error', (event) => {
    errorTracker.trackError(event.error, {
        type: 'unhandled',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    errorTracker.trackError(new Error(event.reason), {
        type: 'unhandledrejection'
    });
});

// Initialize debug system
debugLogger.info('Debug system initialized');
debugLogger.info('Performance monitoring:', DEBUG_CONFIG.performanceMonitoring ? 'enabled' : 'disabled');
debugLogger.info('Error tracking:', DEBUG_CONFIG.errorTracking ? 'enabled' : 'disabled');

// Theme toggle with localStorage and debug logging
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

performanceMonitor.measure('theme-initialization', () => {
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        debugLogger.debug('Theme restored from localStorage:', savedTheme);
    } else {
        debugLogger.debug('No saved theme found, using default');
    }
})();

themeToggle.addEventListener('click', performanceMonitor.measure('theme-toggle', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    debugLogger.debug('Theme toggled to:', currentTheme);
}));

// Set current year in footer with debug logging
performanceMonitor.measure('footer-year-update', () => {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
        debugLogger.debug('Footer year updated');
    } else {
        debugLogger.warn('Year element not found in footer');
    }
})();

// Progressive image loading for better UX with performance monitoring
function initProgressiveImageLoading() {
    debugLogger.info('Initializing progressive image loading');
    
    const images = document.querySelectorAll('img[data-src]');
    debugLogger.debug(`Found ${images.length} images with data-src attributes`);

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const highResSrc = img.getAttribute('data-src');

                if (highResSrc) {
                    performanceMonitor.measure(`image-load-${path.basename(highResSrc)}`, async () => {
                        // Load high-res image
                        const highResImg = new Image();
                        
                        highResImg.onload = () => {
                            img.src = highResSrc;
                            img.classList.add('loaded');
                            img.removeAttribute('data-src');
                            debugLogger.debug(`High-res image loaded: ${path.basename(highResSrc)}`);
                        };
                        
                        highResImg.onerror = () => {
                            errorTracker.trackWarning(`Failed to load high-res image: ${highResSrc}`);
                        };
                        
                        highResImg.src = highResSrc;
                    })();
                }

                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
    debugLogger.info('Progressive image loading initialized');
}

// Image optimization and compression detection with enhanced logging
function initImageOptimization() {
    debugLogger.info('Initializing image optimization monitoring');
    
    // Check if images are properly optimized
    const images = document.querySelectorAll('img');
    debugLogger.debug(`Found ${images.length} total images on page`);

    let largeImages = 0;
    let optimizedImages = 0;

    images.forEach(img => {
        img.addEventListener('load', () => {
            // Log large images for optimization review
            if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
                largeImages++;
                debugLogger.warn('Large image detected:', {
                    src: img.src,
                    dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
                    fileSize: img.src.length // Rough estimate
                });
            } else {
                optimizedImages++;
            }
            
            // Check for missing alt attributes
            if (!img.alt) {
                errorTracker.trackWarning(`Image missing alt attribute: ${img.src}`);
            }
        });
        
        img.addEventListener('error', () => {
            errorTracker.trackError(new Error(`Image failed to load: ${img.src}`), {
                type: 'image-load-error',
                src: img.src
            });
        });
    });
    
    debugLogger.info('Image optimization monitoring initialized', {
        totalImages: images.length,
        largeImages,
        optimizedImages
    });
}

// Navigation preloading and loading states with performance tracking
function initNavigationOptimization() {
    debugLogger.info('Initializing navigation optimization');
    
    const navLinks = document.querySelectorAll('nav a');
    debugLogger.debug(`Found ${navLinks.length} navigation links`);

    let preloadedPages = 0;

    // Preload pages on hover
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', performanceMonitor.measure('nav-preload', () => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#')) {
                const linkElement = document.createElement('link');
                linkElement.rel = 'prefetch';
                linkElement.href = href;
                document.head.appendChild(linkElement);
                preloadedPages++;
                debugLogger.debug(`Preloaded page: ${href}`);
            }
        }));

        // Add loading state on click
        link.addEventListener('click', performanceMonitor.measure('nav-click', (e) => {
            // Only add loading state for external page navigation
            if (link.hostname === window.location.hostname || !link.hostname) {
                // Add a subtle loading indicator
                document.body.style.cursor = 'wait';
                debugLogger.debug('Navigation started, showing loading state');

                // Remove loading state after a short delay (in case of fast loading)
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    debugLogger.debug('Loading state removed');
                }, 1000);
            }
        });
    });
    
    debugLogger.info('Navigation optimization initialized', {
        totalLinks: navLinks.length,
        preloadedPages
    });
}

// Hero slideshow functionality with debug logging
function initSlideshow() {
    debugLogger.info('Initializing hero slideshow');
    
    const slides = document.querySelectorAll('.slide');
    debugLogger.debug(`Found ${slides.length} slides`);
    
    if (slides.length === 0) {
        debugLogger.warn('No slides found for slideshow');
        return;
    }

    let currentSlide = 0;
    let slideshowInterval;

    function nextSlide() {
        performanceMonitor.measure('slide-transition', () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
            debugLogger.debug(`Advanced to slide ${currentSlide + 1}/${slides.length}`);
        })();
    }

    function prevSlide() {
        performanceMonitor.measure('slide-transition', () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            debugLogger.debug(`Moved to previous slide ${currentSlide + 1}/${slides.length}`);
        })();
    }

    // Auto-advance slides
    function startSlideshow() {
        slideshowInterval = setInterval(nextSlide, 5000);
        debugLogger.debug('Slideshow auto-advance started (5s interval)');
    }

    function stopSlideshow() {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
            debugLogger.debug('Slideshow auto-advance stopped');
        }
    }

    // Initialize first slide
    if (slides.length > 0) {
        slides[0].classList.add('active');
        debugLogger.debug('First slide activated');
    }

    // Start auto-advance
    startSlideshow();

    // Pause on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => {
            stopSlideshow();
            debugLogger.debug('Slideshow paused on hover');
        });

        slideshowContainer.addEventListener('mouseleave', () => {
            startSlideshow();
            debugLogger.debug('Slideshow resumed after hover');
        });
    }

    // Navigation buttons
    const prevButton = document.querySelector('.slideshow-nav .prev');
    const nextButton = document.querySelector('.slideshow-nav .next');

    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            stopSlideshow();
            prevSlide();
            startSlideshow();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            stopSlideshow();
            nextSlide();
            startSlideshow();
        });
    }

    debugLogger.info('Hero slideshow initialized successfully');
}

// Form validation with debug logging
function initFormValidation() {
    debugLogger.info('Initializing form validation');
    
    const forms = document.querySelectorAll('form');
    debugLogger.debug(`Found ${forms.length} forms on page`);

    forms.forEach((form, index) => {
        debugLogger.debug(`Setting up validation for form ${index + 1}:`, form.action || 'no action');

        form.addEventListener('submit', performanceMonitor.measure('form-submission', (e) => {
            debugLogger.debug('Form submission started');
            
            // Basic validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            const errors = [];

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    errors.push(`${field.name || field.id || 'Unknown field'} is required`);
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
                errorTracker.trackWarning('Form validation failed', { errors });
                debugLogger.warn('Form validation failed:', errors);
                return false;
            }

            debugLogger.info('Form validation passed, submitting...');
        }));
    });
    
    debugLogger.info('Form validation initialized');
}

// Performance monitoring for page load
function initPageLoadMonitoring() {
    debugLogger.info('Initializing page load monitoring');
    
    // Monitor page load performance
    window.addEventListener('load', () => {
        performanceMonitor.measure('page-load-complete', () => {
            const loadTime = performance.now();
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            
            debugLogger.info('Page load completed', {
                totalLoadTime: `${loadTime.toFixed(2)}ms`,
                domContentLoaded: `${navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart}ms`,
                loadEvent: `${navigationTiming.loadEventEnd - navigationTiming.loadEventStart}ms`
            });
            
            // Log resource loading performance
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(r => r.duration > 1000);
            
            if (slowResources.length > 0) {
                debugLogger.warn('Slow resources detected:', slowResources.map(r => ({
                    name: r.name,
                    duration: `${r.duration.toFixed(2)}ms`
                })));
            }
        })();
    });
}

// Initialize all debug features
performanceMonitor.measure('debug-system-initialization', () => {
    debugLogger.info('Starting debug system initialization');
    
    // Initialize all components
    initProgressiveImageLoading();
    initImageOptimization();
    initNavigationOptimization();
    initSlideshow();
    initFormValidation();
    initPageLoadMonitoring();
    
    debugLogger.info('Debug system initialization completed');
})();

// Expose debug utilities globally for console access
window.debugUtils = {
    logger: debugLogger,
    performance: performanceMonitor,
    errors: errorTracker,
    config: DEBUG_CONFIG,
    getStats: () => ({
        performance: performanceMonitor.measures,
        errors: errorTracker.getStats(),
        config: DEBUG_CONFIG
    })
};

debugLogger.info('Debug utilities exposed to window.debugUtils');
