// Notification System for Enhanced UX

class NotificationSystem {
    constructor() {
        this.container = null;
        this.timeout = 4000; // Default timeout (4 seconds)
        this.init();
    }
    
    init() {
        // Create notification container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
            
            // Add initial style
            this.addStyles();
        }
    }
    
    // Add notification styles
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                width: 100%;
                max-width: 400px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }
            
            .notification {
                background-color: white;
                color: #333;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 12px;
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: auto;
                position: relative;
                overflow: hidden;
            }
            
            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .notification.success {
                border-left: 4px solid #06d6a0;
            }
            
            .notification.info {
                border-left: 4px solid #3a86ff;
            }
            
            .notification.warning {
                border-left: 4px solid #ffbe0b;
            }
            
            .notification.error {
                border-left: 4px solid #ef476f;
            }
            
            .notification-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                flex-shrink: 0;
                color: white;
            }
            
            .notification.success .notification-icon {
                background-color: #06d6a0;
            }
            
            .notification.info .notification-icon {
                background-color: #3a86ff;
            }
            
            .notification.warning .notification-icon {
                background-color: #ffbe0b;
            }
            
            .notification.error .notification-icon {
                background-color: #ef476f;
            }
            
            .notification-content {
                flex-grow: 1;
            }
            
            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .notification-message {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .notification-close {
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: rgba(0, 0, 0, 0.05);
                color: #666;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                background-color: rgba(0, 0, 0, 0.1);
                color: #333;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background-color: rgba(0, 0, 0, 0.1);
                width: 100%;
                transform-origin: left center;
            }
            
            .notification.success .notification-progress {
                background-color: #06d6a0;
            }
            
            .notification.info .notification-progress {
                background-color: #3a86ff;
            }
            
            .notification.warning .notification-progress {
                background-color: #ffbe0b;
            }
            
            .notification.error .notification-progress {
                background-color: #ef476f;
            }
            
            @media (max-width: 480px) {
                .notification-container {
                    max-width: 90%;
                    padding: 0 10px;
                }
                
                .notification {
                    padding: 12px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Show notification
    show(options = {}) {
        const {
            title = 'تنبيه',
            message = '',
            type = 'info', // 'success', 'info', 'warning', 'error'
            timeout = this.timeout,
            icon = null
        } = options;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Set notification icon
        let iconHtml = '';
        if (icon) {
            iconHtml = icon;
        } else {
            switch (type) {
                case 'success':
                    iconHtml = '<i class="fas fa-check"></i>';
                    break;
                case 'info':
                    iconHtml = '<i class="fas fa-info"></i>';
                    break;
                case 'warning':
                    iconHtml = '<i class="fas fa-exclamation"></i>';
                    break;
                case 'error':
                    iconHtml = '<i class="fas fa-times"></i>';
                    break;
                default:
                    iconHtml = '<i class="fas fa-bell"></i>';
            }
        }
        
        // Build notification HTML
        notification.innerHTML = `
            <div class="notification-icon">${iconHtml}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-close">&times;</div>
            <div class="notification-progress"></div>
        `;
        
        // Add notification to container
        this.container.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Get progress bar
        const progressBar = notification.querySelector('.notification-progress');
        
        // Add animation to progress bar
        progressBar.style.animation = `progressShrink ${timeout}ms linear forwards`;
        
        // Add @keyframes rule if it doesn't exist
        if (!document.querySelector('#notification-keyframes')) {
            const keyframesStyle = document.createElement('style');
            keyframesStyle.id = 'notification-keyframes';
            keyframesStyle.textContent = `
                @keyframes progressShrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `;
            document.head.appendChild(keyframesStyle);
        }
        
        // Close notification on click
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.close(notification);
        });
        
        // Auto-close notification after timeout
        const timeoutId = setTimeout(() => {
            this.close(notification);
        }, timeout);
        
        // Store timeout ID on the notification element
        notification.dataset.timeoutId = timeoutId;
        
        // Pause progress bar animation on hover
        notification.addEventListener('mouseenter', () => {
            // Pause the progress bar animation
            progressBar.style.animationPlayState = 'paused';
            
            // Clear the auto-close timeout
            clearTimeout(notification.dataset.timeoutId);
        });
        
        // Resume progress bar animation on mouse leave
        notification.addEventListener('mouseleave', () => {
            // Resume the progress bar animation
            progressBar.style.animationPlayState = 'running';
            
            // Set a new timeout for auto-close
            const remainingTime = (1 - parseFloat(getComputedStyle(progressBar).transform.split(',')[0].replace('matrix(', ''))) * timeout;
            
            const newTimeoutId = setTimeout(() => {
                this.close(notification);
            }, remainingTime);
            
            notification.dataset.timeoutId = newTimeoutId;
        });
        
        return notification;
    }
    
    // Close notification
    close(notification) {
        // Clear any existing timeout
        clearTimeout(notification.dataset.timeoutId);
        
        // Start exit animation
        notification.classList.remove('show');
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        // Remove from DOM after animation finishes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Utility methods for common notifications
    success(message, title = 'تم بنجاح') {
        return this.show({
            title,
            message,
            type: 'success'
        });
    }
    
    info(message, title = 'معلومة') {
        return this.show({
            title,
            message,
            type: 'info'
        });
    }
    
    warning(message, title = 'تنبيه') {
        return this.show({
            title,
            message,
            type: 'warning'
        });
    }
    
    error(message, title = 'خطأ') {
        return this.show({
            title,
            message,
            type: 'error'
        });
    }
}

// Create global notification instance
const notifications = new NotificationSystem();

// Export for other scripts to use
window.notifications = notifications; 