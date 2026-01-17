document.addEventListener("DOMContentLoaded", function() {
    initParticles();
    initMobileMenu();
    initScrollAnimations();
});

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const colors = [
        '#f5e0dc', '#f2cdcd', '#f5c2e7', '#cba6f7',
        '#89b4fa', '#94e2d5', '#a6e3a1', '#f9e2af',
        '#fab387', '#f38ba8'
    ];

    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';

        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 6px ${color}`;

        const size = 4 + Math.random() * 6;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        particlesContainer.appendChild(particle);
    }
}

function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.querySelector('.primary-nav');
    const body = document.body;

    if (!burger || !nav) return;

    burger.addEventListener('click', function() {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            burger.classList.remove('active');
            nav.classList.remove('active');
            body.style.overflow = '';
        });
    });

    document.addEventListener('click', function(e) {
        if (!burger.contains(e.target) && !nav.contains(e.target)) {
            burger.classList.remove('active');
            nav.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });
}
