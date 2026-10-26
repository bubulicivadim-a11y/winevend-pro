// ============================
// WineVend Pro v2.0 — Specificație Tehnică
// Interactive Logic (Tabs, Mobile Nav, Lightbox, Print)
// ============================

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // MOBILE NAV HAMBURGER
    // ============================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        // Auto-close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    // Active link highlight on scroll
    const sections = document.querySelectorAll('.section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navAnchors.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // ============================
    // TABS (Desen Tehnic)
    // ============================
    document.querySelectorAll('.tabs-container').forEach(container => {
        const buttons = container.querySelectorAll('.tab-btn');
        const contents = container.querySelectorAll('.tab-content');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const target = container.querySelector('#' + btn.dataset.target);
                if (target) target.classList.add('active');
            });
        });
    });

    // ============================
    // LIGHTBOX for Drawings
    // ============================
    const lightboxOverlay = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxClose = document.getElementById('lightboxClose');

    // Attach to all .drawing-container elements
    document.querySelectorAll('.drawing-container').forEach(container => {
        container.addEventListener('click', () => {
            // Clone the SVG/content inside the drawing container
            const clone = container.cloneNode(true);
            clone.style.cursor = 'default';
            clone.style.transform = 'scale(1.0)';
            lightboxContent.innerHTML = '';
            lightboxContent.appendChild(clone);
            lightboxOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) closeLightbox();
        });
    }

    function closeLightbox() {
        lightboxOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // ============================
    // PRINT / PDF
    // ============================
    const btnPrint = document.getElementById('btnPrint');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    // ============================
    // INTERSECTION OBSERVER for fade-in animations
    // ============================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.subsystem-card, .flow-step, .kpi-card, .info-chip').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

});
