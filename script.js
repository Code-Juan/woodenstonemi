// Responsive Navigation System
document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');

    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function () {
            nav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');

            // Update ARIA attributes for accessibility
            const isExpanded = nav.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);

            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                nav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!nav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                nav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // Handle window resize for responsive behavior
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            // Close mobile menu on larger screens
            if (window.innerWidth > 768) {
                if (nav) nav.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
                document.body.style.overflow = '';
            }
        }, 250);
    });

    // Add skip link for accessibility
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content ID if not present
    const mainContent = document.querySelector('main') || document.querySelector('.hero-container');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
});

// Responsive image loading with intersection observer
function setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
}

// Responsive container queries support
function setupContainerQueries() {
    if ('container-type' in document.documentElement.style) {
        // Add container-type to elements that need it
        const containers = document.querySelectorAll('.service-card, .portfolio-item, .testimonial-card');
        containers.forEach(container => {
            container.style.containerType = 'inline-size';
        });
    }
}

// Initialize responsive features
// Moved to main DOMContentLoaded listener

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Function to get random images from Previous Jobs folders
function getRandomInteriorImages(count = 6) {
    // Define patterns to exclude (building/site overview images)
    const excludePatterns = [
        'site', 'building', 'overview', 'BLDG', 'parking', 'indiana', 'rendering'
    ];

    // Collect all images from Previous Jobs
    const allImages = [];

    // Check if projectsData is available (from projects-data.js)
    if (typeof projectsData !== 'undefined') {
        projectsData.forEach(project => {
            if (project.images && Array.isArray(project.images)) {
                project.images.forEach(imagePath => {
                    // Skip placeholder images
                    if (imagePath === 'placeholder') return;

                    const lowerPath = imagePath.toLowerCase();

                    // Check if it should be excluded (site/building overviews)
                    const shouldExclude = excludePatterns.some(pattern =>
                        lowerPath.includes(pattern)
                    );

                    if (!shouldExclude) {
                        allImages.push({
                            src: imagePath,
                            alt: `${project.name} - Project View`,
                            projectName: project.name
                        });
                    }
                });
            }
        });
    }

    // If we don't have enough images, add some fallback images from Previous Jobs
    if (allImages.length < count) {
        const fallbackImages = [
            {
                src: "images/Previous Jobs/1. Woodview Commons/(Kitchen 1) woodview-commons-ann-arbor-mi-building-photo.jpg",
                alt: "Woodview Commons Kitchen",
                projectName: "WOODVIEW COMMONS FLATS"
            },
            {
                src: "images/Previous Jobs/1. Woodview Commons/(Bath 1) woodview-commons-ann-arbor-mi-building-photo.jpg",
                alt: "Woodview Commons Bathroom",
                projectName: "WOODVIEW COMMONS FLATS"
            },
            {
                src: "images/Previous Jobs/4. 3740 2nd Ave Apartments/Kitchen1 VIEW_3740 Apartments.jpg",
                alt: "3740 2nd Ave Kitchen",
                projectName: "3740 2ND AVE APARTMENTS"
            },
            {
                src: "images/Previous Jobs/4. 3740 2nd Ave Apartments/bath1 VIEW_3740 Apartments.jpg",
                alt: "3740 2nd Ave Bathroom",
                projectName: "3740 2ND AVE APARTMENTS"
            },
            {
                src: "images/Previous Jobs/19. Higgenbotham Garden Apartments/view-of-kitchen.jpg",
                alt: "Higgenbotham Garden Apartments Kitchen",
                projectName: "HIGGENBOTHAM GARDEN APARTMENTS"
            },
            {
                src: "images/Previous Jobs/20. Higgenbotham School Apartments/commons-render.jpg",
                alt: "Higgenbotham School Apartments Commons",
                projectName: "HIGGENBOTHAM SCHOOL APARTMENTS"
            }
        ];

        // Add fallback images that aren't already in the list
        fallbackImages.forEach(fallback => {
            const exists = allImages.some(img => img.src === fallback.src);
            if (!exists) {
                allImages.push(fallback);
            }
        });
    }

    // Shuffle the array and return the requested number of images
    const shuffled = allImages.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to update slideshow with random images from Previous Jobs
function updateSlideshowWithRandomImages() {
    const slideshowContainer = document.querySelector('.hero-slideshow .slideshow-container');
    if (!slideshowContainer) {
        return;
    }

    const slidesContainer = slideshowContainer.querySelector('.slides');
    if (!slidesContainer) {
        return;
    }

    // Get random images from Previous Jobs
    const randomImages = getRandomInteriorImages(6);

    // Clear existing slides
    slidesContainer.innerHTML = '';

    // Create new slides with random images
    randomImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';

        // Create image element with responsive srcset
        const img = document.createElement('img');
        img.alt = image.alt;
        img.loading = 'lazy';

        // Get the base path and extension
        const basePath = image.src.replace(/\.(jpg|png|webp)$/, '');
        const extension = image.src.match(/\.(jpg|png|webp)$/)?.[1] || 'jpg';

        // Create responsive srcset with all 4 versions
        const srcset = [
            `${basePath}-thumb.${extension} 400w`,
            `${basePath}-gallery.${extension} 800w`,
            `${basePath}-hero.${extension} 1200w`,
            `${basePath}.${extension} 1600w`
        ].filter(src => src.includes('400w') || src.includes('800w') || src.includes('1200w') || src.includes('1600w')).join(', ');

        // For now, use the original image to ensure it loads
        img.src = image.src;



        // Remove srcset and sizes for now to avoid parsing errors
        // img.srcset = srcset;
        // img.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

        // Don't lazy-load hero images
        img.loading = 'eager';

        // Handle image load errors
        img.onerror = function () {
            console.warn(`Failed to load image: ${image.src}`);
            // Add a fallback background or placeholder
            this.style.backgroundColor = 'var(--marble)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.color = 'var(--slate)';
            this.style.fontSize = '1rem';
            this.alt = 'Image not available';
        };

        slide.appendChild(img);
        slidesContainer.appendChild(slide);
    });

    // Make sure the first slide is active
    const firstSlide = slidesContainer.querySelector('.slide');
    if (firstSlide) {
        firstSlide.classList.add('active');
    }

    // Don't reinitialize here - it's called later

    // Add fallback content if no images were loaded
    if (slidesContainer.children.length === 0) {
        const fallbackSlide = document.createElement('div');
        fallbackSlide.className = 'slide active';
        fallbackSlide.innerHTML = '<div style="width: 100%; height: 100%; background-color: var(--marble); display: flex; align-items: center; justify-content: center; color: var(--slate); font-size: 1.2rem;">Loading slideshow...</div>';
        slidesContainer.appendChild(fallbackSlide);
    }
}

// Function to update slideshow image sizes based on current viewport
function updateSlideshowImageSizes() {
    const slides = document.querySelectorAll('.slide img');
    const viewportWidth = window.innerWidth;

    slides.forEach(img => {
        const currentSrc = img.src;
        const basePath = currentSrc.replace(/-(thumb|gallery|hero)\.(jpg|png|webp)$/, '');
        const extension = currentSrc.match(/\.(jpg|png|webp)$/)?.[1] || 'jpg';

        let newSrc = currentSrc;

        if (viewportWidth <= 768) {
            // Mobile: use thumb version
            newSrc = `${basePath}-thumb.${extension}`;
        } else if (viewportWidth <= 1024) {
            // Tablet: use gallery version
            newSrc = `${basePath}-gallery.${extension}`;
        } else if (viewportWidth <= 1440) {
            // Desktop: use hero version
            newSrc = `${basePath}-hero.${extension}`;
        } else {
            // Large desktop: use full version
            newSrc = `${basePath}.${extension}`;
        }

        // Only update if the src is different
        if (newSrc !== currentSrc) {
            img.src = newSrc;
        }
    });
}

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

    // Ensure we have slides to work with
    if (slides.length === 0) {
        updateSlideshowWithRandomImages();
        // Wait a bit for slides to be created, then reinitialize
        setTimeout(() => {
            const newSlides = document.querySelectorAll('.slide');
            if (newSlides.length > 0) {
                initSlideshow();
            }
        }, 100);
        return;
    }

    // Make sure first slide is active
    slides.forEach((slide, index) => {
        if (index === 0) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    function nextSlide() {
        if (slides.length === 0) return;

        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Handle mobile vs desktop timing
    const baseInterval = window.innerWidth <= 768 ? 6000 : 4000;
    let slideshowTimer = setInterval(nextSlide, baseInterval);

    // Handle window resize for timing changes
    window.addEventListener('resize', () => {
        clearInterval(slideshowTimer);
        const newInterval = window.innerWidth <= 768 ? 6000 : 4000;
        slideshowTimer = setInterval(nextSlide, newInterval);
    });

    // Update image sizes when window is resized
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateSlideshowImageSizes();
        }, 250);
    });
}

// Initialize slideshow when DOM is loaded
// Moved to main DOMContentLoaded listener

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

    // Check if modal elements exist before proceeding
    if (!modal || !modalImage || !modalClose) {
        return;
    }

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

        // Wait for image to load completely
        if (img.complete && img.naturalWidth > 0) {
            setupZoom();
        } else {
            img.onload = function () {
                setupZoom();
            };
            img.onerror = function () {
                console.error('Failed to load image:', img.src);
            };
        }

        function setupZoom() {
            const zoomRatio = 8;

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
    // Initialize responsive features
    setupResponsiveImages();
    setupContainerQueries();

    // Initialize slideshow only if slideshow container exists (homepage only)
    const slideshowContainer = document.querySelector('.hero-slideshow .slideshow-container');
    if (slideshowContainer) {
        updateSlideshowWithRandomImages();
        initSlideshow();
    }

    // Initialize other features
    initBackToTop();
    initNavigationOptimization();
    initProgressiveImageLoading();
    initImageOptimization();
    // initProjectCarousels(); // Disabled - using projects-data.js carousel instead
    initImageModal();
});
