// Apple-inspired Product Showcase Animations - MINIMAL VERSION
// This script only adds visual enhancements and avoids manipulating canvas functionality

document.addEventListener('DOMContentLoaded', () => {
    // Wait for the original scripts to initialize
    setTimeout(() => {
        // Only enable non-invasive visual enhancements
        initScrollAnimations();
        addSubtleEffects();
    }, 1500); // Longer delay to ensure original functionality is ready
});

// Only add scroll-based animations like Apple uses
function initScrollAnimations() {
    // Elements to animate on scroll
    const elementsToAnimate = [
        { selector: '.hero-section', effect: 'fade-in' },
        { selector: '.feature-item', effect: 'stagger-fade-in' }
    ];
    
    // Set up intersection observer
    const options = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Apply different animations based on the data-effect attribute
                switch(element.dataset.effect) {
                    case 'fade-in':
                        element.classList.add('animate-fade-in');
                        break;
                    case 'stagger-fade-in':
                        element.classList.add('animate-stagger-fade-in');
                        break;
                    default:
                        element.classList.add('animate-fade-in');
                }
                
                // Stop observing after animation starts
                observer.unobserve(element);
            }
        });
    }, options);
    
    // Add observers to all elements
    elementsToAnimate.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach((el, index) => {
            el.dataset.effect = item.effect;
            el.style.setProperty('--item-index', index);
            observer.observe(el);
        });
    });
}

// Add subtle visual effects that don't affect functionality
function addSubtleEffects() {
    // Add subtle background gradient animation to the page
    const body = document.body;
    const gradientBackground = document.createElement('div');
    gradientBackground.classList.add('apple-gradient-bg');
    gradientBackground.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 50% 50%, rgba(245, 245, 247, 0.3), rgba(245, 245, 247, 0));
        pointer-events: none;
        z-index: -1;
    `;
    body.appendChild(gradientBackground);
    
    // Add subtle text shadow to headers for depth
    const headers = document.querySelectorAll('h1, h2, h3');
    headers.forEach(header => {
        header.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
    });
    
    // Watch for canvas creation without modifying it directly
    const canvasContainer = document.getElementById('canvasContainer');
    if (canvasContainer) {
        // Add subtle background shine effect to canvas container
        const shineEffect = document.createElement('div');
        shineEffect.classList.add('apple-shine-effect');
        shineEffect.style.cssText = `
            position: absolute;
            top: 0;
            left: -150%;
            width: 100%;
            height: 100%;
            background: linear-gradient(to right, 
                rgba(255, 255, 255, 0) 0%, 
                rgba(255, 255, 255, 0.2) 50%, 
                rgba(255, 255, 255, 0) 100%);
            transform: skewX(-25deg);
            pointer-events: none;
            z-index: 1;
            animation: shineSweep 5s infinite ease-in-out;
        `;
        canvasContainer.style.position = 'relative';
        canvasContainer.style.overflow = 'hidden';
        canvasContainer.appendChild(shineEffect);
        
        // Add keyframe animation for the shine effect
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shineSweep {
                0% { left: -150%; }
                48% { left: -150%; }
                50% { left: 150%; }
                100% { left: 150%; }
            }
        `;
        document.head.appendChild(style);
    }
}

// No dynamic element or transform manipulations that would affect functionality 