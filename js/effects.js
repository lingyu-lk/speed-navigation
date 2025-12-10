// ==================== Mouse Trail Effect ====================
class MouseTrail {
    constructor() {
        this.particles = [];
        this.maxParticles = 20;
        this.colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.createParticle(e));
        this.animate();
    }

    createParticle(e) {
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';

        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 8 + 4;

        particle.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: particleFade 0.8s ease-out forwards;
        `;

        document.body.appendChild(particle);
        this.particles.push(particle);

        if (this.particles.length > this.maxParticles) {
            const oldParticle = this.particles.shift();
            if (oldParticle && oldParticle.parentNode) {
                oldParticle.remove();
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
    }
}

// ==================== Click Ripple Effect ====================
class ClickRipple {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => this.createRipple(e));
    }

    createRipple(e) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;

        document.body.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
}

// ==================== Background Decoration ====================
class BackgroundDecoration {
    constructor() {
        this.container = null;
        this.intervalId = null;
        this.decorations = {
            light: { emoji: '✨', count: 3, duration: 8, name: '星光' },
            dark: { emoji: '⭐', count: 4, duration: 10, name: '繁星' },
            cherry: { emoji: '🌸', count: 5, duration: 12, name: '樱花' },
            ocean: { emoji: '💧', count: 6, duration: 10, name: '水滴' },
            forest: { emoji: '🍃', count: 5, duration: 15, name: '树叶' },
            sunset: { emoji: '☄️', count: 3, duration: 6, name: '流星' }
        };
        this.init();
    }

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'background-decorations';
        document.body.appendChild(this.container);

        // Start with current theme
        this.updateTheme();

        // Listen for theme changes
        this.observeThemeChanges();
    }

    observeThemeChanges() {
        // Watch for data-theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.updateTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    updateTheme() {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        this.clear();
        this.start(theme);
    }

    start(theme) {
        const config = this.decorations[theme];
        if (!config) return;

        // Create decorations periodically
        this.intervalId = setInterval(() => {
            if (document.querySelectorAll('.decoration-item').length < 20) {
                this.createDecoration(config);
            }
        }, 2000 / config.count);
    }

    createDecoration(config) {
        const decoration = document.createElement('div');
        decoration.className = 'decoration-item';

        // Get current theme
        const theme = document.documentElement.getAttribute('data-theme') || 'light';

        // Special handling for ocean theme - create CSS bubble
        if (theme === 'ocean') {
            decoration.classList.add('css-bubble');
            decoration.innerHTML = '<div class="bubble-shine"></div>';
        } else {
            decoration.textContent = config.emoji;
        }

        // Random horizontal position
        const startX = Math.random() * 100;
        decoration.style.left = `${startX}%`;

        // Random size
        const size = Math.random() * 1.5 + 1;
        if (theme === 'ocean') {
            decoration.style.width = `${size * 30}px`;
            decoration.style.height = `${size * 30}px`;
        } else {
            decoration.style.fontSize = `${size}em`;
        }

        // Random animation duration
        const duration = config.duration + Math.random() * 3;
        decoration.style.animationDuration = `${duration}s`;

        // Random rotation
        const rotation = Math.random() * 360;
        decoration.style.setProperty('--rotation', `${rotation}deg`);

        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 100;
        decoration.style.setProperty('--drift', `${drift}px`);

        this.container.appendChild(decoration);

        // Remove after animation
        setTimeout(() => {
            decoration.remove();
        }, duration * 1000);
    }

    clear() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// ==================== Effects Manager ====================
class EffectsManager {
    constructor() {
        this.enabled = true; // 默认开启
        this.mouseTrail = null;
        this.clickRipple = null;
        this.backgroundDecoration = null;
        this.init();
    }

    init() {
        // 直接启用特效
        this.enable();
    }

    enable() {
        if (!this.mouseTrail) {
            this.mouseTrail = new MouseTrail();
        }
        if (!this.clickRipple) {
            this.clickRipple = new ClickRipple();
        }
        if (!this.backgroundDecoration) {
            this.backgroundDecoration = new BackgroundDecoration();
        }
        document.body.classList.add('effects-enabled');
    }
}

// Auto initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.effectsManager = new EffectsManager();
    });
} else {
    window.effectsManager = new EffectsManager();
}
