// Responsive Navigation System
document.addEventListener('DOMContentLoaded', function () {
    // Set current page indicator
    setCurrentPageIndicator();

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

        // Close menu when clicking on a link (but not current page)
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                // Don't close menu if clicking on current page link
                if (link.classList.contains('current-page')) {
                    e.preventDefault();
                    return;
                }

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

// Set current page indicator in navigation
function setCurrentPageIndicator() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPage = getCurrentPage();

    navLinks.forEach(link => {
        const linkPage = getPageFromHref(link.getAttribute('href'));
        if (linkPage === currentPage) {
            link.classList.add('current-page');
            link.setAttribute('aria-current', 'page');
            link.setAttribute('tabindex', '-1'); // Make it non-focusable
        }
    });
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    // Map filenames to page names
    const pageMap = {
        'index.html': 'home',
        'main.html': 'home',
        'what-we-do.html': 'what-we-do',
        'scopes-materials.html': 'scopes-materials',
        'project-portfolio.html': 'project-portfolio',
        'contact-us.html': 'contact-us'
    };

    return pageMap[filename] || 'home';
}

// Get page name from href
function getPageFromHref(href) {
    if (!href) return '';

    const filename = href.split('/').pop();

    // Map filenames to page names
    const pageMap = {
        'index.html': 'home',
        'main.html': 'home',
        'what-we-do.html': 'what-we-do',
        'scopes-materials.html': 'scopes-materials',
        'project-portfolio.html': 'project-portfolio',
        'contact-us.html': 'contact-us'
    };

    return pageMap[filename] || '';
}

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

        // Get the base path and extension correctly
        let basePath, extension;

        if (image.src.match(/-(thumb|gallery|hero)\.(jpg|png|webp|avif)$/)) {
            // If the image src already has a suffix, remove it to get the base
            basePath = image.src.replace(/-(thumb|gallery|hero)\.(jpg|png|webp|avif)$/, '');
            extension = image.src.match(/\.(jpg|png|webp|avif)$/)?.[1] || 'jpg';
        } else {
            // If no suffix, extract the base path and extension
            const match = image.src.match(/^(.+)\.(jpg|png|webp|avif)$/);
            if (match) {
                basePath = match[1];
                extension = match[2];
            } else {
                // Fallback if we can't parse the filename
                basePath = image.src.replace(/\.(jpg|png|webp|avif)$/, '');
                extension = 'jpg';
            }
        }

        // Create responsive srcset with all 4 versions (skip for .avif files)
        let srcset = '';
        if (extension !== 'avif') {
            srcset = [
                `${basePath}-thumb.${extension} 400w`,
                `${basePath}-gallery.${extension} 800w`,
                `${basePath}-hero.${extension} 1200w`,
                `${basePath}.${extension} 1600w`
            ].filter(src => src.includes('400w') || src.includes('800w') || src.includes('1200w') || src.includes('1600w')).join(', ');
        }

        // Use the original image to ensure it loads
        img.src = image.src;



        // Remove srcset and sizes for now to avoid parsing errors
        // img.srcset = srcset;
        // img.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

        // Don't lazy-load hero images
        img.loading = 'eager';

        // Handle image load errors
        img.onerror = function () {
            // Add a fallback background or placeholder
            this.style.backgroundColor = 'var(--marble)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.color = 'var(--slate)';
            this.style.fontSize = '1rem';
            this.alt = 'Image not available';

            // Try to load the base image if this was a responsive version
            if (image.src.includes('-thumb.') || image.src.includes('-gallery.') || image.src.includes('-hero.')) {
                const basePath = image.src.replace(/-(thumb|gallery|hero)\.(jpg|png|webp|avif)$/, '');
                const extension = image.src.match(/\.(jpg|png|webp|avif)$/)?.[1] || 'jpg';
                const baseImage = `${basePath}.${extension}`;

                if (baseImage !== image.src) {
                    this.src = baseImage;
                }
            }
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

// Function to check if an image exists
function imageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Cache for responsive image availability
const responsiveImageCache = new Map();

// Function to check if responsive versions exist for a base image
async function checkResponsiveVersions(basePath, extension) {
    const cacheKey = `${basePath}.${extension}`;

    if (responsiveImageCache.has(cacheKey)) {
        return responsiveImageCache.get(cacheKey);
    }

    const versions = {
        thumb: false,
        gallery: false,
        hero: false
    };

    // Check each version
    versions.thumb = await imageExists(`${basePath}-thumb.${extension}`);
    versions.gallery = await imageExists(`${basePath}-gallery.${extension}`);
    versions.hero = await imageExists(`${basePath}-hero.${extension}`);

    responsiveImageCache.set(cacheKey, versions);
    return versions;
}

// Function to update slideshow image sizes based on current viewport
async function updateSlideshowImageSizes() {
    const slides = document.querySelectorAll('.slide img');
    const viewportWidth = window.innerWidth;

    for (const img of slides) {
        const currentSrc = img.src;

        // Extract the base path and extension correctly
        // Handle files that already have -thumb, -gallery, or -hero suffixes
        let basePath, extension;

        if (currentSrc.match(/-(thumb|gallery|hero)\.(jpg|png|webp|avif)$/)) {
            // If the current src already has a suffix, remove it to get the base
            basePath = currentSrc.replace(/-(thumb|gallery|hero)\.(jpg|png|webp|avif)$/, '');
            extension = currentSrc.match(/\.(jpg|png|webp|avif)$/)?.[1] || 'jpg';
        } else {
            // If no suffix, extract the base path and extension
            const match = currentSrc.match(/^(.+)\.(jpg|png|webp|avif)$/);
            if (match) {
                basePath = match[1];
                extension = match[2];
            } else {
                // Fallback if we can't parse the filename
                basePath = currentSrc.replace(/\.(jpg|png|webp|avif)$/, '');
                extension = 'jpg';
            }
        }

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
            // For .avif files, don't try responsive versions as they don't exist
            if (extension === 'avif') {
                return;
            }

            // Check if the responsive version exists before using it
            const exists = await imageExists(newSrc);
            if (exists) {
                img.src = newSrc;
            } else {
                // If responsive version doesn't exist, try to use the base image
                const baseImage = `${basePath}.${extension}`;
                if (baseImage !== currentSrc) {
                    const baseExists = await imageExists(baseImage);
                    if (baseExists) {
                        img.src = baseImage;
                    } else {
                        // If neither exists, keep the current src
                    }
                } else {
                    // Keep current src if responsive version not found
                }
            }
        }
    }
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

    // Initialize image sizes for current viewport
    updateSlideshowImageSizes();

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
        resizeTimer = setTimeout(async () => {
            await updateSlideshowImageSizes();
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
    document.querySelectorAll('.carousel-container').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = [...carousel.querySelectorAll('.carousel-slide')];
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');

        if (!track || slides.length === 0) return;

        const slidesToShow = () =>
            window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

        const stepPx = () => {
            // Get the exact width of one slide including padding and margins
            const first = slides[0];
            if (!first) return 0;

            const rect = first.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(first);

            // Include padding and margins for precise calculation
            const paddingLeft = parseFloat(computedStyle.paddingLeft);
            const paddingRight = parseFloat(computedStyle.paddingRight);
            const marginLeft = parseFloat(computedStyle.marginLeft);
            const marginRight = parseFloat(computedStyle.marginRight);

            return Math.round(rect.width + paddingLeft + paddingRight + marginLeft + marginRight);
        };

        const maxIndex = () => Math.max(0, slides.length - slidesToShow());
        const curIndex = () => {
            const step = stepPx();
            return step > 0 ? Math.round(track.scrollLeft / step) : 0;
        };

        const updateArrows = () => {
            const i = curIndex();
            const max = maxIndex();

            // Update arrow visibility
            if (prevBtn) {
                prevBtn.style.display = i <= 0 ? 'none' : 'flex';
                prevBtn.style.opacity = i <= 0 ? '0' : '1';
            }
            if (nextBtn) {
                nextBtn.style.display = i >= max ? 'none' : 'flex';
                nextBtn.style.opacity = i >= max ? '0' : '1';
            }
        };

        // Navigation functions
        const next = () => {
            const current = curIndex();
            const max = maxIndex();
            if (current < max) {
                const step = stepPx();
                track.scrollBy({ left: step, behavior: 'smooth' });
            }
        };

        const prev = () => {
            const current = curIndex();
            if (current > 0) {
                const step = stepPx();
                track.scrollBy({ left: -step, behavior: 'smooth' });
            }
        };

        // Event listeners
        nextBtn?.addEventListener('click', next);
        prevBtn?.addEventListener('click', prev);

        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });

        // Touch/swipe support
        let startX = 0;
        let startScrollLeft = 0;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startScrollLeft = track.scrollLeft;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            const threshold = stepPx() * 0.3; // 30% of slide width to trigger

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    next(); // Swipe left
                } else {
                    prev(); // Swipe right
                }
            }
        }, { passive: true });

        // Keep arrows in sync while user drags/swipes
        track.addEventListener('scroll', () => {
            requestAnimationFrame(updateArrows);
        }, { passive: true });

        // Handle resize with proper snapping
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const current = curIndex();
                const step = stepPx();
                const targetScroll = current * step;

                // Snap to the correct position
                track.scrollTo({
                    left: targetScroll,
                    behavior: 'auto'
                });

                updateArrows();
            }, 150);
        });

        // Initial setup
        updateArrows();
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
                // Handle image load error silently
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

    // Wait until a carousel shows up, then initialize once
    const ready = () => document.querySelector('.carousel-container .carousel-track');
    if (ready()) {
        initProjectCarousels();
    } else {
        const mo = new MutationObserver(() => {
            if (ready()) {
                mo.disconnect();
                initProjectCarousels();
            }
        });
        mo.observe(document.getElementById('projects-container') || document.body, { childList: true, subtree: true });
    }

    initImageModal();

    // Initialize file upload functionality
    initFileUpload();

    // Initialize contact form functionality
    initContactForm();
});

// File Upload Functionality
function initFileUpload() {
    const fileInput = document.getElementById('attachments');
    const fileList = document.getElementById('file-list');

    if (!fileInput || !fileList) return;

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const acceptedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'application/acad',
        'image/vnd.dwg',
        'application/zip',
        'application/x-rar-compressed'
    ];

    fileInput.addEventListener('change', function (e) {
        const files = Array.from(e.target.files);
        fileList.innerHTML = '';

        files.forEach((file, index) => {
            // Validate file size
            if (file.size > maxFileSize) {
                alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }

            // Validate file type
            if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png|gif|bmp|tiff|dwg|dxf|zip|rar)$/i)) {
                alert(`File "${file.name}" is not an accepted file type.`);
                return;
            }

            // Create file item element
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
                <button type="button" class="remove-file" onclick="removeFile(${index})" title="Remove file">×</button>
            `;

            fileList.appendChild(fileItem);
        });
    });
}

// Remove file from the list
function removeFile(index) {
    const fileInput = document.getElementById('attachments');
    const fileList = document.getElementById('file-list');

    if (!fileInput || !fileList) return;

    // Create a new FileList without the removed file
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);

    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });

    fileInput.files = dt.files;

    // Re-trigger the change event to update the display
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Contact Form Email Functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        // For static sites, we need to use the credentials directly
        // In production, these should be injected during build process
        const emailjsUserId = 'ghhELlW-s8HL820_1';
        emailjs.init(emailjsUserId);
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = new FormData(contactForm);
        const formObject = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (key === 'interestedScopes') {
                // Handle multiple checkboxes
                if (!formObject[key]) {
                    formObject[key] = [];
                }
                formObject[key].push(value);
            } else {
                formObject[key] = value;
            }
        }

        // Determine which email(s) to send to based on project type
        let recipientEmails = 'atocco@woodenstonemi.com'; // Default email

        // Add additional emails based on project type or other criteria
        switch (formObject.projectType) {
            case 'multi-family':
                recipientEmails = 'atocco@woodenstonemi.com, sales@woodenstonemi.com';
                break;
            case 'assisted-living':
                recipientEmails = 'atocco@woodenstonemi.com, healthcare@woodenstonemi.com';
                break;
            case 'commercial':
                recipientEmails = 'atocco@woodenstonemi.com, commercial@woodenstonemi.com';
                break;
            default:
                recipientEmails = 'atocco@woodenstonemi.com, otherperson@example.com';
        }

        // Prepare email template parameters
        const templateParams = {
            to_email: recipientEmails,
            from_name: formObject.name,
            from_company: formObject.company,
            from_email: formObject.email,
            from_phone: formObject.phone || 'Not provided',
            project_type: formObject.projectType,
            interested_scopes: formObject.interestedScopes ? formObject.interestedScopes.join(', ') : 'None selected',
            project_description: formObject.projectDescription,
            message: `
New quote request from ${formObject.name} (${formObject.company})

Contact Information:
- Email: ${formObject.email}
- Phone: ${formObject.phone || 'Not provided'}

Project Details:
- Project Type: ${formObject.projectType}
- Interested Scopes: ${formObject.interestedScopes ? formObject.interestedScopes.join(', ') : 'None selected'}

Project Description:
${formObject.projectDescription}

This message was sent from the contact form on your website.
            `
        };

        // Send email using EmailJS
        if (typeof emailjs !== 'undefined') {
            const serviceId = 'service_w7te4xp';
            const templateId = 'template_zwu0xh8';
            emailjs.send(serviceId, templateId, templateParams)
                .then(function (response) {
                    // Success
                    showFormMessage('Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.', 'success');
                    contactForm.reset();

                    // Clear file list
                    const fileList = document.getElementById('file-list');
                    if (fileList) {
                        fileList.innerHTML = '';
                    }
                }, function (error) {
                    // Error
                    showFormMessage('Sorry, there was an error sending your message. Please try again or contact us directly at atocco@woodenstonemi.com', 'error');
                })
                .finally(function () {
                    // Reset button state
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        } else {
            // Fallback: Use mailto link if EmailJS is not available
            const mailtoLink = createMailtoLink(formObject);
            window.location.href = mailtoLink;

            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Create mailto link as fallback
function createMailtoLink(formData) {
    const subject = encodeURIComponent(`Quote Request - ${formData.projectType} Project`);
    const body = encodeURIComponent(`
New quote request from ${formData.name} (${formData.company})

Contact Information:
- Email: ${formData.email}
- Phone: ${formData.phone || 'Not provided'}

Project Details:
- Project Type: ${formData.projectType}
- Interested Scopes: ${formData.interestedScopes ? formData.interestedScopes.join(', ') : 'None selected'}

Project Description:
${formData.projectDescription}

This message was sent from the contact form on your website.
    `);

    return `mailto:atocco@woodenstonemi.com?subject=${subject}&body=${body}`;
}

// Show form message (success/error)
function showFormMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message form-message-${type}`;
    messageElement.textContent = message;

    // Insert message after the form
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.appendChild(messageElement);
    }

    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}
