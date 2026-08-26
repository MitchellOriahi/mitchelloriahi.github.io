/**
 * motion.ts
 * Smooth scrolling and scroll driven reveals.
 *
 * Rules this file follows:
 *   1. The page is complete and readable before this runs. Hidden start states
 *      are only armed after we set data-motion="on", so a failure or a slow
 *      network can never leave content invisible.
 *   2. Nothing here is load bearing. Every effect is decoration over markup
 *      that already works.
 *   3. prefers-reduced-motion switches everything off, including Lenis, and
 *      hands scrolling back to the browser.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const root = document.documentElement;

/* ---------------------------------------------------------------------------
   Smooth scroll
   Lenis interpolates the scroll position each frame. ScrollTrigger is told to
   read from Lenis rather than the native scroll event so the two stay in sync.
   ------------------------------------------------------------------------ */
function initSmoothScroll(): Lenis | null {
    if (prefersReduced()) return null;

    const lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        // Touch devices already have good native inertia, and hijacking it
        // tends to feel worse than leaving it alone.
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // In page anchors go through Lenis so they ease instead of jumping.
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            event.preventDefault();
            lenis.scrollTo(target as HTMLElement, { offset: -80 });
        });
    });

    return lenis;
}

/* ---------------------------------------------------------------------------
   Reveals
   ------------------------------------------------------------------------ */
function initReveals() {
    // Fade and rise. data-reveal-delay staggers siblings.
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        const delay = Number(el.dataset.revealDelay ?? 0);
        gsap.fromTo(
            el,
            { autoAlpha: 0, y: 28 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                delay,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                },
                onComplete: () => {
                    el.style.willChange = 'auto';
                },
            },
        );
    });

    // Headlines wipe up from a clip, which reads as typesetting rather than
    // a generic fade.
    gsap.utils.toArray<HTMLElement>('[data-reveal-clip]').forEach((el) => {
        gsap.fromTo(
            el,
            { clipPath: 'inset(0 0 100% 0)', y: 12 },
            {
                clipPath: 'inset(0 0 -10% 0)',
                y: 0,
                duration: 1.15,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            },
        );
    });
}

/* ---------------------------------------------------------------------------
   Parallax
   Small vertical drift on media so sections feel layered rather than flat.
   ------------------------------------------------------------------------ */
function initParallax() {
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const strength = Number(el.dataset.parallax || 12);
        gsap.fromTo(
            el,
            { yPercent: -strength / 2 },
            {
                yPercent: strength / 2,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('[data-parallax-scope]') ?? el,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            },
        );
    });
}

/* ---------------------------------------------------------------------------
   Sticky navigation state
   ------------------------------------------------------------------------ */
function initNavState() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    ScrollTrigger.create({
        start: 'top -60',
        end: 99999,
        onUpdate: (self) => {
            nav.dataset.stuck = self.progress > 0 ? 'true' : 'false';
        },
        onToggle: (self) => {
            nav.dataset.stuck = self.isActive ? 'true' : 'false';
        },
    });

    // Highlight whichever section is currently under the nav.
    const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'),
    );

    links.forEach((link) => {
        const id = link.getAttribute('href')?.replace('#', '');
        if (!id) return;
        const section = document.getElementById(id);
        if (!section) return;

        ScrollTrigger.create({
            trigger: section,
            start: 'top 45%',
            end: 'bottom 45%',
            onToggle: (self) => {
                link.dataset.active = self.isActive ? 'true' : 'false';
            },
        });
    });
}

/* ---------------------------------------------------------------------------
   Magnetic buttons
   The element leans toward the cursor. Fine pointers only, so it never
   interferes with touch.
   ------------------------------------------------------------------------ */
function initMagnetic() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
        const strength = Number(el.dataset.magnetic || 0.28);
        const setX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'expo.out' });
        const setY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'expo.out' });

        el.addEventListener('pointermove', (event) => {
            const rect = el.getBoundingClientRect();
            setX((event.clientX - rect.left - rect.width / 2) * strength);
            setY((event.clientY - rect.top - rect.height / 2) * strength);
        });

        el.addEventListener('pointerleave', () => {
            setX(0);
            setY(0);
        });
    });
}

/* ---------------------------------------------------------------------------
   Counters
   ------------------------------------------------------------------------ */
function initCounters() {
    gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        if (Number.isNaN(target)) return;
        const decimals = Number(el.dataset.decimals ?? 0);
        const counter = { value: 0 };

        gsap.to(counter, {
            value: target,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
            onUpdate: () => {
                el.textContent = counter.value.toFixed(decimals);
            },
        });
    });
}

/* ---------------------------------------------------------------------------
   Mobile menu
   Plain DOM work, no animation library, so it keeps working even if GSAP fails
   to load. Wired up separately from the motion bootstrap for that reason.
   ------------------------------------------------------------------------ */
export function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const panel = document.getElementById('menu-panel');
    if (!toggle || !panel) return;

    let open = false;

    const setOpen = (next: boolean) => {
        open = next;
        panel.dataset.open = String(next);
        toggle.setAttribute('aria-expanded', String(next));
        toggle.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
        document.body.style.overflow = next ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setOpen(!open));

    panel.addEventListener('click', (event) => {
        if ((event.target as HTMLElement).closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && open) setOpen(false);
    });

    window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
        if (event.matches && open) setOpen(false);
    });
}

/* ---------------------------------------------------------------------------
   Year stamp
   ------------------------------------------------------------------------ */
function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
}

/* ---------------------------------------------------------------------------
   Bootstrap
   ------------------------------------------------------------------------ */
function boot() {
    // These two never depend on the animation stack.
    initMenu();
    initYear();

    if (prefersReduced()) {
        root.dataset.motion = 'off';
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Only now is it safe to hide things, because we know we will reveal them.
    root.dataset.motion = 'on';

    initSmoothScroll();
    initReveals();
    initParallax();
    initNavState();
    initMagnetic();
    initCounters();

    // Fonts change metrics, which changes trigger positions.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
}

try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
} catch (error) {
    console.warn('[motion] disabled', error);
    root.dataset.motion = 'off';
}
