// Simple script to verify image upload functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Upload fix script loaded');
    
    // Add an event listener to the image upload input to monitor for changes
    const imageUpload = document.getElementById('imageUpload');
    
    if (imageUpload) {
        console.log('Found image upload element');
        
        // Create a backup event handler in case the original one fails
        imageUpload.addEventListener('change', function(event) {
            console.log('Image upload change event detected');
            
            // Check if the normal processing happened
            setTimeout(function() {
                const canvas = document.querySelector('#canvasContainer canvas');
                const imageControls = document.getElementById('imageControls');
                
                if (!canvas) {
                    console.error('Canvas element not found after upload - possible functionality issue');
                    alert('There was an issue processing the image. Please try again.');
                }
                
                if (imageControls && imageControls.style.display !== 'block') {
                    console.log('Image controls not shown - attempting to show them');
                    imageControls.style.display = 'block';
                }
            }, 500);
        }, false);
    }
    
    // Monitor for JavaScript errors
    window.addEventListener('error', function(event) {
        console.error('JavaScript error detected:', event.message);
        console.error('Source:', event.filename, 'Line:', event.lineno);
    });
}); 