// ==================== Mouse Trail Effect ====================
class MouseTrail {
    constructor() {
        this.particles = [];
        this.maxParticles = 15; // Reduced from 20
        this.colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
        this.lastTime = 0;
        this.throttleDelay = 50; // Add throttle to reduce CPU usage
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.createParticle(e));
        this.animate();
    }

    createParticle(e) {
        // Throttle particle creation
        const now = Date.now();
        if (now - this.lastTime < this.throttleDelay) return;
        this.lastTime = now;

        const particle = document.createElement('div');
        particle.className = 'mouse-particle';

        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const size = Math.random() * 6 + 3; // Reduced size range

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
            animation: particleFade 0.6s ease-out forwards;
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

    destroy() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
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

        // Adjust frequency based on performance
        const baseInterval = 2000 / config.count;
        const interval = window.effectsManager?.isLowPerformance
            ? baseInterval * 2
            : baseInterval;

        // Create decorations periodically
        this.intervalId = setInterval(() => {
            const maxDecorations = window.effectsManager?.isLowPerformance ? 10 : 20;
            if (document.querySelectorAll('.decoration-item').length < maxDecorations) {
                this.createDecoration(config);
            }
        }, interval);
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
        this.enabled = true;
        this.isLowPerformance = false;
        this.mouseTrail = null;
        this.clickRipple = null;
        this.backgroundDecoration = null;
        this.init();
    }

    init() {
        // Detect performance capability
        this.detectPerformance();

        // Auto-disable effects on low performance devices
        if (this.isLowPerformance) {
            console.log('Low performance device detected, optimizing effects...');
        }

        // Enable effects with appropriate settings
        this.enable();
    }

    detectPerformance() {
        // Check for hardware concurrency (CPU cores)
        const cores = navigator.hardwareConcurrency || 2;

        // Check for device memory (if available)
        const memory = navigator.deviceMemory || 4;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Check for mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Determine if device is low performance
        this.isLowPerformance = prefersReducedMotion ||
                                (cores <= 2 && memory <= 4) ||
                                (isMobile && memory <= 2);

        // Completely disable effects if user prefers reduced motion
        if (prefersReducedMotion) {
            this.enabled = false;
        }
    }

    enable() {
        if (!this.enabled) {
            console.log('Effects disabled due to user preference');
            return;
        }

        if (!this.isLowPerformance) {
            // Full effects for high-performance devices
            if (!this.mouseTrail) {
                this.mouseTrail = new MouseTrail();
            }
        }

        if (!this.clickRipple) {
            this.clickRipple = new ClickRipple();
        }

        if (!this.backgroundDecoration) {
            this.backgroundDecoration = new BackgroundDecoration();
        }

        document.body.classList.add('effects-enabled');
    }

    disable() {
        if (this.mouseTrail) {
            this.mouseTrail.destroy();
            this.mouseTrail = null;
        }
        if (this.backgroundDecoration) {
            this.backgroundDecoration.clear();
        }
        document.body.classList.remove('effects-enabled');
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
