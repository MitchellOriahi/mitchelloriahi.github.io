/* ============================================
   MITCHELL ORIAHI - Portfolio JavaScript
   Built with vanilla JS
============================================ */

// ============================================
// NAVBAR - scroll effect + mobile menu
// ============================================
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    highlightActiveSection();
});

hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

function highlightActiveSection() {
    let current = '';
    sections.forEach(section => {
        if (section.getBoundingClientRect().top <= 120) {
            current = section.getAttribute('id');
        }
    });
    navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
    });
}

// ============================================
// ABOUT PHOTO CAROUSEL
// ============================================
const carouselSlides = document.querySelectorAll('.carousel-slide');
const carouselDots   = document.querySelectorAll('.carousel-dot');
let carouselIndex    = 0;

if (carouselSlides.length > 0) {
    setInterval(() => {
        carouselSlides[carouselIndex].classList.remove('active');
        carouselDots[carouselIndex].classList.remove('active');
        carouselIndex = (carouselIndex + 1) % carouselSlides.length;
        carouselSlides[carouselIndex].classList.add('active');
        carouselDots[carouselIndex].classList.add('active');
    }, 4000);

    carouselDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            carouselSlides[carouselIndex].classList.remove('active');
            carouselDots[carouselIndex].classList.remove('active');
            carouselIndex = i;
            carouselSlides[i].classList.add('active');
            carouselDots[i].classList.add('active');
        });
    });
}

// ============================================
// HERO DUAL TAG — subtle entrance pulse
// ============================================
document.querySelectorAll('.dual-tag').forEach((tag, i) => {
    tag.style.animationDelay = `${0.8 + i * 0.15}s`;
});

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Find siblings in the same parent and stagger them
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)'));
        const idx = siblings.indexOf(entry.target);

        setTimeout(() => {
            entry.target.classList.add('visible');
        }, idx * 120);

        fadeObserver.unobserve(entry.target);
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
});

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const top    = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ============================================
// CONTACT FORM - fake submit feedback
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn          = contactForm.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #059669, #06b6d4)';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML        = originalHTML;
            btn.style.background = '';
            btn.disabled         = false;
            contactForm.reset();
        }, 3200);
    });
}

// ============================================
// COUNTER ANIMATION FOR STATS
// ============================================
function animateCounter(el, target, suffix = '', decimals = 0) {
    const duration = 1400;
    const start    = performance.now();

    function update(now) {
        const elapsed  = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - elapsed, 3);
        const value    = eased * target;
        el.textContent = decimals > 0 ? value.toFixed(decimals) + suffix : Math.round(value) + suffix;
        if (elapsed < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        statsObserver.unobserve(entry.target);

        entry.target.querySelectorAll('.stat-number').forEach(el => {
            const raw  = el.textContent.trim();
            const num  = parseFloat(raw.replace(/[^0-9.]/g, ''));
            const suffix = raw.replace(/[0-9.]/g, '');
            const decs = raw.includes('.') ? raw.split('.')[1].length : 0;
            animateCounter(el, num, suffix, decs);
        });
    });
}, { threshold: 0.5 });

const statsBlock = document.querySelector('.about-stats');
if (statsBlock) statsObserver.observe(statsBlock);

// ============================================
// CURSOR GLOW EFFECT ON HERO (subtle)
// ============================================
const hero = document.querySelector('.hero');
if (hero) {
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x    = ((e.clientX - rect.left) / rect.width)  * 100;
        const y    = ((e.clientY - rect.top)  / rect.height) * 100;
        hero.style.setProperty('--mx', `${x}%`);
        hero.style.setProperty('--my', `${y}%`);
    });
}

// ============================================
// PROJECT CARDS - tilt on hover (subtle 3D)
// ============================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const centerX = rect.width  / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) *  4;
        card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ============================================
// SKILL TAGS - ripple click effect
// ============================================
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('click', function () {
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 300);
    });
});

// ============================================
// PROJECT FILTER TABS
// ============================================
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card[data-category]');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const matches  = filter === 'all' || category === filter;

            if (matches) {
                card.classList.remove('hidden');
                // Re-trigger entrance animation
                card.classList.remove('showing');
                void card.offsetWidth; // force reflow
                card.classList.add('showing');
            } else {
                card.classList.add('hidden');
                card.classList.remove('showing');
            }
        });
    });
});

// ============================================
// LIGHTBOX GALLERY
// ============================================
const lightbox   = document.getElementById('lightbox');
const lbImg      = lightbox.querySelector('.lb-img');
const lbVideo    = lightbox.querySelector('.lb-video');
const lbVideoSrc = lightbox.querySelector('.lb-video-src');
const lbPrev     = lightbox.querySelector('.lb-prev');
const lbNext     = lightbox.querySelector('.lb-next');
const lbCounter  = lightbox.querySelector('.lb-counter');
const lbThumbs   = lightbox.querySelector('.lb-thumbs');
const lbBackdrop = lightbox.querySelector('.lb-backdrop');
const lbClose    = lightbox.querySelector('.lb-close');

let lbItems  = []; // { type: 'image'|'video', src: '...' }
let lbIndex  = 0;

function openLightbox(card, startIndex = 0) {
    lbItems = [];

    const gallery = card.getAttribute('data-gallery');
    const video   = card.getAttribute('data-video');

    if (gallery) {
        JSON.parse(gallery).forEach(src => lbItems.push({ type: 'image', src }));
    }
    if (video) {
        lbItems.push({ type: 'video', src: video });
    }

    if (!lbItems.length) return;

    lbIndex = Math.min(startIndex, lbItems.length - 1);
    buildThumbs();
    showItem(lbIndex);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbVideo.pause();
    lbVideo.classList.remove('active');
    lbImg.classList.remove('active');
}

function showItem(idx) {
    lbIndex = idx;
    const item = lbItems[idx];

    lbImg.classList.remove('active');
    lbVideo.classList.remove('active');
    lbVideo.pause();

    if (item.type === 'video') {
        lbVideoSrc.src = item.src;
        lbVideo.load();
        lbVideo.classList.add('active');
    } else {
        lbImg.src = item.src;
        lbImg.classList.add('active');
    }

    lbCounter.textContent = `${idx + 1} / ${lbItems.length}`;
    lbPrev.disabled = idx === 0;
    lbNext.disabled = idx === lbItems.length - 1;

    // Update active thumb
    lbThumbs.querySelectorAll('.lb-thumb, .lb-thumb-video').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
    });
}

function buildThumbs() {
    lbThumbs.innerHTML = '';
    // Single-item view: hide navigation chrome for a clean inspect experience
    const singleItem = lbItems.length <= 1;
    lbThumbs.style.display   = singleItem ? 'none' : '';
    lbCounter.style.display  = singleItem ? 'none' : '';
    lbPrev.style.display     = singleItem ? 'none' : '';
    lbNext.style.display     = singleItem ? 'none' : '';
    if (singleItem) return;

    lbItems.forEach((item, i) => {
        let el;
        if (item.type === 'video') {
            el = document.createElement('div');
            el.className = 'lb-thumb-video';
            el.innerHTML = '<i class="fas fa-play-circle"></i>';
            el.title = 'Video';
        } else {
            el = document.createElement('img');
            el.className = 'lb-thumb';
            el.src = item.src;
            el.alt = `Photo ${i + 1}`;
        }
        el.addEventListener('click', () => showItem(i));
        lbThumbs.appendChild(el);
    });
}

lbPrev.addEventListener('click', () => { if (lbIndex > 0) showItem(lbIndex - 1); });
lbNext.addEventListener('click', () => { if (lbIndex < lbItems.length - 1) showItem(lbIndex + 1); });
lbClose.addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
});

// Open lightbox when clicking on a project image or gallery button
document.querySelectorAll('.project-card').forEach(card => {
    const hasGallery = card.hasAttribute('data-gallery') || card.hasAttribute('data-video');
    if (!hasGallery) return;

    card.querySelector('.project-img-wrapper').addEventListener('click', (e) => {
        if (e.target.closest('.gallery-trigger')) {
            openLightbox(card, 0);
        } else if (!e.target.closest('.proj-link')) {
            openLightbox(card, 0);
        }
    });

    const galleryBtn = card.querySelector('.gallery-trigger');
    if (galleryBtn) {
        galleryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(card, 0);
        });
    }
});

// ============================================
// BEYOND ENGINEERING — photo lightbox
// ============================================
document.querySelectorAll('.beyond-clickable').forEach(img => {
    img.addEventListener('click', () => {
        const group   = img.closest('.beyond-photos-pair');
        const srcs    = JSON.parse(group.getAttribute('data-beyond-gallery'));
        const startIdx = parseInt(img.getAttribute('data-idx'), 10);

        lbItems = srcs.map(src => ({ type: 'image', src }));
        lbIndex = startIdx;
        buildThumbs();
        showItem(lbIndex);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
});

console.log('%c Mitchell Oriahi | Portfolio', 'color: #06b6d4; font-size: 16px; font-weight: bold;');
console.log('%c Built with HTML, CSS & JavaScript', 'color: #64748b; font-size: 12px;');
