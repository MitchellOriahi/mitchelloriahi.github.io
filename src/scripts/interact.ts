/**
 * interact.ts
 * The site's interactive layer: the photo and video lightbox, and the project
 * filters. Plain DOM work with no library dependency, so it keeps working even
 * if the animation stack fails to load.
 *
 * Same rule as motion.ts: nothing here is load bearing. Without JavaScript the
 * photos are still visible in their cards and every project is simply shown.
 */

interface LbItem {
    type: 'image' | 'video';
    src: string;
    poster?: string;
    caption: string;
}

/* ---------------------------------------------------------------------------
   LIGHTBOX
   Triggers are buttons carrying data-lb-group / data-lb-full / data-lb-type.
   Items belonging to the same group page together, in DOM order.
   ------------------------------------------------------------------------ */
function initLightbox() {
    const triggers = Array.from(
        document.querySelectorAll<HTMLElement>('[data-lb-group]'),
    );
    if (!triggers.length) return;

    /* ---- overlay markup, built once --------------------------------------- */
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.dataset.open = 'false';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Media viewer');
    overlay.innerHTML = `
        <div class="lb-bar">
            <span class="lb-caption"></span>
            <span class="lb-counter"></span>
            <button type="button" class="lb-close" aria-label="Close viewer">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
        </div>
        <div class="lb-stage">
            <button type="button" class="lb-nav lb-prev" aria-label="Previous">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button type="button" class="lb-nav lb-next" aria-label="Next">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
        </div>
        <div></div>`;
    document.body.appendChild(overlay);

    const stage = overlay.querySelector<HTMLElement>('.lb-stage')!;
    const caption = overlay.querySelector<HTMLElement>('.lb-caption')!;
    const counter = overlay.querySelector<HTMLElement>('.lb-counter')!;
    const btnClose = overlay.querySelector<HTMLButtonElement>('.lb-close')!;
    const btnPrev = overlay.querySelector<HTMLButtonElement>('.lb-prev')!;
    const btnNext = overlay.querySelector<HTMLButtonElement>('.lb-next')!;

    let items: LbItem[] = [];
    let index = 0;
    let open = false;
    let restoreFocus: HTMLElement | null = null;

    const itemFrom = (el: HTMLElement): LbItem => ({
        type: (el.dataset.lbType === 'video' ? 'video' : 'image'),
        src: el.dataset.lbFull ?? '',
        poster: el.dataset.lbPoster,
        caption: el.dataset.lbCaption ?? '',
    });

    const groupItems = (group: string) =>
        triggers
            .filter((t) => t.dataset.lbGroup === group)
            .map(itemFrom)
            .filter((it) => it.src);

    function render() {
        // Clear previous media, keep the nav buttons.
        stage.querySelectorAll('img, video').forEach((el) => el.remove());

        const item = items[index];
        if (!item) return;

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            if (item.poster) video.poster = item.poster;
            video.controls = true;
            video.playsInline = true;
            video.preload = 'metadata';
            stage.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.caption || 'Enlarged view';
            img.decoding = 'async';
            stage.appendChild(img);

            // Preload neighbours so paging feels instant.
            [index - 1, index + 1].forEach((n) => {
                const neighbour = items[(n + items.length) % items.length];
                if (neighbour?.type === 'image') new Image().src = neighbour.src;
            });
        }

        caption.textContent = item.caption;
        const many = items.length > 1;
        counter.textContent = many ? `${index + 1} / ${items.length}` : '';
        btnPrev.hidden = btnNext.hidden = !many;
    }

    function show(group: string, startAt: number) {
        items = groupItems(group);
        if (!items.length) return;
        index = Math.min(Math.max(startAt, 0), items.length - 1);

        restoreFocus = document.activeElement as HTMLElement;
        overlay.dataset.open = 'true';
        open = true;

        // Scroll lock, compensating for the scrollbar so the page does not jump.
        const gap = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (gap > 0) document.body.style.paddingRight = `${gap}px`;

        render();
        btnClose.focus();
    }

    function hide() {
        if (!open) return;
        open = false;
        overlay.dataset.open = 'false';

        // Stop any playing video rather than leaving it buffering behind the page.
        stage.querySelectorAll('video').forEach((v) => {
            v.pause();
            v.removeAttribute('src');
            v.load();
        });

        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        restoreFocus?.focus?.();
        restoreFocus = null;
    }

    const step = (delta: number) => {
        if (items.length < 2) return;
        index = (index + delta + items.length) % items.length;
        render();
    };

    /* ---- wiring ----------------------------------------------------------- */
    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const group = trigger.dataset.lbGroup!;
            const siblings = triggers.filter((t) => t.dataset.lbGroup === group);
            show(group, siblings.indexOf(trigger));
        });
    });

    // "Watch demo" style openers: open a group at its first video item.
    document.querySelectorAll<HTMLElement>('[data-lb-open-group]').forEach((opener) => {
        opener.addEventListener('click', () => {
            const group = opener.dataset.lbOpenGroup!;
            const list = groupItems(group);
            const videoAt = list.findIndex((it) => it.type === 'video');
            show(group, videoAt >= 0 ? videoAt : 0);
        });
    });

    btnClose.addEventListener('click', hide);
    btnPrev.addEventListener('click', () => step(-1));
    btnNext.addEventListener('click', () => step(1));

    overlay.addEventListener('click', (event) => {
        // Backdrop click closes; clicks on media or controls do not.
        if (event.target === overlay || event.target === stage) hide();
    });

    document.addEventListener('keydown', (event) => {
        if (!open) return;
        if (event.key === 'Escape') { event.preventDefault(); hide(); }
        if (event.key === 'ArrowLeft') step(-1);
        if (event.key === 'ArrowRight') step(1);

        // A minimal focus trap: keep Tab cycling within the overlay.
        if (event.key === 'Tab') {
            const focusable = Array.from(
                overlay.querySelectorAll<HTMLElement>('button, video'),
            ).filter((el) => !el.hidden);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
}

/* ---------------------------------------------------------------------------
   PROJECT FILTERS
   ------------------------------------------------------------------------ */
function initFilters() {
    const chips = Array.from(
        document.querySelectorAll<HTMLButtonElement>('[data-filter]'),
    );
    const cards = Array.from(
        document.querySelectorAll<HTMLElement>('[data-project]'),
    );
    const status = document.querySelector<HTMLElement>('[data-filter-status]');
    if (!chips.length || !cards.length) return;

    const apply = (kind: string) => {
        let shown = 0;
        cards.forEach((card) => {
            const match = kind === 'all' || card.dataset.kind === kind;
            card.hidden = !match;
            if (match) shown++;
        });
        chips.forEach((chip) =>
            chip.setAttribute('aria-pressed', String(chip.dataset.filter === kind)));
        if (status) {
            status.textContent = kind === 'all'
                ? `Showing all ${shown} projects`
                : `Showing ${shown} ${kind} projects`;
        }
    };

    chips.forEach((chip) => {
        chip.addEventListener('click', () => apply(chip.dataset.filter ?? 'all'));
    });
}

/* ---------------------------------------------------------------------------
   Bootstrap
   ------------------------------------------------------------------------ */
function boot() {
    try { initLightbox(); } catch (error) { console.warn('[lightbox]', error); }
    try { initFilters(); } catch (error) { console.warn('[filters]', error); }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
