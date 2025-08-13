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

// Project Portfolio Carousel functionality
function initProjectCarousels() {
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');

        let currentSlide = 0;
        const totalSlides = slides.length;

        // Determine how many slides to show based on screen size
        function getSlidesToShow() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        // Function to update carousel position
        function updateCarousel() {
            const slidesToShow = getSlidesToShow();
            const slideWidth = 100 / slidesToShow;
            track.style.transform = `translateX(-${currentSlide * slideWidth}%)`;

            // Update active slide class
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index >= currentSlide && index < currentSlide + slidesToShow);
            });

            // Show/hide navigation arrows based on position
            if (prevBtn) {
                prevBtn.style.display = currentSlide === 0 ? 'none' : 'flex';
            }

            if (nextBtn) {
                const maxSlide = Math.max(0, totalSlides - slidesToShow);
                nextBtn.style.display = currentSlide >= maxSlide ? 'none' : 'flex';
            }
        }

        // Function to go to next slide
        function nextSlide() {
            const slidesToShow = getSlidesToShow();
            const maxSlide = Math.max(0, totalSlides - slidesToShow);

            if (currentSlide < maxSlide) {
                currentSlide++;
                updateCarousel();
            }
        }

        // Function to go to previous slide
        function prevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateCarousel();
            }
        }

        // Event listeners for navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }

        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let endX = 0;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    nextSlide(); // Swipe left
                } else {
                    prevSlide(); // Swipe right
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            updateCarousel();
        });

        // Initialize carousel
        updateCarousel();
    });
}

// Image Modal/Lightbox functionality
function initImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.getElementById('modalClose');
    const zoomLens = document.getElementById('zoomLens');
    const zoomResult = document.getElementById('zoomResult');
    const imageContainer = document.querySelector('.modal-image-container');

    // Function to open modal
    function openModal(imageSrc, imageAlt) {
        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Initialize zoom after image loads
        modalImage.onload = function () {
            initZoom();
        };
    }

    // Function to close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        // Hide zoom lens
        zoomLens.style.display = 'none';
    }

    // Zoom functionality
    function initZoom() {
        const img = modalImage;
        const lens = zoomLens;
        const result = zoomResult;

        console.log('Initializing zoom for image:', img.src);

        // Wait for image to load completely
        if (img.complete && img.naturalWidth > 0) {
            console.log('Image already loaded, setting up zoom');
            setupZoom();
        } else {
            console.log('Waiting for image to load...');
            img.onload = function () {
                console.log('Image loaded, setting up zoom');
                setupZoom();
            };
            img.onerror = function () {
                console.error('Failed to load image:', img.src);
            };
        }

        function setupZoom() {
            const zoomRatio = 8;
            console.log('Setting up zoom with ratio:', zoomRatio);
            console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);

            // Mouse move event for zoom
            imageContainer.addEventListener('mousemove', function (e) {
                e.preventDefault();

                // Get cursor position relative to image
                const rect = img.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Check if cursor is within image bounds
                if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                    lens.style.display = 'none';
                    return;
                }

                // Calculate lens position
                const lensX = x - lens.offsetWidth / 2;
                const lensY = y - lens.offsetHeight / 2;

                // Prevent lens from going outside image bounds
                const maxLensX = rect.width - lens.offsetWidth;
                const maxLensY = rect.height - lens.offsetHeight;

                lens.style.left = Math.max(0, Math.min(lensX, maxLensX)) + 'px';
                lens.style.top = Math.max(0, Math.min(lensY, maxLensY)) + 'px';

                // Calculate zoom position using percentage of image dimensions
                const zoomX = (x / rect.width) * 100;
                const zoomY = (y / rect.height) * 100;

                // Use background positioning for the lens (more reliable)
                const backgroundSize = `${zoomRatio * 100}%`;
                const backgroundPosition = `${zoomX}% ${zoomY}%`;

                // Set the lens background
                lens.style.backgroundImage = `url("${img.src}")`;
                lens.style.backgroundPosition = backgroundPosition;
                lens.style.backgroundSize = backgroundSize;

                // Show the lens
                lens.style.display = 'block';
            });

            // Hide zoom elements when mouse leaves
            imageContainer.addEventListener('mouseleave', function () {
                lens.style.display = 'none';
            });

            // Show zoom elements when mouse enters
            imageContainer.addEventListener('mouseenter', function () {
                lens.style.display = 'block';
            });
        }
    }

    // Event listeners for modal
    modalClose.addEventListener('click', closeModal);

    // Close modal when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Function to add click listeners to carousel images (for dynamic content)
    function addImageClickListeners() {
        const carouselImages = document.querySelectorAll('.carousel-slide img');
        carouselImages.forEach(img => {
            // Remove any existing listeners to prevent duplicates
            img.removeEventListener('click', handleImageClick);
            img.addEventListener('click', handleImageClick);
        });
    }

    // Handle image click for modal
    function handleImageClick() {
        openModal(this.src, this.alt);
    }

    // Add click listeners to existing images (if any)
    addImageClickListeners();

    // Make the function available globally for projects-data.js to call
    window.addImageClickListeners = addImageClickListeners;
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
    initBackToTop();
    initNavigationOptimization();
    initProgressiveImageLoading();
    initImageOptimization();
    // initProjectCarousels(); // Disabled - using projects-data.js carousel instead
    initImageModal();
});
