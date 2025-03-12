// Apple-inspired animations and interactions

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations and UI enhancements
    setTimeout(() => {
        // Delay initialization to ensure original scripts have run
        initAppleStyleAnimations();
        enhanceUI();
        initParallaxEffects();
        initMemeGalleryAnimations();
        initSmoothScrolling();
    }, 1000); // Wait 1 second to ensure original scripts have initialized
});

// Add Apple-style animations and transitions
function initAppleStyleAnimations() {
    // Add staggered animation to any elements that should fade in
    const animateElements = document.querySelectorAll('.animate-in');
    if (animateElements.length) {
        animateElements.forEach((el, index) => {
            el.style.setProperty('--index', index);
            
            // Use Intersection Observer to trigger animations when elements come into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(el);
        });
    }
    
    // Don't try to intercept the image upload event - let the original handle it
    // Instead, just add a class when controls are shown by the original script
    const imageControls = document.getElementById('imageControls');
    if (imageControls) {
        // Use MutationObserver to detect when the original script makes it visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (imageControls.style.display === 'block') {
                        imageControls.classList.add('visible');
                    }
                }
            });
        });
        
        observer.observe(imageControls, { attributes: true });
    }
}

// Add UI enhancements typical of Apple's site
function enhanceUI() {
    // Make header sticky with backdrop blur on scroll
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }
    
    // Do NOT modify button behavior, just add visual effects
    // Do NOT replace the modal functionality
}

// Add parallax effects to various elements - non-invasive
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    if (parallaxElements.length) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.1;
                const offset = scrollY * speed;
                // Use transform property with translateY only, not affecting other transforms
                const currentTransform = window.getComputedStyle(el).transform;
                if (currentTransform === 'none' || currentTransform === 'matrix(1, 0, 0, 1, 0, 0)') {
                    el.style.transform = `translateY(${offset}px)`;
                }
                // Don't override canvas transform if it exists
            });
        });
    }
}

// Add staggered animation to meme gallery items
function initMemeGalleryAnimations() {
    const gallery = document.getElementById('memesGallery');
    
    if (gallery) {
        // Use Mutation Observer to watch for new memes being added to the gallery
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node, index) => {
                        if (node.nodeType === 1 && node.classList.contains('meme-item')) {
                            // Set the staggered animation delay
                            node.style.setProperty('--index', index);
                            node.classList.add('animate-in');
                        }
                    });
                }
            });
        });
        
        observer.observe(gallery, { childList: true });
    }
}

// Implement smooth scrolling for a premium feel
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for header
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add CSS classes dynamically - but only those that won't conflict
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animation Classes */
        .animate-fade-in {
            animation: appleAnimFadeIn 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
        }
        
        .animate-slide-up {
            animation: appleAnimSlideUp 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
        }
        
        .animate-stagger-fade-in {
            opacity: 0;
            animation: appleAnimFadeIn 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
            animation-delay: calc(var(--item-index) * 0.1s);
        }
        
        /* Keyframes */
        @keyframes appleAnimFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes appleAnimSlideUp {
            from { 
                opacity: 0;
                transform: translateY(30px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Call this function to add the dynamic styles
addDynamicStyles(); 