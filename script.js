(function() {
    const consoleEasterEggs = [
        { type: 'log', msg: '%c🎮 Welcome to GamersInUnity Studio!', style: 'font-size: 16px; font-weight: bold; color: #cba6f7;' },
        { type: 'log', msg: '%cFound the secret! Here\'s a cookie for you: 🍪', style: 'color: #f9e2af;' },
        { type: 'log', msg: '%cPress I on the 404 page... just saying 👀', style: 'color: #89dceb; font-style: italic;' },
        { type: 'warn', msg: 'Warning: Excessive gaming may cause uncontrollable excitement.' },
        { type: 'error', msg: 'Error: Could not find more fun. Please restart the game.' },
        { type: 'log', msg: '%c\n    ___  __          __\n   / _ \\/ /_  ____  / /__\n  / ___/ __ \\/ __ \\/ //_/\n / /  / / / / / / / ,<\n/_/  /_/ /_/_/ /_/_/|_|\n\n', style: 'font-family: monospace; font-size: 12px; color: #a6e3a1;' },
        { type: 'info', msg: 'Did you know? This site was handcrafted with caffeine and determination.' },
        { type: 'log', msg: '%cAchievement Unlocked: Console Explorer 🏆', style: 'color: #f38ba8; font-size: 14px;' },
    ];

    const randomEgg = consoleEasterEggs[Math.floor(Math.random() * consoleEasterEggs.length)];
    console[randomEgg.type](randomEgg.msg, randomEgg.style || '');

    console.log('%c\n   G  A  M  E  R  S  I  N  U  N  I  T  Y\n', 'font-size: 24px; font-weight: bold; background: linear-gradient(90deg, #cba6f7, #f5c2e7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');

    const secretCommands = {
        'swarn': () => console.log('%c👑 The one and only DemonKingSwarn!', 'color: #cba6f7; font-size: 14px;'),
        'giu': () => console.log('%cGamersInUnity - Making games since 2019!', 'color: #89b4fa;'),
        'rickroll': () => console.log('%cNever gonna give you up... 🎵', 'color: #f38ba8;'),
        '42': () => console.log('%cThe answer to life, the universe, and everything.', 'color: #f9e2af;'),
        'konami': () => console.log('%c⬆️ ⬆️ ⬇️ ⬇️ ⬅️ ➡️ ⬅️ ➡️ 🅱️ 🅰️', 'font-size: 20px; color: #a6e3a1;'),
        'help': () => {
            console.log('%c🕹️ Secret Commands:', 'font-weight: bold; color: #cba6f7;');
            console.log('  swarn, giu, rickroll, 42, konami, achievement, help');
        }
    };

    window.ciu = function(cmd) {
        if (cmd === 'achievement') {
            if (getCookie('consoleExplorerAchievement') === 'true') {
                console.log('%c🏆 Achievement already unlocked! Come back tomorrow!', 'color: #f38ba8;');
            } else {
                showAchievementNotification();
            }
            return;
        }
        if (secretCommands[cmd]) {
            secretCommands[cmd]();
        } else {
            console.log('%cUnknown command. Try "help"!', 'color: #f38ba8;');
        }
    };

    console.log('%c💡 Tip: Type ciu("help") for secret commands!', 'color: #94e2d5; font-style: italic;');

    function getCookie(name) {
        try {
            const nameEQ = name + '=';
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                if (cookie.indexOf(nameEQ) === 0) {
                    return cookie.substring(nameEQ.length);
                }
            }
        } catch (e) {}
        return null;
    }

    function setCookie(name, value, days) {
        try {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
        } catch (e) {}
    }

    const achievementShown = getCookie('consoleExplorerAchievement') === 'true';

    function showAchievementNotification() {
        if (achievementShown) return;

        setCookie('consoleExplorerAchievement', 'true', 365);

        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked</div>
                <div class="achievement-name">Console Explorer</div>
                <div class="achievement-subtitle">You found the developer tools!</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    let devToolsDetected = false;

    function detectDevTools() {
        if (devToolsDetected || achievementShown) return;
        devToolsDetected = true;
        showAchievementNotification();
    }

    const threshold = 170;
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
            detectDevTools();
        }
    }, 500);

    if (typeof window !== 'undefined') {
        const originalOnerror = window.onerror;
        window.onerror = function(msg, url, line, col, error) {
            detectDevTools();
            if (originalOnerror) return originalOnerror(msg, url, line, col, error);
        };
    }

    const consoleProxy = new Proxy({}, {
        get(target, prop) {
            if (prop === 'log' || prop === 'warn' || prop === 'error' || prop === 'info' || prop === 'debug') {
                return function(...args) {
                    detectDevTools();
                    return console[prop](...args);
                };
            }
            return console[prop];
        }
    });

    try {
        console.log('%c🚀 Achievement Unlocked: Console Explorer! 🏆', 'font-size: 16px; color: #66c0f4; font-weight: bold;');
    } catch (e) {}
})();

document.addEventListener("DOMContentLoaded", function() {
    initLoadingScreen();
    initParticles();
    initMobileMenu();
    initScrollAnimations();
    initTypingEffect();
});

function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;

    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.classList.add('fade-out');
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 2000);
    });
}

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

let subtitleMessages = [];
let currentMessageIndex = 0;

async function initTypingEffect() {
    const cursor = document.querySelector('.typing-cursor');
    const titleBreak = document.querySelector('.title-break');
    if (!cursor || !titleBreak) return;

    try {
        const response = await fetch('data/messages.json');
        if (response.ok) {
            const data = await response.json();
            if (data.subtitleMessages && data.subtitleMessages.length > 0) {
                subtitleMessages = data.subtitleMessages;
            }
        }
    } catch (e) {
        console.warn('Failed to load subtitle messages:', e);
    }

    cycleMessage();
}

function cycleMessage() {
    const titleBreak = document.querySelector('.title-break');
    const cursor = document.querySelector('.typing-cursor');
    if (!titleBreak || !cursor) return;

    if (subtitleMessages.length === 0) return;

    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const message = subtitleMessages[currentMessageIndex];
        
        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        const displayedText = message.substring(0, charIndex);
        titleBreak.textContent = displayedText;
        titleBreak.appendChild(cursor);

        let typeSpeed = isDeleting ? 20 : 40;

        if (!isDeleting && charIndex === message.length) {
            typeSpeed = 5000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentMessageIndex = (currentMessageIndex + 1) % subtitleMessages.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}
