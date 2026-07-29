// Projects Data - Easy to maintain and update
const projectsData = [
    {
        id: 1,
        name: "WOODVIEW COMMONS FLATS",
        location: "Ann Arbor, MI",
        type: "Multifamily Units & Amenities",
        details: "156 Units, New Construction",
        scopes: "Granite Countertops",
        materials: "Granite Countertops, Sink Fixtures",
        client: "Williams Distributing/Rohde Construction",
        dates: "Nov 2024 - May 2025",
        images: [
            "images/Previous Jobs/1. Woodview Commons/(BLDG. Overview) woodview-commons-ann-arbor-hero.jpg",
            "images/Previous Jobs/1. Woodview Commons/(Kitchen 1) woodview-commons-ann-arbor-mi-building-photo-hero.jpg",
            "images/Previous Jobs/1. Woodview Commons/(Kitchen 2) woodview-commons-ann-arbor-mi-building-photo-hero.jpg",
            "images/Previous Jobs/1. Woodview Commons/(Site Overview) woodview-commons-ann-arbor-hero.jpg"
        ]
    },
    {
        id: 3,
        name: "PLYMOUTH WALK APARTMENTS",
        location: "Plymouth Township, MI",
        type: "Multifamily Units & Amenities",
        details: "266 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Sachse Construction",
        dates: "Mar 2026 - TBD",
        images: [
            "images/Previous Jobs/22. Plymouth Walk Apartments/optionA-rendering-hero.jpg",
            "images/Previous Jobs/22. Plymouth Walk Apartments/optionB-rendering-hero.jpg",
            "images/Previous Jobs/22. Plymouth Walk Apartments/unit-rendering-hero.jpg",
            "images/Previous Jobs/22. Plymouth Walk Apartments/clubhouse-rendering-hero.jpg"
        ]
    },
    {
        id: 5,
        name: "IRONWORKS APARTMENTS",
        location: "Kalamazoo, MI",
        type: "Multifamily Units & Amenities",
        details: "82 Units, Renovation",
        scopes: "Granite Countertops",
        materials: "Granite Countertops, Sink Fixtures",
        client: "Williams Distributing",
        dates: "Apr 2025 - Jan 2026",
        images: [
            "images/Previous Jobs/8. Ironworks Apartments/kitchen-view1-hero.png",
            "images/Previous Jobs/8. Ironworks Apartments/kitchen-view2-hero.png",
            "images/Previous Jobs/8. Ironworks Apartments/kitchen-view3-hero.png",
            "images/Previous Jobs/8. Ironworks Apartments/bathroom-view1-hero.png",
            "images/Previous Jobs/8. Ironworks Apartments/bathroom-view2-hero.png"
        ]
    },
    {
        id: 6,
        name: "BRIGHTDAWN APARTMENTS",
        location: "Ann Arbor, MI",
        type: "Multifamily Units & Amenities",
        details: "120 Units, New Construction",
        scopes: "Cut-To-Size Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Braun Construction Group",
        dates: "Apr 2025 - Feb 2026",
        images: [
            "images/Previous Jobs/7. Brightdawn Apartments/apartments-overview-hero.jpg",
            "images/Previous Jobs/7. Brightdawn Apartments/kitchen-view1-hero.jpg",
            "images/Previous Jobs/7. Brightdawn Apartments/kitchen-view2-hero.jpg",
            "images/Previous Jobs/7. Brightdawn Apartments/kitchen-view3-hero.png",
            "images/Previous Jobs/7. Brightdawn Apartments/bathroom-view1-hero.jpg",
            "images/Previous Jobs/7. Brightdawn Apartments/bathroom-view2-hero.png",
            "images/Previous Jobs/7. Brightdawn Apartments/bathroom-view3-hero.png"
        ]
    },
    {
        id: 7,
        name: "THE PRESERVE ON ASH",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "105 units across two phases, North Corktown",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Sachse Construction",
        dates: "Apr 2025 - TBD",
        phases: [
            { label: "Phase 1", units: "69 Units", dates: "Apr 2025 - Dec 2025" },
            { label: "Phase 2", units: "36 Units", dates: "Nov 2026 - TBD" }
        ],
        images: [
            "images/Previous Jobs/25. The Preserve on Ash - Phase 2/apartments-overview-hero.webp",
            "images/Previous Jobs/25. The Preserve on Ash - Phase 2/kitchen-view1-hero.webp",
            "images/Previous Jobs/25. The Preserve on Ash - Phase 2/kitchen-view2-hero.webp",
            "images/Previous Jobs/25. The Preserve on Ash - Phase 2/kitchen-view3-hero.webp",
            "images/Previous Jobs/25. The Preserve on Ash - Phase 2/bathroom-view1-hero.webp",
            "images/Previous Jobs/25. The Preserve on Ash - Phase 2/bathroom-view2-hero.webp",
            "images/Previous Jobs/3. Preserve on Ash - Phase 1/Preserve-on-Ash-Phase-1_medium-hero.jpg",
            "images/Previous Jobs/3. Preserve on Ash - Phase 1/Preserve-on-Ash-Phase-1.2_medium-hero.jpg"
        ]
    },
    {
        id: 9,
        name: "FREEWHEEL APARTMENTS",
        location: "Marquette, MI",
        type: "Multifamily Units & Amenities",
        details: "39 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops",
        client: "Williams Distributing",
        dates: "Jun 2025 - Jul 2025",
        images: [
            "images/Previous Jobs/10. Freewheel Apartments/freewheel-apartments-marquette-mi-primary-photo-hero.png",
            "images/Previous Jobs/10. Freewheel Apartments/kitchen-view1-hero.png"
        ]
    },
    {
        id: 10,
        name: "450 AMSTERDAM APARTMENTS",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "92 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Jonna Construction Company",
        dates: "May 2025 - Jul 2025",
        images: [
            "images/Previous Jobs/5. 450 Amsterdam Apartments/exterior-overview-hero.png",
            "images/Previous Jobs/5. 450 Amsterdam Apartments/kitchen-view3-hero.png",
            "images/Previous Jobs/5. 450 Amsterdam Apartments/kitchen-view4-hero.png",
            "images/Previous Jobs/5. 450 Amsterdam Apartments/bathroom-view2-hero.png",
            "images/Previous Jobs/5. 450 Amsterdam Apartments/mailroom-view-hero.png"
        ]
    },
    {
        id: 12,
        name: "HIGGINBOTHAM GARDEN APARTMENTS",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "63 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops",
        client: "Ronnisch Construction Group",
        dates: "Feb 2026 - Sep 2026",
        images: [
            "images/Previous Jobs/19. Higgenbotham Garden Apartments/view-of-kitchen-hero.png",
            "images/Previous Jobs/19. Higgenbotham Garden Apartments/view-from-north-parking-lot-hero.png",
            "images/Previous Jobs/19. Higgenbotham Garden Apartments/view-from-indiana-hero.png"
        ]
    },
    {
        id: 13,
        name: "HIGGINBOTHAM SCHOOL APARTMENTS",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "85 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops",
        client: "Ronnisch Construction Group",
        dates: "Jun 2026 - Sep 2026",
        images: [
            "images/Previous Jobs/20. Higgenbotham School Apartments/commons-render-hero.png",
            "images/Previous Jobs/20. Higgenbotham School Apartments/commons-render2-hero.png",
            "images/Previous Jobs/20. Higgenbotham School Apartments/1732052558818-hero.webp",
            "images/Previous Jobs/20. Higgenbotham School Apartments/Higginbotham rendering-hero.jpg"
        ]
    },
    {
        id: 14,
        name: "LEE CREST APARTMENTS",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "100 Units, Renovation",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "The Monahan Company",
        dates: "Jan 2025 - Sep 2025",
        images: [
            "images/Previous Jobs/11. Lee Crest Apartments/Site View_LeeCrest-hero.jpg"
        ]
    },
    {
        id: 15,
        name: "CHATHAM APARTMENTS",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "73 Units, Renovation",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "The Monahan Company",
        dates: "Apr 2025 - Jan 2026",
        images: [
            "images/Previous Jobs/12. Chatham Apartments/exterior-overview-hero.png"
        ]
    },

    {
        id: 16,
        name: "TERRA STATION APARTMENTS",
        location: "Hudsonville, MI",
        type: "Multifamily Units",
        details: "141 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops",
        client: "Williams Distributing",
        dates: "Jul 2025 - Sep 2026",
        images: [
            "images/Previous Jobs/6. Terra Station Apartments/apartments-overview1-hero.webp",
            "images/Previous Jobs/6. Terra Station Apartments/apartments-overview2-hero.webp",
            "images/Previous Jobs/6. Terra Station Apartments/kitchen-view1-hero.jpg",
            "images/Previous Jobs/6. Terra Station Apartments/kitchen-view2-hero.jpg",
            "images/Previous Jobs/6. Terra Station Apartments/kitchen-view3-hero.jpg",
            "images/Previous Jobs/6. Terra Station Apartments/bathroom-view1-hero.webp",
            "images/Previous Jobs/6. Terra Station Apartments/bathroom-view2-hero.webp"
        ]
    },
    {
        id: 17,
        name: "BALDWIN WOODS APARTMENTS",
        location: "Grand Blanc, MI",
        type: "Multifamily Units",
        details: "89 Units, New Construction",
        scopes: "Cut-To-Size Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Sachse Construction",
        dates: "Nov 2025 - Dec 2025",
        images: [
            "images/Previous Jobs/21. Baldwin Woods Apartments/exterior-overview1-hero.png",
            "images/Previous Jobs/21. Baldwin Woods Apartments/kitchen-view1-hero.png",
            "images/Previous Jobs/21. Baldwin Woods Apartments/bathroom-view1-hero.png"
        ]
    },
    {
        id: 18,
        name: "3740 2ND AVE APARTMENTS",
        location: "Detroit, MI",
        type: "Multifamily Units",
        details: "57 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "The Monahan Company",
        dates: "Jan 2025 - Feb 2025",
        images: [
            "images/Previous Jobs/4. 3740 2nd Ave Apartments/Kitchen1 VIEW_3740 Apartments-hero.jpg",
            "images/Previous Jobs/4. 3740 2nd Ave Apartments/bath1 VIEW_3740 Apartments-hero.jpg",
            "images/Previous Jobs/4. 3740 2nd Ave Apartments/SITE VIEW_3740 Apartments-hero.jpg"
        ]
    },
    {
        id: 20,
        name: "PALMS APARTMENTS",
        location: "Detroit, MI",
        type: "Multifamily Units",
        details: "61 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Greatwater Opportunity Capital",
        dates: "Dec 2024 - May 2025",
        images: [
            "images/Previous Jobs/13. Palms Apartments/exterior-overview-hero.jpg",
            "images/Previous Jobs/13. Palms Apartments/kitchen-view-hero.webp",
            "images/Previous Jobs/13. Palms Apartments/kitchen-view2-hero.webp",
            "images/Previous Jobs/13. Palms Apartments/bathroom-view-hero.jpg"
        ]
    },
    {
        id: 21,
        name: "2135 HUBBARD",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "31 Units, Renovation",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Greatwater Opportunity Capital",
        dates: "Sep 2024 - Sep 2024",
        images: [
            "images/Previous Jobs/14. 2135 Hubbard/mavor-apartments-detroit-mi-building-photo-hero.jpg",
            "images/Previous Jobs/14. 2135 Hubbard/mavor-apartments-detroit-mi-building-photo (1)-hero.jpg",
            "images/Previous Jobs/14. 2135 Hubbard/mavor-apartments-detroit-mi-building-photo (2)-hero.jpg"
        ]
    },
    {
        id: 22,
        name: "25 E. PALMER (BARLUM APARTMENTS)",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "30 Units, Renovation",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Greatwater Opportunity Capital",
        dates: "Sep 2024 - May 2025",
        images: [
            "images/Previous Jobs/16. 25 E. Palmer (Barlum Apartments)/the-barlum-detroit-mi-primary-photo-hero.jpg",
            "images/Previous Jobs/16. 25 E. Palmer (Barlum Apartments)/the-barlum-detroit-mi-building-photo-hero.jpg",
            "images/Previous Jobs/16. 25 E. Palmer (Barlum Apartments)/the-barlum-detroit-mi-building-photo (1)-hero.jpg",
            "images/Previous Jobs/16. 25 E. Palmer (Barlum Apartments)/the-barlum-detroit-mi-building-photo (2)-hero.jpg"
        ]
    },
    {
        id: 25,
        name: "VESTER FLATS",
        location: "Ferndale, MI",
        type: "Multifamily Units",
        details: "72 Units, New Construction",
        scopes: "Quartz Countertops, Finish Trim Carpentry Installation",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Tower Construction",
        dates: "Jul 2026 - Nov 2026",
        images: [
            "images/Previous Jobs/29. Vester Flats/apartments-overview-hero.png"
        ]
    },
    {
        id: 26,
        name: "BRUSH WATSON MIDBLOCK",
        location: "Detroit, MI",
        type: "Multifamily Units & Amenities",
        details: "184 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops",
        client: "St Clair Construction",
        dates: "Aug 2026 - Jan 2027",
        images: [
            "images/Previous Jobs/36. Brush Watson Midblock/apartments-overview-hero.png",
            "images/Previous Jobs/36. Brush Watson Midblock/apartments-overview1-hero.png"
        ]
    },
    {
        id: 27,
        name: "LINDSEY CENTER REDEVELOPMENT",
        location: "Troy, MI",
        type: "Multifamily Units & Amenities",
        details: "82 Units (Building B), New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops",
        client: "Tower Construction",
        dates: "Apr 2026 - Jul 2026",
        images: [
            "images/Previous Jobs/40. Lindsey Center Redevelopment/apartments-overview-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/apartments-overview1-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/apartments-overview2-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/island-view-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/kitchen-view1-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/kitchen-view2-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/kitchen-view3-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/kitchen-view4-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/kitchen-view5-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/kitchen-view6-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/bathroom-view1-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/bathroom-view2-hero.jpg",
            "images/Previous Jobs/40. Lindsey Center Redevelopment/bathroom-view3-hero.jpg"
        ]
    },
    {
        id: 28,
        name: "HUDSON VALLEY APARTMENTS",
        location: "Lake Orion, MI",
        type: "Multifamily Units",
        details: "24 Units, New Construction",
        scopes: "Quartz Countertops",
        materials: "Quartz Countertops, Sink Fixtures",
        client: "Riverside Supply Company",
        dates: "Feb 2026 - Jul 2026",
        images: [
            "images/Previous Jobs/15. Hudson Valley Apartments/apartments-overview-hero.jpg",
            "images/Previous Jobs/15. Hudson Valley Apartments/apartments-overview1-hero.jpg",
            "images/Previous Jobs/15. Hudson Valley Apartments/apartments-overview2-hero.jpg",
            "images/Previous Jobs/15. Hudson Valley Apartments/kitchen-view1-hero.jpg",
            "images/Previous Jobs/15. Hudson Valley Apartments/bathroom-view1-hero.jpg",
            "images/Previous Jobs/15. Hudson Valley Apartments/bathroom-view2-hero.jpg",
            "images/Previous Jobs/15. Hudson Valley Apartments/bathroom-view3-hero.jpg"
        ]
    }
];

// Function to generate project HTML
function generateProjectHTML(project) {
    const imageSlides = project.images.map((image, index) => {
        if (image === "placeholder") {
            return `<div class="carousel-slide">
                        <p>Image coming soon</p>
                    </div>`;
        } else {
            return `<div class="carousel-slide">
                        <img src="../../${image}" alt="${project.name}" loading="lazy">
                    </div>`;
        }
    }).join('');

    return `
    <!-- Project ${project.id}: ${project.name} -->
    <section class="project-spotlight" id="project-${project.id}">
        <div class="container">
            <div class="spotlight-box">
                <h2>${project.name}</h2>
                <span class="project-status status-${getProjectStatus(project).toLowerCase().replace(/\s+/g, '-')}">${getProjectStatus(project)}</span>
                <div class="project-details">
                    <p><strong>Location:</strong> ${project.location}</p>
                    <p><strong>Type:</strong> ${project.type}</p>
                    <p><strong>Details:</strong> ${project.details}</p>
                    <p><strong>Scopes Performed:</strong> ${project.scopes}</p>
                    <p><strong>Materials Supplied:</strong> ${project.materials}</p>
                    <p><strong>Client:</strong> ${project.client}</p>
                    <p><strong>Project Start/Finish:</strong> ${project.dates}</p>
                </div>
                ${project.phases ? `<div class="project-phases">
                    ${project.phases.map(ph => {
                        const phStatus = getStatusFromDates(ph.dates);
                        return `<div class="phase-item">
                        <div class="phase-head">
                            <span class="phase-label">${ph.label}</span>
                            <span class="project-status status-${phStatus.toLowerCase().replace(/\s+/g, '-')}">${phStatus}</span>
                        </div>
                        <span class="phase-stat">${ph.units} &middot; ${ph.dates}</span>
                    </div>`;
                    }).join('')}
                </div>` : ''}
            </div>
            <div class="project-gallery">
                <div class="carousel-container">
                    <button class="carousel-btn carousel-prev" aria-label="Previous image">‹</button>
                    <div class="carousel-track">
                        ${imageSlides}
                    </div>
                    <button class="carousel-btn carousel-next" aria-label="Next image">›</button>
                </div>
            </div>
        </div>
    </section>`;
}

// Function to render all projects
function renderProjects(filteredProjects = null) {
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        const projectsToRender = filteredProjects || projectsData;
        projectsContainer.innerHTML = projectsToRender.map(project => generateProjectHTML(project)).join('');

        // Re-initialize carousel functionality after rendering
        initializeCarousels();

        // Add click listeners to carousel images for modal functionality
        if (window.addImageClickListeners) {
            window.addImageClickListeners();
        }
    }
}

// Function to initialize carousel functionality
function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach(carousel => {
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

            const step = Math.round(rect.width + paddingLeft + paddingRight + marginLeft + marginRight);

            // Calculate step size for carousel navigation

            return step;
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
            const step = stepPx();

            if (current < max) {
                track.scrollBy({ left: step, behavior: 'smooth' });
            }
        };

        const prev = () => {
            const current = curIndex();
            const step = stepPx();

            if (current > 0) {
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

// Filter functionality
let selectedStatus = '';
let selectedScopes = [];

// ---------------------------------------------------------------------
// Automatic project status, derived from the dates string every page load.
// Format: "MMM YYYY - MMM YYYY" (the end may be "TBD").
//   - end month reached or passed          -> Completed
//   - start month still in the future      -> Scheduled
//   - otherwise (incl. TBD/unknown end)    -> In Progress
// Month-level comparison, so nothing needs manual status updates.
// ---------------------------------------------------------------------
const STATUS_MONTHS = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

// Returns year*12+month for strings like "Sept 2024" / "March 2025", else null
function parseStatusMonth(str) {
    const m = /([A-Za-z]+)\.?\s+(\d{4})/.exec(String(str || ''));
    if (!m) return null;
    const mo = STATUS_MONTHS[m[1].toLowerCase().slice(0, 3)];
    if (mo === undefined) return null;
    return parseInt(m[2], 10) * 12 + mo;
}

function getStatusFromDates(dates) {
    const parts = String(dates || '').split(' - ');
    const start = parseStatusMonth(parts[0]);
    const end = parts.length > 1 ? parseStatusMonth(parts[1]) : null;
    const now = new Date();
    const current = now.getFullYear() * 12 + now.getMonth();
    if (end !== null && end <= current) return 'Completed';
    if (start !== null && start > current) return 'Scheduled';
    return 'In Progress';
}

function getProjectStatus(project) {
    return getStatusFromDates(project.dates);
}

// Function to get the statuses present in the data
function getUniqueStatuses() {
    return [...new Set(projectsData.map(getProjectStatus))].sort();
}

// Function to get unique scopes from projects
function getUniqueScopes() {
    const allScopes = projectsData.map(project => project.scopes);
    const scopeList = allScopes.flatMap(scopes =>
        scopes.split(',').map(scope => scope.trim())
    );
    return [...new Set(scopeList)].sort();
}

// Function to populate filter options
function populateFilters() {
    // Populate status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        getUniqueStatuses().forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusFilter.appendChild(option);
        });
    }

    // Populate scopes filter
    const scopesDropdown = document.getElementById('scopes-dropdown');
    if (scopesDropdown) {
        const scopes = getUniqueScopes();
        scopes.forEach(scope => {
            const option = document.createElement('div');
            option.className = 'multi-select-option';
            option.innerHTML = `
                <input type="checkbox" id="scope-${scope.replace(/\s+/g, '-')}" value="${scope}">
                <label for="scope-${scope.replace(/\s+/g, '-')}">${scope}</label>
            `;
            scopesDropdown.appendChild(option);
        });
    }
}

// Function to filter projects
function filterProjects() {
    let filtered = projectsData;

    // Filter by status
    if (selectedStatus) {
        filtered = filtered.filter(project => getProjectStatus(project) === selectedStatus);
    }

    // Filter by scopes
    if (selectedScopes.length > 0) {
        filtered = filtered.filter(project => {
            const projectScopes = project.scopes.split(',').map(scope => scope.trim());
            return selectedScopes.some(selectedScope =>
                projectScopes.includes(selectedScope)
            );
        });
    }

    renderProjects(filtered);
}

// Function to update scopes display
function updateScopesDisplay() {
    const scopesDisplay = document.getElementById('scopes-display');
    if (scopesDisplay) {
        if (selectedScopes.length === 0) {
            scopesDisplay.innerHTML = '<span class="placeholder">SELECT SCOPES</span>';
        } else {
            const selectedItems = selectedScopes.map(scope =>
                `<span class="selected-item">${scope}<span class="remove" data-scope="${scope}">×</span></span>`
            ).join('');
            scopesDisplay.innerHTML = `<div class="selected-items">${selectedItems}</div>`;
        }
    }
}

// Function to initialize filter event listeners
function initializeFilters() {
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            selectedStatus = e.target.value;
            filterProjects();
        });
    }

    // Scopes multi-select
    const scopesDisplay = document.getElementById('scopes-display');
    const scopesDropdown = document.getElementById('scopes-dropdown');

    if (scopesDisplay && scopesDropdown) {
        // Toggle dropdown
        scopesDisplay.addEventListener('click', () => {
            scopesDropdown.classList.toggle('active');
            scopesDisplay.classList.toggle('active');
        });

        // Handle scope selection
        scopesDropdown.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const scope = e.target.value;
                if (e.target.checked) {
                    if (!selectedScopes.includes(scope)) {
                        selectedScopes.push(scope);
                    }
                } else {
                    selectedScopes = selectedScopes.filter(s => s !== scope);
                }
                updateScopesDisplay();
                filterProjects();
            }
        });

        // Handle remove scope
        scopesDisplay.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove')) {
                const scope = e.target.dataset.scope;
                selectedScopes = selectedScopes.filter(s => s !== scope);
                updateScopesDisplay();

                // Uncheck the checkbox
                const checkbox = document.getElementById(`scope-${scope.replace(/\s+/g, '-')}`);
                if (checkbox) {
                    checkbox.checked = false;
                }

                filterProjects();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!scopesDisplay.contains(e.target) && !scopesDropdown.contains(e.target)) {
                scopesDropdown.classList.remove('active');
                scopesDisplay.classList.remove('active');
            }
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            selectedStatus = '';
            selectedScopes = [];

            // Reset status filter
            if (statusFilter) {
                statusFilter.value = '';
            }

            // Reset scopes checkboxes
            const checkboxes = scopesDropdown.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            updateScopesDisplay();
            filterProjects();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    populateFilters();
    initializeFilters();
    renderProjects();
});
