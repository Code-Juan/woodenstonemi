// Theme toggle with localStorage
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
});

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Progressive image loading for better UX
function initProgressiveImageLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const highResSrc = img.getAttribute('data-src');

                if (highResSrc) {
                    // Load high-res image
                    const highResImg = new Image();
                    highResImg.onload = () => {
                        img.src = highResSrc;
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                    };
                    highResImg.src = highResSrc;
                }

                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Image optimization and compression detection
function initImageOptimization() {
    // Check if images are properly optimized
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.addEventListener('load', () => {
            // Log large images for optimization review
            if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
                console.warn('Large image detected:', img.src,
                    `${img.naturalWidth}x${img.naturalHeight}`);
            }
        });
    });
}

// Navigation preloading and loading states
function initNavigationOptimization() {
    const navLinks = document.querySelectorAll('nav a');

    // Preload pages on hover
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#')) {
                const linkElement = document.createElement('link');
                linkElement.rel = 'prefetch';
                linkElement.href = href;
                document.head.appendChild(linkElement);
            }
        });

        // Add loading state on click
        link.addEventListener('click', (e) => {
            // Only add loading state for external page navigation
            if (link.hostname === window.location.hostname || !link.hostname) {
                // Add a subtle loading indicator
                document.body.style.cursor = 'wait';

                // Remove loading state after a short delay (in case of fast loading)
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                }, 1000);
            }
        });
    });
}

// Hero slideshow functionality
function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Change slide every 4 seconds
    setInterval(nextSlide, 4000);
}

// Initialize slideshow when DOM is loaded
document.addEventListener('DOMContentLoaded', initSlideshow);

// Back to top button functionality
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');

    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top when button is clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
    initBackToTop();
    initNavigationOptimization();
    initProgressiveImageLoading();
    initImageOptimization();
});
