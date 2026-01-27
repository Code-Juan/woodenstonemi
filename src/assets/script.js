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
                // Only prevent default and return if clicking on current page link
                if (link.classList.contains('current-page')) {
                    e.preventDefault();
                    return;
                }

                // For all other links, close the mobile menu and allow normal navigation
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

    // Check if there's already a hardcoded current-page indicator
    const existingCurrentPage = document.querySelector('nav a.current-page');

    if (existingCurrentPage) {
        // If there's already a hardcoded current page, verify it's correct
        const existingPage = getPageFromHref(existingCurrentPage.getAttribute('href'));
        if (existingPage === currentPage) {
            // The hardcoded indicator is correct, no need to change anything
            return;
        }
    }

    // Clear any existing current-page classes
    navLinks.forEach(link => {
        link.classList.remove('current-page');
        link.removeAttribute('aria-current');
        link.removeAttribute('tabindex');
    });

    // Set current page indicator (but not for home page since there's no "Home" nav link)
    if (currentPage !== 'home') {
        navLinks.forEach(link => {
            const linkPage = getPageFromHref(link.getAttribute('href'));
            if (linkPage === currentPage) {
                link.classList.add('current-page');
                link.setAttribute('aria-current', 'page');
                // Don't set tabindex to -1 as it can hide the link
            }
        });
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;

    // Handle root page
    if (path === '/' || path === '') {
        return 'home';
    }

    // Remove trailing slash and get the last segment
    const cleanPath = path.replace(/\/$/, '');
    const segments = cleanPath.split('/');
    const lastSegment = segments[segments.length - 1];

    // Map path segments to page names
    const pageMap = {
        'what-we-do': 'what-we-do',
        'scopes-materials': 'scopes-materials',
        'project-portfolio': 'project-portfolio',
        'faq': 'faq',
        'contact-us': 'contact-us'
    };

    return pageMap[lastSegment] || 'home';
}

// Helper function to get page name from filename (for backward compatibility)
function getPageFromFilename(filename) {
    // Map filenames to page names (for any remaining .html references)
    const pageMap = {
        'index.html': 'home',
        'main.html': 'home',
        'what-we-do.html': 'what-we-do',
        'scopes-materials.html': 'scopes-materials',
        'project-portfolio.html': 'project-portfolio',
        'faq.html': 'faq',
        'contact-us.html': 'contact-us'
    };

    return pageMap[filename] || 'home';
}

// Get page name from href
function getPageFromHref(href) {
    if (!href) return '';

    // Turn it into a pathname (handles absolute/relative)
    const pathname = href.includes('://') ? new URL(href, location.origin).pathname : href;

    // Get the last segment, strip trailing slash and .html/.htm, and any query/hash just in case
    const last = pathname.replace(/[?#].*$/, '').replace(/\/$/, '').split('/').pop() || '';
    const slug = last.replace(/\.html?$/i, ''); // support .html and .htm

    const pageMap = {
        'what-we-do': 'what-we-do',
        'scopes-materials': 'scopes-materials',
        'project-portfolio': 'project-portfolio',
        'faq': 'faq',
        'contact-us': 'contact-us'
    };

    return pageMap[slug] || '';
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
                            src: imagePath.startsWith('images/') ? imagePath : `images/${imagePath}`,
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
                src: "images/Previous Jobs/20. Higgenbotham School Apartments/commons-render.png",
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

    // Initialize slideshow only on homepage (index.html)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        const slideshowContainer = document.querySelector('.hero-slideshow .slideshow-container');
        if (slideshowContainer) {
            updateSlideshowWithRandomImages();
            initSlideshow();
        }
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

    // Initialize contact form functionality
    initContactForm();

    // Initialize GA4 tracking
    initGA4Tracking();

    // Initialize exit-intent popup
    initExitIntentPopup();
});



// Google Analytics 4 Event Tracking Functions
function trackGA4Event(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
}

// Track CTA button clicks
function trackCTAClick(ctaText, location) {
    trackGA4Event('cta_click', {
        'cta_text': ctaText,
        'cta_location': location,
        'event_category': 'engagement',
        'event_label': ctaText
    });
}

// Track form interactions
function trackFormStart() {
    trackGA4Event('form_start', {
        'event_category': 'form',
        'event_label': 'contact_form'
    });
}

function trackFormSubmission(success, projectType = '', interestedScopes = []) {
    trackGA4Event(success ? 'form_submission' : 'form_submission_error', {
        'event_category': 'form',
        'event_label': 'contact_form',
        'project_type': projectType,
        'interested_scopes': interestedScopes.join(', '),
        'value': success ? 1 : 0
    });
}

// Track scroll depth
function trackScrollDepth() {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const tracked = new Set();

    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
        );

        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    trackGA4Event('scroll_depth', {
                        'event_category': 'engagement',
                        'event_label': `${threshold}%`,
                        'value': threshold
                    });
                }
            });
        }
    }, { passive: true });
}

// Track phone number clicks
function trackPhoneClick(phoneNumber) {
    trackGA4Event('phone_click', {
        'event_category': 'contact',
        'event_label': phoneNumber,
        'value': 1
    });
}

// Track email link clicks
function trackEmailClick(email) {
    trackGA4Event('email_click', {
        'event_category': 'contact',
        'event_label': email,
        'value': 1
    });
}

// Initialize GA4 tracking
function initGA4Tracking() {
    // Track scroll depth
    trackScrollDepth();

    // Track CTA button clicks
    document.querySelectorAll('.cta-button, .btn[href*="contact"], a[href*="contact-us"]').forEach(button => {
        button.addEventListener('click', function() {
            const ctaText = this.textContent.trim();
            const location = this.closest('section')?.className || 'unknown';
            trackCTAClick(ctaText, location);
        });
    });

    // Track phone number clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            trackPhoneClick(this.getAttribute('href').replace('tel:', ''));
        });
    });

    // Track email link clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            trackEmailClick(this.getAttribute('href').replace('mailto:', ''));
        });
    });
}

// Exit-Intent Popup Functionality
function initExitIntentPopup() {
    // Check if popup was already shown in this session
    if (sessionStorage.getItem('exitIntentShown') === 'true') {
        return;
    }

    let exitIntentTriggered = false;

    // Desktop: Detect mouse leaving viewport
    document.addEventListener('mouseout', function(e) {
        if (!exitIntentTriggered && e.clientY < 10) {
            exitIntentTriggered = true;
            showExitIntentPopup();
        }
    });

    // Mobile: Show after 30 seconds or 50% scroll
    let mobileTimer = setTimeout(() => {
        if (!exitIntentTriggered && window.innerWidth <= 768) {
            exitIntentTriggered = true;
            showExitIntentPopup();
        }
    }, 30000);

    // Also trigger on scroll depth for mobile
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768 && !exitIntentTriggered) {
            const scrollPercent = Math.round(
                ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
            );
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (scrollPercent >= 50) {
                    exitIntentTriggered = true;
                    clearTimeout(mobileTimer);
                    showExitIntentPopup();
                }
            }
        }
    }, { passive: true });
}

function showExitIntentPopup() {
    // Create popup HTML
    const popup = document.createElement('div');
    popup.id = 'exit-intent-popup';
    popup.className = 'exit-intent-popup';
    popup.innerHTML = `
        <div class="exit-intent-popup-content">
            <button class="exit-intent-close" aria-label="Close popup">&times;</button>
            <h2>Wait! Before You Go...</h2>
            <p>Get a free quote for your commercial countertop project</p>
            <form id="exitIntentForm" class="exit-intent-form">
                <input type="email" id="exitIntentEmail" placeholder="Enter your email" required>
                <button type="submit" class="cta-button cta-primary">Get Free Quote</button>
            </form>
            <p class="exit-intent-privacy">We respect your privacy. No spam, ever.</p>
        </div>
        <div class="exit-intent-overlay"></div>
    `;

    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    // Close button
    popup.querySelector('.exit-intent-close').addEventListener('click', closeExitIntentPopup);
    popup.querySelector('.exit-intent-overlay').addEventListener('click', closeExitIntentPopup);

    // Form submission
    const form = popup.querySelector('#exitIntentForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('exitIntentEmail').value;
        
        // Track in GA4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exit_intent_form_submit', {
                'event_category': 'lead_generation',
                'event_label': 'exit_intent_popup',
                'value': 1
            });
        }

        // Redirect to contact form with email pre-filled
        window.location.href = `/contact-us/#request-quote`;
        sessionStorage.setItem('exitIntentShown', 'true');
        closeExitIntentPopup();
    });

    // Track popup shown
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exit_intent_popup_shown', {
            'event_category': 'lead_generation',
            'event_label': 'exit_intent_popup'
        });
    }

    sessionStorage.setItem('exitIntentShown', 'true');
}

function closeExitIntentPopup() {
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
}

// Contact Form Email Functionality - DISABLED (Using Postmark API instead)
function initContactForm() {
    // This function is disabled because we're using the Postmark API
    // The contact form in contact-us.html has its own JavaScript handler
    return;
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

// ============================================================================
// Tawk.to JavaScript API Integration
// ============================================================================

/**
 * Initialize Tawk.to JavaScript API integration
 * Sets up event tracking, visitor attributes, and provides helper functions
 */
function initTawkToAPI() {
    // Wait for Tawk.to to load
    if (typeof Tawk_API === 'undefined') {
        setTimeout(initTawkToAPI, 100);
        return;
    }

    const config = window.appConfig || {};
    const apiKey = config.tawkToApiKey;

    // Set up Tawk.to event handlers
    Tawk_API.onLoad = function() {
        console.log('Tawk.to widget loaded');
        
        // Set default visitor attributes if available from localStorage
        const savedVisitorData = getSavedVisitorData();
        if (savedVisitorData && Object.keys(savedVisitorData).length > 0) {
            setTawkVisitorAttributes(savedVisitorData);
        }
        
        // Wait a bit for the widget to render, then add tooltip
        setTimeout(() => {
            console.log('Attempting to add tooltip after widget load');
            addTawkTooltip();
        }, 1000);
    };

    // Track when chat starts
    Tawk_API.onChatStarted = function() {
        console.log('Chat started');
        
        // Track in Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chat_started', {
                'event_category': 'engagement',
                'event_label': 'tawk_to_chat',
                'value': 1
            });
        }
    };

    // Track when chat ends
    Tawk_API.onChatEnded = function() {
        console.log('Chat ended');
        
        // Track in Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chat_ended', {
                'event_category': 'engagement',
                'event_label': 'tawk_to_chat',
                'value': 1
            });
        }
    };

    // Track when chat is maximized
    Tawk_API.onChatMaximized = function() {
        console.log('Chat maximized');
        
        // Track in Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chat_maximized', {
                'event_category': 'engagement',
                'event_label': 'tawk_to_chat',
                'value': 1
            });
        }
    };

    // Track when chat is minimized
    Tawk_API.onChatMinimized = function() {
        console.log('Chat minimized');
        
        // Track in Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chat_minimized', {
                'event_category': 'engagement',
                'event_label': 'tawk_to_chat',
                'value': 1
            });
        }
    };

    // Track when agent responds
    Tawk_API.onAgentStatusChange = function(status) {
        console.log('Agent status changed:', status);
        
        // Track in Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'agent_status_change', {
                'event_category': 'engagement',
                'event_label': 'tawk_to_chat',
                'agent_status': status,
                'value': 1
            });
        }
    };

    // Track when offline message is sent
    Tawk_API.onOfflineSubmit = function(data) {
        console.log('Offline message submitted:', data);
        
        // Track in Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'offline_message_submitted', {
                'event_category': 'engagement',
                'event_label': 'tawk_to_chat',
                'value': 1
            });
        }
    };
}

/**
 * Set visitor attributes in Tawk.to
 * @param {Object} attributes - Visitor attributes object
 * @param {string} attributes.name - Visitor name
 * @param {string} attributes.email - Visitor email
 * @param {string} attributes.hash - Hash for secure mode (optional)
 * @param {Object} attributes.attributes - Custom attributes object
 */
function setTawkVisitorAttributes(attributes) {
    if (typeof Tawk_API === 'undefined') {
        console.warn('Tawk_API not loaded yet');
        return;
    }

    const config = window.appConfig || {};
    const apiKey = config.tawkToApiKey;

    // Prepare attributes object
    const tawkAttributes = {
        name: attributes.name || null,
        email: attributes.email || null,
        hash: attributes.hash || null
    };

    // Add custom attributes if provided
    if (attributes.attributes && typeof attributes.attributes === 'object') {
        Object.assign(tawkAttributes, attributes.attributes);
    }

    // Set attributes using Tawk.to API
    Tawk_API.setAttributes(tawkAttributes, function(error) {
        if (error) {
            console.error('Error setting Tawk.to visitor attributes:', error);
        } else {
            console.log('Tawk.to visitor attributes set successfully:', tawkAttributes);
            
            // Save visitor data to localStorage for future sessions
            if (attributes.name || attributes.email) {
                saveVisitorData({
                    name: attributes.name,
                    email: attributes.email,
                    attributes: attributes.attributes
                });
            }
        }
    });
}

/**
 * Set visitor attributes from contact form data
 * Call this after a user submits a contact form
 * @param {Object} formData - Form data object
 */
function setTawkVisitorFromForm(formData) {
    const attributes = {
        name: formData.name || null,
        email: formData.email || null,
        attributes: {
            phone: formData.phone || null,
            company: formData.company || null,
            projectType: formData.projectType || null,
            interestedScopes: formData.interestedScopes || null,
            source: 'contact_form',
            lastFormSubmission: new Date().toISOString()
        }
    };

    setTawkVisitorAttributes(attributes);
}

/**
 * Show Tawk.to widget
 */
function showTawkWidget() {
    if (typeof Tawk_API !== 'undefined' && Tawk_API.showWidget) {
        Tawk_API.showWidget();
    }
}

/**
 * Hide Tawk.to widget
 */
function hideTawkWidget() {
    if (typeof Tawk_API !== 'undefined' && Tawk_API.hideWidget) {
        Tawk_API.hideWidget();
    }
}

/**
 * Maximize Tawk.to chat window
 */
function maximizeTawkChat() {
    if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
        Tawk_API.maximize();
    }
}

/**
 * Minimize Tawk.to chat window
 */
function minimizeTawkChat() {
    if (typeof Tawk_API !== 'undefined' && Tawk_API.minimize) {
        Tawk_API.minimize();
    }
}

/**
 * Toggle Tawk.to widget visibility
 */
function toggleTawkWidget() {
    if (typeof Tawk_API !== 'undefined') {
        const widget = document.querySelector('#tawkchat-container');
        if (widget && widget.style.display === 'none') {
            showTawkWidget();
        } else {
            hideTawkWidget();
        }
    }
}

/**
 * Save visitor data to localStorage
 * @param {Object} data - Visitor data to save
 */
function saveVisitorData(data) {
    try {
        const dataToSave = {
            name: data.name || null,
            email: data.email || null,
            attributes: data.attributes || {},
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('tawk_visitor_data', JSON.stringify(dataToSave));
    } catch (e) {
        console.warn('Could not save visitor data to localStorage:', e);
    }
}

/**
 * Get saved visitor data from localStorage
 * @returns {Object|null} Saved visitor data or null
 */
function getSavedVisitorData() {
    try {
        const saved = localStorage.getItem('tawk_visitor_data');
        if (saved) {
            const data = JSON.parse(saved);
            // Check if data is less than 30 days old
            const savedDate = new Date(data.timestamp);
            const daysSince = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 30) {
                return data;
            } else {
                localStorage.removeItem('tawk_visitor_data');
            }
        }
    } catch (e) {
        console.warn('Could not retrieve visitor data from localStorage:', e);
    }
    return null;
}

/**
 * Add floating tooltip text above Tawk.to chat bubble
 * Uses simpler positioning relative to the container
 */
function addTawkTooltip() {
    let tooltipElement = null;

    // Function to update tooltip position
    function updateTooltipPosition() {
        if (!tooltipElement) return;

        // Try multiple selectors
        const tawkContainer = document.querySelector('#tawkchat-container') ||
                              document.querySelector('[id*="tawk"]') ||
                              document.querySelector('[class*="tawk"]') ||
                              document.querySelector('iframe[src*="tawk.to"]')?.parentElement;
        
        if (!tawkContainer) {
            // Fallback: position at typical chat bubble location (bottom-right)
            // Most chat widgets are positioned at bottom-right corner
            tooltipElement.style.position = 'fixed';
            tooltipElement.style.right = '20px';
            tooltipElement.style.bottom = '90px';
            tooltipElement.style.transform = 'none';
            tooltipElement.style.display = 'block';
            tooltipElement.style.visibility = 'visible';
            tooltipElement.style.opacity = '1';
            console.log('Tooltip positioned at fixed fallback location (bottom-right)');
            return;
        }

        const rect = tawkContainer.getBoundingClientRect();
        console.log('Updating tooltip position. Container rect:', rect);
        
        // Position tooltip above the container
        // Chat bubble is typically 60-70px tall, so position tooltip 12px above it
        const bubbleHeight = 70;
        const offset = 12;
        
        tooltipElement.style.position = 'fixed';
        tooltipElement.style.right = (window.innerWidth - rect.right) + 'px';
        tooltipElement.style.bottom = (window.innerHeight - rect.top + bubbleHeight + offset) + 'px';
        tooltipElement.style.transform = 'translateX(0)';
        tooltipElement.style.display = 'block';
        tooltipElement.style.visibility = 'visible';
        tooltipElement.style.opacity = '1';
        
        console.log('Tooltip positioned relative to container:', {
            right: tooltipElement.style.right,
            bottom: tooltipElement.style.bottom
        });
    }

    // Function to create the tooltip
    function createTooltip() {
        // Remove existing if any
        const existing = document.querySelector('.tawk-tooltip-custom');
        if (existing) {
            existing.remove();
        }

        // Try to find container, but don't require it
        const tawkContainer = document.querySelector('#tawkchat-container') ||
                              document.querySelector('[id*="tawk"]') ||
                              document.querySelector('[class*="tawk"]') ||
                              document.querySelector('iframe[src*="tawk.to"]')?.parentElement;

        if (tawkContainer) {
            const rect = tawkContainer.getBoundingClientRect();
            console.log('Tawk container found:', {
                element: tawkContainer,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom
            });
        } else {
            console.log('Tawk container not found, will use fixed positioning');
        }

        // Create tooltip
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'tawk-tooltip-custom';
        tooltipElement.textContent = 'Get Instant Answers!';
        tooltipElement.setAttribute('data-tawk-tooltip', 'true');
        tooltipElement.id = 'tawk-custom-tooltip';
        
        // Make sure it's visible for testing
        tooltipElement.style.cssText = `
            position: fixed !important;
            z-index: 99999 !important;
            pointer-events: none !important;
            background-color: #2c3e50 !important;
            color: #ffffff !important;
            padding: 10px 16px !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            line-height: 1.4 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            right: 20px !important;
            bottom: 90px !important;
        `;
        
        // Add arrow
        const arrow = document.createElement('div');
        arrow.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 8px solid transparent;
            border-top-color: #2c3e50;
        `;
        tooltipElement.appendChild(arrow);
        
        // Add to body
        document.body.appendChild(tooltipElement);
        console.log('Tooltip element created and added to body:', tooltipElement);
        console.log('Tooltip is in DOM:', document.body.contains(tooltipElement));
        console.log('Tooltip computed style:', window.getComputedStyle(tooltipElement).display);

        // Update position
        updateTooltipPosition();

        // Set up position updates
        const updatePosition = () => {
            updateTooltipPosition();
        };

        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition);

        // Update periodically
        const interval = setInterval(() => {
            if (tooltipElement && document.body.contains(tooltipElement)) {
                updateTooltipPosition();
            } else {
                clearInterval(interval);
            }
        }, 500);

        // Hide on mobile
        const checkMobile = () => {
            if (tooltipElement) {
                tooltipElement.style.display = window.innerWidth <= 768 ? 'none' : 'block';
            }
        };
        window.addEventListener('resize', checkMobile);
        checkMobile();

        console.log('Tooltip setup complete');
        return true;
    }

    // Try to create tooltip
    function tryCreateTooltip(attempt = 0) {
        // Try multiple selectors to find tawk.to widget
        const tawkContainer = document.querySelector('#tawkchat-container') ||
                              document.querySelector('[id*="tawk"]') ||
                              document.querySelector('[class*="tawk"]') ||
                              document.querySelector('iframe[src*="tawk.to"]')?.parentElement;
        
        if (!tawkContainer) {
            // If container not found after a few attempts, create tooltip anyway at fixed position
            if (attempt >= 3) {
                console.log('Tawk container not found, creating tooltip at fixed position');
                if (!tooltipElement) {
                    createTooltip();
                }
                return;
            }
            if (attempt < 10) {
                setTimeout(() => tryCreateTooltip(attempt + 1), 500);
            }
            return;
        }

        const rect = tawkContainer.getBoundingClientRect();
        console.log('Found tawk container:', tawkContainer, 'Rect:', rect);
        
        // Wait for container to have dimensions
        if (rect.width === 0 && rect.height === 0) {
            if (attempt < 10) {
                setTimeout(() => tryCreateTooltip(attempt + 1), 500);
            } else {
                // Create anyway at fixed position
                if (!tooltipElement) {
                    createTooltip();
                }
            }
            return;
        }

        if (!tooltipElement) {
            createTooltip();
        }
    }

    // Start trying immediately - will create at fixed position if container not found
    tryCreateTooltip();

    // Watch for container appearance
    const observer = new MutationObserver(() => {
        if (!tooltipElement) {
            tryCreateTooltip();
        } else {
            // Update position if tooltip exists
            updateTooltipPosition();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also try after delays - create tooltip even if container never found
    setTimeout(() => {
        if (!tooltipElement) {
            console.log('Creating tooltip at fixed position (container not found)');
            createTooltip();
        }
    }, 2000);
    
    setTimeout(() => {
        if (!tooltipElement) {
            console.log('Creating tooltip at fixed position (final attempt)');
            createTooltip();
        }
    }, 5000);
}

/**
 * Clear saved visitor data from localStorage
 */
function clearSavedVisitorData() {
    try {
        localStorage.removeItem('tawk_visitor_data');
    } catch (e) {
        console.warn('Could not clear visitor data from localStorage:', e);
    }
}

// Initialize Tawk.to API when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initTawkToAPI();
    
    // Also try to add tooltip after a delay in case widget loads later
    setTimeout(function() {
        addTawkTooltip();
    }, 2000);
});

// Make functions available globally for use in other scripts
window.TawkToAPI = {
    setVisitorAttributes: setTawkVisitorAttributes,
    setVisitorFromForm: setTawkVisitorFromForm,
    showWidget: showTawkWidget,
    hideWidget: hideTawkWidget,
    maximizeChat: maximizeTawkChat,
    minimizeChat: minimizeTawkChat,
    toggleWidget: toggleTawkWidget,
    clearSavedData: clearSavedVisitorData
};
