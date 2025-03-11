// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const imageUpload = document.getElementById('imageUpload');
    const canvasContainer = document.getElementById('canvasContainer');
    const addTextBtn = document.getElementById('addTextBtn');
    const textBlocksContainer = document.getElementById('textBlocksContainer');
    const saveMemeBtn = document.getElementById('saveMemeBtn');
    const memesGallery = document.getElementById('memesGallery');
    const memeModal = document.getElementById('memeModal');
    const closeModal = document.querySelector('.close-modal');
    const downloadMeme = document.getElementById('downloadMeme');
    
    // Variables
    let uploadedImage = null;
    let textBlocks = [];
    let textCounter = 0;
    const maxTextBlocks = 5;
    let canvas = null;
    let ctx = null;
    const defaultTextColor = '#ffffff'; // Default text color (white)
    const defaultStrokeColor = '#000000'; // Default stroke color (black)
    const defaultStrokeWidth = 2; // Default stroke width
    
    // Event Listeners
    imageUpload.addEventListener('change', handleImageUpload);
    addTextBtn.addEventListener('click', addTextBlock);
    saveMemeBtn.addEventListener('click', saveMeme);
    closeModal.addEventListener('click', closeModalFunction);
    
    // Functions
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImage = new Image();
            uploadedImage.onload = function() {
                setupCanvas();
                drawImage();
            };
            uploadedImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function setupCanvas() {
        // Store existing text blocks temporarily
        const existingTextBlocks = [...textBlocks];
        
        // Clear canvas container
        canvasContainer.innerHTML = '';
        
        // Create canvas element
        canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);
        
        // Set canvas dimensions based on image
        const containerWidth = canvasContainer.clientWidth;
        const aspectRatio = uploadedImage.height / uploadedImage.width;
        
        canvas.width = containerWidth;
        canvas.height = containerWidth * aspectRatio;
        
        // Get canvas context
        ctx = canvas.getContext('2d');
        
        // Re-add text blocks to canvas
        existingTextBlocks.forEach(block => {
            const canvasText = document.createElement('div');
            canvasText.className = 'canvas-text';
            canvasText.id = block.id;
            canvasText.textContent = block.text;
            canvasText.style.top = block.y + 'px';
            canvasText.style.left = block.x + 'px';
            canvasText.style.fontSize = block.fontSize + 'px';
            canvasText.style.color = block.color;
            
            // Add to canvas container
            canvasContainer.appendChild(canvasText);
            
            // Make text draggable
            makeTextDraggable(canvasText);
            
            // Update block element reference
            block.element = canvasText;
        });
        
        // Update textBlocks array
        textBlocks = existingTextBlocks;
    }
    
    function drawImage() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
        
        // Draw text blocks
        drawTextBlocks();
    }
    
    function addTextBlock() {
        // Check if maximum text blocks reached
        if (textBlocks.length >= maxTextBlocks && !confirm('تجاوزت الحد الأقصى للنصوص (5). هل تريد إضافة المزيد؟')) {
            return;
        }
        
        textCounter++;
        
        // Create text block element
        const textBlockId = `text-${textCounter}`;
        const textBlock = document.createElement('div');
        textBlock.className = 'text-block';
        textBlock.innerHTML = `
            <input type="text" id="${textBlockId}-input" placeholder="أدخل النص هنا...">
            <div class="text-controls-row">
                <input type="color" id="${textBlockId}-color" value="${defaultTextColor}" class="color-picker" title="لون النص">
                <div class="size-controls">
                    <button class="size-btn decrease-size" data-id="${textBlockId}" title="تصغير النص"><i class="fas fa-minus"></i></button>
                    <span class="size-value" id="${textBlockId}-size">20</span>
                    <button class="size-btn increase-size" data-id="${textBlockId}" title="تكبير النص"><i class="fas fa-plus"></i></button>
                </div>
                <button class="delete-text-btn" data-id="${textBlockId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="text-controls-row stroke-controls">
                <label>الحدود:</label>
                <input type="color" id="${textBlockId}-stroke-color" value="${defaultStrokeColor}" class="color-picker" title="لون الحدود">
                <div class="size-controls">
                    <button class="size-btn decrease-stroke" data-id="${textBlockId}" title="تقليل سمك الحدود"><i class="fas fa-minus"></i></button>
                    <span class="size-value" id="${textBlockId}-stroke-width">${defaultStrokeWidth}</span>
                    <button class="size-btn increase-stroke" data-id="${textBlockId}" title="زيادة سمك الحدود"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        `;
        
        // Add text block to container
        textBlocksContainer.appendChild(textBlock);
        
        // Get input element
        const textInput = document.getElementById(`${textBlockId}-input`);
        
        // Add event listeners
        textInput.addEventListener('input', function() {
            updateTextBlock(textBlockId, this.value);
        });
        
        // Add color picker event listener
        const colorPicker = document.getElementById(`${textBlockId}-color`);
        colorPicker.addEventListener('input', function() {
            updateTextColor(textBlockId, this.value);
        });
        
        // Add size control event listeners
        const decreaseSizeBtn = textBlock.querySelector(`.decrease-size[data-id="${textBlockId}"]`);
        const increaseSizeBtn = textBlock.querySelector(`.increase-size[data-id="${textBlockId}"]`);
        
        decreaseSizeBtn.addEventListener('click', function() {
            updateTextSize(textBlockId, -2); // Decrease by 2px
        });
        
        increaseSizeBtn.addEventListener('click', function() {
            updateTextSize(textBlockId, 2); // Increase by 2px
        });
        
        // Add stroke color picker event listener
        const strokeColorPicker = document.getElementById(`${textBlockId}-stroke-color`);
        strokeColorPicker.addEventListener('input', function() {
            updateStrokeColor(textBlockId, this.value);
        });
        
        // Add stroke width control event listeners
        const decreaseStrokeBtn = textBlock.querySelector(`.decrease-stroke[data-id="${textBlockId}"]`);
        const increaseStrokeBtn = textBlock.querySelector(`.increase-stroke[data-id="${textBlockId}"]`);
        
        decreaseStrokeBtn.addEventListener('click', function() {
            updateStrokeWidth(textBlockId, -1); // Decrease by 1px
        });
        
        increaseStrokeBtn.addEventListener('click', function() {
            updateStrokeWidth(textBlockId, 1); // Increase by 1px
        });
        
        // Add delete button event listener
        const deleteBtn = textBlock.querySelector('.delete-text-btn');
        deleteBtn.addEventListener('click', function() {
            deleteTextBlock(textBlockId);
        });
        
        // Create canvas text element if image is uploaded
        if (uploadedImage) {
            createCanvasText(textBlockId);
        }
    }
    
    function createCanvasText(textBlockId) {
        // Create draggable text element on canvas
        const canvasText = document.createElement('div');
        canvasText.className = 'canvas-text';
        canvasText.id = textBlockId;
        canvasText.textContent = 'أدخل النص هنا...';
        canvasText.style.top = '50px';
        canvasText.style.left = '50px';
        
        // Add to canvas container
        canvasContainer.appendChild(canvasText);
        
        // Make text draggable
        makeTextDraggable(canvasText);
        
        // Add to text blocks array
        textBlocks.push({
            id: textBlockId,
            text: 'أدخل النص هنا...',
            x: 50,
            y: 50,
            fontSize: 20, // Default font size
            color: defaultTextColor, // Default color
            strokeColor: defaultStrokeColor, // Default stroke color
            strokeWidth: defaultStrokeWidth, // Default stroke width
            element: canvasText
        });
    }
    
    function updateTextBlock(id, text) {
        // Update text in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            textBlock.text = text;
            textBlock.element.textContent = text;
            drawImage(); // Redraw to update canvas
        }
    }
    
    function updateTextColor(id, color) {
        // Update text color in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            textBlock.color = color;
            textBlock.element.style.color = color;
            drawImage(); // Redraw to update canvas
        }
    }
    
    function updateTextSize(id, change) {
        // Update text size in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            // Ensure font size stays within reasonable limits (10px to 60px)
            const newSize = Math.max(10, Math.min(60, textBlock.fontSize + change));
            textBlock.fontSize = newSize;
            textBlock.element.style.fontSize = `${newSize}px`;
            
            // Update size display in controls
            const sizeDisplay = document.getElementById(`${id}-size`);
            if (sizeDisplay) {
                sizeDisplay.textContent = newSize;
            }
            
            // Real-time update without full redraw for better performance
            requestAnimationFrame(() => drawImage());
        }
    }
    
    function updateStrokeColor(id, color) {
        // Update stroke color in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            textBlock.strokeColor = color;
            // Real-time update
            requestAnimationFrame(() => drawImage());
        }
    }
    
    function updateStrokeWidth(id, change) {
        // Update stroke width in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            // Ensure stroke width stays within reasonable limits (0px to 10px)
            const newWidth = Math.max(0, Math.min(10, textBlock.strokeWidth + change));
            textBlock.strokeWidth = newWidth;
            
            // Update width display in controls
            const widthDisplay = document.getElementById(`${id}-stroke-width`);
            if (widthDisplay) {
                widthDisplay.textContent = newWidth;
            }
            
            // Real-time update
            requestAnimationFrame(() => drawImage());
        }
    }
    
    function deleteTextBlock(id) {
        // Remove from DOM
        const textBlockElement = document.getElementById(id);
        if (textBlockElement) {
            textBlockElement.remove();
        }
        
        // Remove input from DOM
        const textBlockInputContainer = document.querySelector(`.text-block:has(button[data-id="${id}"])`);
        if (textBlockInputContainer) {
            textBlockInputContainer.remove();
        }
        
        // Remove from array
        textBlocks = textBlocks.filter(block => block.id !== id);
    }
    
    function makeTextDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let isDragging = false;
        element.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e.preventDefault();
            // Get mouse position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Call function when mouse moves
            document.onmousemove = elementDrag;
            isDragging = true;
        }
        
        function elementDrag(e) {
            e.preventDefault();
            if (!isDragging) return;
            
            // Calculate new position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Use requestAnimationFrame for smoother movement
            requestAnimationFrame(() => {
                // Set element's new position
                element.style.top = (element.offsetTop - pos2) + 'px';
                element.style.left = (element.offsetLeft - pos1) + 'px';
                
                // Update position in array
                const textBlock = textBlocks.find(block => block.id === element.id);
                if (textBlock) {
                    textBlock.x = element.offsetLeft;
                    textBlock.y = element.offsetTop;
                }
            });
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
            isDragging = false;
            
            // Final update to canvas
            requestAnimationFrame(() => drawImage());
        }
    }
    
    function drawTextBlocks() {
        textBlocks.forEach(block => {
            if (block.text.trim() !== '') {
                // Use the custom font size and color for each text block
                ctx.font = `${block.fontSize}px Tajawal`;
                ctx.fillStyle = block.color || defaultTextColor;
                ctx.strokeStyle = block.strokeColor || defaultStrokeColor;
                ctx.lineWidth = block.strokeWidth || defaultStrokeWidth;
                ctx.textAlign = 'center';
                
                // Calculate position relative to canvas
                // Add fontSize to y position to ensure text is centered vertically
                const x = block.x + (block.element.offsetWidth / 2);
                const y = block.y + block.fontSize; // Position text based on font size
                
                // Draw text with stroke for better visibility
                ctx.strokeText(block.text, x, y);
                ctx.fillText(block.text, x, y);
            }
        });
    }
    
    function saveMeme() {
        if (!canvas) {
            alert('الرجاء تحميل صورة أولاً');
            return;
        }
        
        // Draw final image with text
        drawImage();
        
        // Convert canvas to image
        const memeImage = canvas.toDataURL('image/png');
        
        // Create meme item
        const memeItem = document.createElement('div');
        memeItem.className = 'meme-item';
        memeItem.innerHTML = `<img src="${memeImage}" alt="Meme">`;
        
        // Remove empty gallery message if exists
        const emptyMessage = memesGallery.querySelector('.empty-gallery-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        // Add to gallery
        memesGallery.appendChild(memeItem);
        
        // Add click event to open modal
        memeItem.addEventListener('click', function() {
            openModal(memeImage);
        });
        
        // Scroll to gallery
        document.getElementById('createdMemes').scrollIntoView({ behavior: 'smooth' });
    }
    
    function openModal(imageSrc) {
        // Set image in modal
        const modalImage = document.createElement('img');
        modalImage.src = imageSrc;
        
        // Clear previous image
        const modalImageContainer = document.querySelector('.modal-image-container');
        modalImageContainer.innerHTML = '';
        modalImageContainer.appendChild(modalImage);
        
        // Set download link
        downloadMeme.href = imageSrc;
        downloadMeme.download = 'meme.png';
        
        // Show modal
        memeModal.style.display = 'block';
    }
    
    function closeModalFunction() {
        memeModal.style.display = 'none';
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === memeModal) {
            closeModalFunction();
        }
    });
    
    // Add touch support for mobile devices
    function addTouchSupport() {
        textBlocks.forEach(block => {
            const element = block.element;
            let touchStartX, touchStartY;
            let initialX, initialY;
            
            element.addEventListener('touchstart', function(e) {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                initialX = element.offsetLeft;
                initialY = element.offsetTop;
                e.preventDefault();
            }, { passive: false });
            
            element.addEventListener('touchmove', function(e) {
                if (touchStartX && touchStartY) {
                    const touch = e.touches[0];
                    const deltaX = touch.clientX - touchStartX;
                    const deltaY = touch.clientY - touchStartY;
                    
                    // Use requestAnimationFrame for smoother movement
                    requestAnimationFrame(() => {
                        element.style.left = (initialX + deltaX) + 'px';
                        element.style.top = (initialY + deltaY) + 'px';
                        
                        // Update position in array
                        block.x = element.offsetLeft;
                        block.y = element.offsetTop;
                    });
                    
                    e.preventDefault();
                }
            }, { passive: false });
            
            element.addEventListener('touchend', function() {
                touchStartX = null;
                touchStartY = null;
                
                // Final update to canvas
                requestAnimationFrame(() => drawImage());
            });
        });
    }
    
    // Initialize with one text block
    addTextBlock();
    
    // Add touch support for mobile devices
    addTouchSupport();
    
    // Add window resize handler to maintain text positions
    window.addEventListener('resize', function() {
        if (uploadedImage) {
            setupCanvas();
            drawImage();
        }
    });
});