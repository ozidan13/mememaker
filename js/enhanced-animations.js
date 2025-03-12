// Enhanced Animations for Professional UI/UX

document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations after a short delay to ensure DOM is ready
    setTimeout(() => {
        initEnhancedAnimations();
        setupMemeItemAnimations();
        initDragEffects();
        initModalAnimations();
        initButtonEffects();
        initTextBlockAnimations();
        initScrollAnimations();
        enhanceModalInteractions();
    }, 500);
});

// Set up main animations
function initEnhancedAnimations() {
    // Add animation classes to elements
    const elementsToAnimate = document.querySelectorAll('.feature-item, .section-title, .editor-container');
    
    // Create intersection observer for elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each element
    elementsToAnimate.forEach(el => {
        observer.observe(el);
        // Add base animation class
        el.classList.add('animate-on-scroll');
    });
}

// Set up meme item hover and entrance animations
function setupMemeItemAnimations() {
    const gallery = document.getElementById('memesGallery');
    
    if (gallery) {
        // Use Mutation Observer to watch for new memes being added to the gallery
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node, index) => {
                        if (node.nodeType === 1 && node.classList.contains('meme-item')) {
                            // Add staggered animation delay based on index
                            node.style.setProperty('--item-index', index);
                            node.classList.add('meme-item-animate');
                            
                            // Add subtle hover animation
                            node.addEventListener('mouseenter', () => {
                                node.classList.add('meme-hover');
                            });
                            
                            node.addEventListener('mouseleave', () => {
                                node.classList.remove('meme-hover');
                            });
                            
                            // Add click interaction notification
                            node.addEventListener('click', () => {
                                if (window.notifications) {
                                    window.notifications.info('اضغط على زر التحميل للحفظ أو اضغط خارج الإطار للإغلاق', 'عرض الميم');
                                }
                            });
                        }
                    });
                    
                    // Check if this is the first meme being added to the gallery
                    const memeItems = gallery.querySelectorAll('.meme-item');
                    if (memeItems.length === 1) {
                        // First meme was added, show success notification
                        if (window.notifications) {
                            window.notifications.success('تم إنشاء أول ميم بنجاح! يمكنك إنشاء المزيد.');
                        }
                    }
                }
            });
        });
        
        observer.observe(gallery, { childList: true });
    }
}

// Enhanced modal animations
function initModalAnimations() {
    const modal = document.getElementById('memeModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (modal && closeBtn) {
        // Add animation class when modal is shown
        const showModal = () => {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        };
        
        const hideModal = () => {
            modal.classList.add('hiding');
            
            setTimeout(() => {
                modal.classList.remove('show', 'hiding');
                document.body.style.overflow = '';
            }, 300);
        };
        
        // Override modal opening to add animations
        const originalShow = modal.style.display;
        
        // Use MutationObserver to detect when the modal is shown
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (modal.style.display === 'block' && !modal.classList.contains('show')) {
                        showModal();
                    }
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
        
        // Close with animation
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal();
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
}

// Add drag feedback effects
function initDragEffects() {
    // Add drag effects to draggable elements (text blocks)
    document.addEventListener('mousedown', (e) => {
        const canvasText = e.target.closest('.canvas-text');
        if (canvasText) {
            canvasText.classList.add('dragging');
            
            // Remove the class when dragging stops
            const stopDragging = () => {
                canvasText.classList.remove('dragging');
                document.removeEventListener('mouseup', stopDragging);
            };
            
            document.addEventListener('mouseup', stopDragging);
        }
    });
}

// Add button interaction effects
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn, .upload-label, .download-btn');
    
    buttons.forEach(button => {
        // Add ripple effect
        button.addEventListener('click', function(e) {
            // Remove any existing ripples
            const ripples = this.querySelectorAll('.ripple');
            ripples.forEach(ripple => ripple.remove());
            
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            // Set ripple position
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add animations to text blocks
function initTextBlockAnimations() {
    const textContainer = document.getElementById('textBlocksContainer');
    
    if (textContainer) {
        // Use MutationObserver to watch for new text blocks being added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node, index) => {
                        if (node.nodeType === 1 && node.classList.contains('text-block')) {
                            // Add entrance animation
                            node.classList.add('text-block-enter');
                            
                            // Remove entrance animation after it completes
                            setTimeout(() => {
                                node.classList.remove('text-block-enter');
                            }, 500);
                            
                            // Add animation to delete button
                            const deleteBtn = node.querySelector('.delete-text-btn');
                            if (deleteBtn) {
                                deleteBtn.addEventListener('click', () => {
                                    node.classList.add('text-block-exit');
                                    
                                    // Show notification for text deletion
                                    if (window.notifications) {
                                        window.notifications.info('تم حذف النص بنجاح');
                                    }
                                });
                            }
                            
                            // Add notifications for color changes
                            const colorPicker = node.querySelector('.color-picker');
                            if (colorPicker) {
                                colorPicker.addEventListener('change', () => {
                                    if (window.notifications) {
                                        window.notifications.info('تم تغيير لون النص');
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(textContainer, { childList: true });
    }
}

// Add scroll-triggered animations
function initScrollAnimations() {
    // Create animation for elements that should animate on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Enhanced modal interactions
function enhanceModalInteractions() {
    const downloadBtn = document.getElementById('downloadMeme');
    
    if (downloadBtn) {
        const originalClick = downloadBtn.onclick;
        
        downloadBtn.addEventListener('click', (e) => {
            // Call original handler if it exists
            if (typeof originalClick === 'function') {
                originalClick.call(downloadBtn, e);
            }
            
            // Show download notification
            if (window.notifications) {
                setTimeout(() => {
                    window.notifications.success('تم تحميل الميم بنجاح!', 'تحميل');
                }, 500);
            }
            
            // Close modal after download
            const modal = document.getElementById('memeModal');
            if (modal && modal.classList.contains('show')) {
                setTimeout(() => {
                    modal.classList.add('hiding');
                    
                    setTimeout(() => {
                        modal.classList.remove('show', 'hiding');
                        document.body.style.overflow = '';
                        modal.style.display = 'none';
                    }, 300);
                }, 800);
            }
        });
    }
    
    // Enhance filter selections with feedback
    const presetFilterBtns = document.querySelectorAll('.preset-filter-btn');
    presetFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterName = btn.textContent.trim();
            if (window.notifications) {
                window.notifications.info(`تم تطبيق فلتر "${filterName}" على الصورة`);
            }
        });
    });
    
    // Enhance filter sliders with feedback
    const filterSliders = document.querySelectorAll('.filter-slider');
    const sliderFeedbackTimeout = {};
    
    filterSliders.forEach(slider => {
        slider.addEventListener('change', () => {
            const filterType = slider.id;
            const filterLabel = slider.previousElementSibling.textContent;
            
            // Clear any existing timeout for this slider
            if (sliderFeedbackTimeout[filterType]) {
                clearTimeout(sliderFeedbackTimeout[filterType]);
            }
            
            // Set a new timeout to show notification after user stops sliding
            sliderFeedbackTimeout[filterType] = setTimeout(() => {
                if (window.notifications) {
                    window.notifications.info(`تم تعديل ${filterLabel} إلى ${slider.value}%`);
                }
            }, 800);
        });
    });
}

// Add dynamic CSS for animations
function addAnimationStyles() {
    const style = document.createElement('style');
    
    style.textContent = `
        /* Ripple effect for buttons */
        .btn, .upload-label, .download-btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
            z-index: 1;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* Text block animations */
        .text-block-enter {
            animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .text-block-exit {
            animation: slideOutLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutLeft {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-30px);
            }
        }
        
        /* Dragging animation */
        .canvas-text.dragging {
            cursor: grabbing !important;
            transform: scale(1.05) !important;
            opacity: 0.9 !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
            transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s !important;
        }
        
        /* Meme item animations */
        .meme-item-animate {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: calc(var(--item-index) * 0.1s);
        }
        
        .meme-hover img {
            transform: scale(1.05);
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Modal animations */
        .modal.show .modal-content {
            animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .modal.hiding .modal-content {
            animation: zoomOut 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes zoomIn {
            from {
                transform: scale(0.95);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes zoomOut {
            from {
                transform: scale(1);
                opacity: 1;
            }
            to {
                transform: scale(0.95);
                opacity: 0;
            }
        }
        
        /* Scroll animations */
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .animate-on-scroll.in-view {
            opacity: 1;
            transform: translateY(0);
        }
        
        .section-title.animate-on-scroll {
            transform: translateY(20px);
        }
        
        /* Filter button active state */
        .preset-filter-btn.active {
            position: relative;
            overflow: hidden;
        }
        
        .preset-filter-btn.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(to right, #3a86ff, #8338ec);
            animation: slideInFromLeft 0.3s ease forwards;
        }
        
        @keyframes slideInFromLeft {
            from {
                transform: translateX(-100%);
            }
            to {
                transform: translateX(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Call to add animation styles
addAnimationStyles(); 