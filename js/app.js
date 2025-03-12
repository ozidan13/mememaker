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
    
    // Get filter controls
    const imageControls = document.getElementById('imageControls');
    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const saturationSlider = document.getElementById('saturation');
    const blurSlider = document.getElementById('blur');
    const resetFilterBtns = document.querySelectorAll('.reset-filter');
    const presetFilterBtns = document.querySelectorAll('.preset-filter-btn');
    
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
    let selectedTextBlockId = null; // Track currently selected text block
    
    // Image filter variables
    let filterSettings = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        preset: 'normal'
    };
    
    // History for undo/redo
    let history = [];
    let historyIndex = -1;
    const maxHistorySteps = 20;
    
    // Separate the DOM updates from canvas rendering for better performance
    let pendingCanvasUpdate = false;
    
    // Event Listeners
    imageUpload.addEventListener('change', handleImageUpload);
    addTextBtn.addEventListener('click', addTextBlock);
    saveMemeBtn.addEventListener('click', saveMeme);
    closeModal.addEventListener('click', closeModalFunction);
    
    // Add keyboard event listener for the document
    document.addEventListener('keydown', function(e) {
        // Handle undo/redo keyboard shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            if (e.shiftKey) {
                // Ctrl+Shift+Z or Cmd+Shift+Z for Redo
                e.preventDefault();
                redo();
            } else {
                // Ctrl+Z or Cmd+Z for Undo
                e.preventDefault();
                undo();
            }
            return;
        }
        
        // Handle other keyboard shortcuts
        handleKeyPress(e);
    });
    
    // Add filter event listeners
    brightnessSlider.addEventListener('input', updateFilters);
    contrastSlider.addEventListener('input', updateFilters);
    saturationSlider.addEventListener('input', updateFilters);
    blurSlider.addEventListener('input', updateFilters);
    
    // Add reset filter button listeners
    resetFilterBtns.forEach(btn => {
        btn.addEventListener('click', resetFilter);
    });
    
    // Add preset filter button listeners
    presetFilterBtns.forEach(btn => {
        btn.addEventListener('click', applyPresetFilter);
    });
    
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
                
                // Show image controls
                imageControls.style.display = 'block';
                
                // Reset filters to default
                resetAllFilters();
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
        textBlocks = [];
        
        existingTextBlocks.forEach(block => {
            // Create a new text block element
            const canvasText = document.createElement('div');
            canvasText.className = 'canvas-text';
            canvasText.id = block.id;
            canvasText.textContent = block.text;
            canvasText.style.top = block.y + 'px';
            canvasText.style.left = block.x + 'px';
            canvasText.style.fontSize = block.fontSize + 'px';
            canvasText.style.color = block.color;
            
            // Add inline controls
            const controls = document.createElement('div');
            controls.className = 'canvas-text-controls';
            controls.innerHTML = `
                <button class="canvas-text-control-btn decrease-size-inline" data-id="${block.id}" title="تصغير النص">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button class="canvas-text-control-btn increase-size-inline" data-id="${block.id}" title="تكبير النص">
                    <i class="fas fa-search-plus"></i>
                </button>
            `;
            canvasText.appendChild(controls);
            
            // Add to canvas container
            canvasContainer.appendChild(canvasText);
            
            // Add event listeners for inline controls
            const decreaseSizeInlineBtn = canvasText.querySelector(`.decrease-size-inline[data-id="${block.id}"]`);
            const increaseSizeInlineBtn = canvasText.querySelector(`.increase-size-inline[data-id="${block.id}"]`);
            
            decreaseSizeInlineBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent drag start
                updateTextSize(block.id, -2); // Decrease by 2px
            });
            
            increaseSizeInlineBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent drag start
                updateTextSize(block.id, 2); // Increase by 2px
            });
            
            // Add click event handler
            canvasText.addEventListener('click', function(e) {
                // Deselect previous selection
                if (selectedTextBlockId && selectedTextBlockId !== block.id) {
                    const prevSelected = document.getElementById(selectedTextBlockId);
                    if (prevSelected) {
                        prevSelected.classList.remove('selected');
                    }
                }
                
                // Select this block
                canvasText.classList.add('selected');
                selectedTextBlockId = block.id;
                
                // Focus on the input field for this text block
                const inputField = document.getElementById(`${block.id}-input`);
                if (inputField) {
                    inputField.focus();
                }
                
                e.stopPropagation(); // Prevent canvas container click event
            });
            
            // Make text draggable
            makeTextDraggable(canvasText);
            
            // Add touch support
            addTouchSupportForElement(canvasText);
            
            // Add to textBlocks array with updated element reference
            textBlocks.push({
                ...block,
                element: canvasText
            });
        });
        
        // Make sure to draw the canvas immediately
        drawImage();
    }
    
    function drawImage() {
        if (!canvas || !ctx || !uploadedImage) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Save the current context state
        ctx.save();
        
        // Check if we need to redraw the base image
        // We'll use a simple optimization flag to avoid redrawing the image unnecessarily
        try {
            // Apply filters if image is available
            if (uploadedImage) {
                // Create a temporary canvas to apply filters
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                
                // Draw the original image on the temp canvas
                tempCtx.drawImage(uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);
                
                // Apply filters using CSS filter string
                const filterString = getFilterString();
                if (filterString !== '') {
                    // Apply filters using another temporary canvas (needed for filter application)
                    const filteredCanvas = document.createElement('canvas');
                    const filteredCtx = filteredCanvas.getContext('2d');
                    filteredCanvas.width = canvas.width;
                    filteredCanvas.height = canvas.height;
                    
                    // Set the filter string
                    filteredCtx.filter = filterString;
                    
                    // Draw the original image with filters
                    filteredCtx.drawImage(uploadedImage, 0, 0, filteredCanvas.width, filteredCanvas.height);
                    
                    // Draw the filtered image on the main canvas
                    ctx.drawImage(filteredCanvas, 0, 0);
                } else {
                    // No filters, just draw the original image
                    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
                }
            }
            
            // Draw text blocks
            drawTextBlocks();
        } catch (error) {
            console.error("Error drawing image or text:", error);
        }
        
        // Restore the context state
        ctx.restore();
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
            
            // Focus on the input field for the new text block
            textInput.focus();
            
            // Important: Force a canvas redraw to ensure text appears immediately
            drawImage();
        }
        
        saveToHistory();
    }
    
    function createCanvasText(textBlockId) {
        if (!canvas) return null;
        
        // Create a simpler draggable text element without extra UI clutter
        const canvasText = document.createElement('div');
        canvasText.className = 'canvas-text';
        canvasText.id = textBlockId;
        canvasText.textContent = 'أدخل النص هنا...';
        
        // Calculate initial position - center for first text, offset for others
        let x, y;
        
        if (textBlocks.length === 0) {
            // First text block should be centered
            x = canvas.width / 2 - 60;
            y = canvas.height / 3;
        } else {
            // Offset subsequent blocks for better placement
            const xOffset = (textBlocks.length % 3) * 40;
            const yOffset = (textBlocks.length % 3) * 40;
            x = Math.min(canvas.width / 2 - 40 + xOffset, canvas.width - 150);
            y = Math.min(canvas.height / 3 + yOffset, canvas.height - 100);
        }
        
        // Set position and style
        canvasText.style.left = `${x}px`;
        canvasText.style.top = `${y}px`;
        canvasText.style.fontSize = '30px'; // Larger default for better visibility
        canvasText.style.cursor = 'move';   // Show move cursor for better UX
        
        // Add to canvas container
        canvasContainer.appendChild(canvasText);
        
        // Make text draggable with the ultra-fast dragging system
        makeTextDraggableUltrafast(canvasText);
        
        // Add touch support with the improved system
        addTouchSupportUltrafast(canvasText);
        
        // Create block object
        const textBlock = {
            id: textBlockId,
            element: canvasText,
            text: 'أدخل النص هنا...',
            x: x,
            y: y,
            fontSize: 30, // Larger default
            color: defaultTextColor,
            strokeColor: defaultStrokeColor,
            strokeWidth: 2
        };
        
        // Add to array
        textBlocks.push(textBlock);
        
        // Set as selected
        selectedTextBlockId = textBlockId;
        selectTextBlock(textBlockId);
        
        // Force immediate rendering
        drawImage();
        
        return textBlock;
    }
    
    function updateTextBlock(id, text) {
        // Update text in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            textBlock.text = text;
            textBlock.element.textContent = text;
            drawImage(); // Redraw to update canvas
        }
        
        saveToHistory();
    }
    
    function updateTextColor(id, color) {
        // Update text color in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            textBlock.color = color;
            textBlock.element.style.color = color;
            drawImage(); // Redraw to update canvas
        }
        
        saveToHistory();
    }
    
    function updateTextSize(id, change) {
        const textBlock = textBlocks.find(block => block.id === id);
        if (!textBlock) return;
        
        // Get current size element
        const sizeElement = document.getElementById(`${id}-size`);
        if (!sizeElement) return;
        
        // Calculate new size with limits
        const newSize = Math.max(8, Math.min(72, (textBlock.fontSize || 20) + change));
        
        // Update data model
        textBlock.fontSize = newSize;
        
        // Update DOM
        sizeElement.textContent = newSize;
        
        // Update canvas immediately
        drawImage();
        
        // Save to history
        saveToHistory();
    }
    
    function updateStrokeColor(id, color) {
        // Update stroke color in array
        const textBlock = textBlocks.find(block => block.id === id);
        if (textBlock) {
            textBlock.strokeColor = color;
            // Real-time update
            requestAnimationFrame(() => drawImage());
        }
        
        saveToHistory();
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
            
            // Force a full redraw to update stroke appearance
            drawImage();
            
            // Save to history after stroke width change
            saveToHistory();
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
        
        saveToHistory();
    }
    
    // Save initial state
    setTimeout(saveToHistory, 500);
    
    function makeTextDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let isDragging = false;
        element.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get mouse position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Set global mouse handlers
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            isDragging = true;
            
            // Select this text block
            const textBlockId = element.id;
            selectedTextBlockId = textBlockId;
            selectTextBlock(textBlockId);
        }
        
        function elementDrag(e) {
            e.preventDefault();
            if (!isDragging) return;
            
            // Calculate new position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Update DOM position immediately
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            
            // Set element's new position with bounds checking
            element.style.top = `${Math.max(0, Math.min(canvas.height - 50, newTop))}px`;
            element.style.left = `${Math.max(0, Math.min(canvas.width - 100, newLeft))}px`;
            
            // Update position in array
            const textBlock = textBlocks.find(block => block.id === element.id);
            if (textBlock) {
                textBlock.x = parseInt(element.style.left);
                textBlock.y = parseInt(element.style.top);
                
                // Schedule canvas update (but don't block the UI)
                scheduleCanvasUpdate();
            }
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
            isDragging = false;
            
            // Force a final canvas update
            drawImage();
            
            // Save state to history after drag is complete
            saveToHistory();
        }
    }
    
    function drawTextBlocks() {
        if (!ctx) return;
        
        // Process each text block with optimized rendering
        textBlocks.forEach(block => {
            try {
                if (!block.text || block.text.trim() === '') return;
                
                // Set font properties - use a simpler, cleaner font setup
                ctx.font = `bold ${block.fontSize}px Arial, sans-serif`;
                ctx.fillStyle = block.color || defaultTextColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Calculate center position
                const x = block.x + 50;
                const y = block.y + 25;
                
                // Create a clean, readable text with simple outline
                // Draw text stroke first (simpler approach)
                if (block.strokeWidth > 0) {
                    ctx.strokeStyle = block.strokeColor || defaultStrokeColor;
                    ctx.lineWidth = block.strokeWidth;
                    ctx.strokeText(block.text, x, y);
                }
                
                // Draw text fill on top
                ctx.fillText(block.text, x, y);
            } catch (error) {
                console.error("Error drawing text block:", error);
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
    
    // Add touch support with better performance
    function addTouchSupportForElement(element) {
        let touchStartX, touchStartY;
        let initialX, initialY;
        
        element.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            initialX = element.offsetLeft;
            initialY = element.offsetTop;
            
            // Select this text block
            const textBlockId = element.id;
            selectedTextBlockId = textBlockId;
            selectTextBlock(textBlockId);
            
            e.preventDefault();
        }, { passive: false });
        
        element.addEventListener('touchmove', function(e) {
            if (!touchStartX || !touchStartY) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // Calculate new position with bounds checking
            const newLeft = Math.max(0, Math.min(canvas.width - 100, initialX + deltaX));
            const newTop = Math.max(0, Math.min(canvas.height - 50, initialY + deltaY));
            
            // Update DOM position immediately 
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
            
            // Update text block data
            const textBlock = textBlocks.find(block => block.id === element.id);
            if (textBlock) {
                textBlock.x = newLeft;
                textBlock.y = newTop;
                
                // Schedule a canvas update
                scheduleCanvasUpdate();
            }
            
            e.preventDefault();
        }, { passive: false });
        
        element.addEventListener('touchend', function() {
            touchStartX = null;
            touchStartY = null;
            
            // Force final canvas update
            drawImage();
            
            // Save to history
            saveToHistory();
        });
    }
    
    function handleKeyPress(e) {
        // Only process if a text block is selected
        if (!selectedTextBlockId) return;
        
        const textBlock = textBlocks.find(block => block.id === selectedTextBlockId);
        if (!textBlock) return;
        
        // Arrow keys for moving selected text
        const moveStep = 5; // pixels to move
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                updateTextPosition(selectedTextBlockId, -moveStep, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                updateTextPosition(selectedTextBlockId, moveStep, 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                updateTextPosition(selectedTextBlockId, 0, -moveStep);
                break;
            case 'ArrowDown':
                e.preventDefault();
                updateTextPosition(selectedTextBlockId, 0, moveStep);
                break;
            case '+':
            case '=': // For keyboards where + is on the = key
                e.preventDefault();
                updateTextSize(selectedTextBlockId, 2);
                break;
            case '-':
                e.preventDefault();
                updateTextSize(selectedTextBlockId, -2);
                break;
            case 'Delete':
            case 'Backspace':
                // Only delete if user confirms (and not in an input field)
                if (document.activeElement.tagName !== 'INPUT' && 
                    confirm('هل تريد حذف هذا النص؟')) {
                    deleteTextBlock(selectedTextBlockId);
                    selectedTextBlockId = null;
                }
                break;
            // Tab key to cycle between text blocks
            case 'Tab':
                e.preventDefault();
                selectNextTextBlock(e.shiftKey);
                break;
        }
    }
    
    // Keyboard navigation with improved performance
    function updateTextPosition(id, deltaX, deltaY) {
        const textBlock = textBlocks.find(block => block.id === id);
        if (!textBlock || !textBlock.element) return;
        
        // Calculate new position with bounds checking
        const newX = Math.max(0, Math.min(canvas.width - 100, textBlock.x + deltaX));
        const newY = Math.max(0, Math.min(canvas.height - 50, textBlock.y + deltaY));
        
        // Update model
        textBlock.x = newX;
        textBlock.y = newY;
        
        // Update DOM
        textBlock.element.style.left = `${newX}px`;
        textBlock.element.style.top = `${newY}px`;
        
        // Update canvas
        drawImage();
        
        // Save state
        saveToHistory();
    }
    
    // Select the next text block in sequence (or previous if shiftKey is true)
    function selectNextTextBlock(goBackwards = false) {
        if (textBlocks.length === 0) return;
        
        // Deselect current block
        if (selectedTextBlockId) {
            const currentBlock = textBlocks.find(block => block.id === selectedTextBlockId);
            if (currentBlock && currentBlock.element) {
                currentBlock.element.classList.remove('selected');
            }
        }
        
        // Find the index of the current block
        const currentIndex = textBlocks.findIndex(block => block.id === selectedTextBlockId);
        let nextIndex;
        
        if (currentIndex === -1) {
            // No current selection, select first or last depending on direction
            nextIndex = goBackwards ? textBlocks.length - 1 : 0;
        } else {
            // Move to next or previous
            if (goBackwards) {
                nextIndex = (currentIndex - 1 + textBlocks.length) % textBlocks.length;
            } else {
                nextIndex = (currentIndex + 1) % textBlocks.length;
            }
        }
        
        // Select the new block
        selectedTextBlockId = textBlocks[nextIndex].id;
        const newBlock = textBlocks[nextIndex];
        if (newBlock.element) {
            newBlock.element.classList.add('selected');
            
            // Focus on the input field for this text block
            const inputField = document.getElementById(`${selectedTextBlockId}-input`);
            if (inputField) {
                inputField.focus();
            }
        }
    }
    
    // Click on canvas container to deselect all text blocks
    canvasContainer.addEventListener('click', function(e) {
        if (e.target === canvasContainer || e.target === canvas) {
            if (selectedTextBlockId) {
                const selected = document.getElementById(selectedTextBlockId);
                if (selected) {
                    selected.classList.remove('selected');
                }
                selectedTextBlockId = null;
            }
        }
    });
    
    // Initialize with one text block
    addTextBlock();
    
    // Add window resize handler to maintain text positions
    window.addEventListener('resize', function() {
        if (uploadedImage) {
            setupCanvas();
            drawImage();
        }
    });
    
    // Generate CSS filter string based on current settings
    function getFilterString() {
        let filterStr = '';
        
        // Add individual filters
        if (filterSettings.brightness !== 100) {
            filterStr += `brightness(${filterSettings.brightness / 100}) `;
        }
        if (filterSettings.contrast !== 100) {
            filterStr += `contrast(${filterSettings.contrast / 100}) `;
        }
        if (filterSettings.saturation !== 100) {
            filterStr += `saturate(${filterSettings.saturation / 100}) `;
        }
        if (filterSettings.blur > 0) {
            filterStr += `blur(${filterSettings.blur / 2}px) `;
        }
        
        // Add preset filters
        switch (filterSettings.preset) {
            case 'grayscale':
                filterStr += 'grayscale(1) ';
                break;
            case 'sepia':
                filterStr += 'sepia(0.7) ';
                break;
            case 'vintage':
                // Vintage look: sepia + lower saturation + slight brightness adjustment
                filterStr += 'sepia(0.5) saturate(0.8) brightness(1.1) ';
                break;
            case 'dramatic':
                // Dramatic look: high contrast + slightly desaturated
                filterStr += 'contrast(1.3) saturate(0.9) brightness(0.9) ';
                break;
            // normal case doesn't add any filters
        }
        
        return filterStr.trim();
    }
    
    // Update filters when sliders change
    function updateFilters() {
        // Update filter settings based on slider values
        filterSettings.brightness = parseInt(brightnessSlider.value);
        filterSettings.contrast = parseInt(contrastSlider.value);
        filterSettings.saturation = parseInt(saturationSlider.value);
        filterSettings.blur = parseInt(blurSlider.value);
        
        // Reset any active preset
        resetActivePreset();
        
        // Redraw with new filters
        drawImage();
    }
    
    // Reset a specific filter to default
    function resetFilter(e) {
        const filterName = e.currentTarget.dataset.filter;
        const defaultValue = parseInt(e.currentTarget.dataset.default);
        
        // Reset the slider value
        const slider = document.getElementById(filterName);
        if (slider) {
            slider.value = defaultValue;
            filterSettings[filterName] = defaultValue;
        }
        
        // Reset any active preset
        resetActivePreset();
        
        // Redraw with updated filters
        drawImage();
    }
    
    // Reset all filters to default
    function resetAllFilters() {
        // Reset all sliders to their default values
        brightnessSlider.value = 100;
        contrastSlider.value = 100;
        saturationSlider.value = 100;
        blurSlider.value = 0;
        
        // Reset filter settings
        filterSettings = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            preset: 'normal'
        };
        
        // Reset active preset
        resetActivePreset();
        
        // Activate the 'normal' preset button
        const normalPresetBtn = document.querySelector('.preset-filter-btn[data-preset="normal"]');
        if (normalPresetBtn) {
            normalPresetBtn.classList.add('active');
        }
        
        // Redraw image
        drawImage();
    }
    
    // Reset active preset button
    function resetActivePreset() {
        // Remove active class from all preset buttons
        presetFilterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Reset preset in filter settings
        filterSettings.preset = 'normal';
    }
    
    // Apply a preset filter
    function applyPresetFilter(e) {
        const preset = e.currentTarget.dataset.preset;
        
        // Remove active class from all preset buttons
        presetFilterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to the clicked button
        e.currentTarget.classList.add('active');
        
        // Set the preset in filter settings
        filterSettings.preset = preset;
        
        // For normal preset, reset all filter values
        if (preset === 'normal') {
            resetAllFilters();
            return;
        }
        
        // Set specific filter values based on presets
        switch (preset) {
            case 'grayscale':
                // Keep current values, just add grayscale
                break;
            case 'sepia':
                // Keep current values, just add sepia
                break;
            case 'vintage':
                // Vintage has slightly warmer tones
                brightnessSlider.value = 110;
                contrastSlider.value = 90;
                saturationSlider.value = 80;
                
                filterSettings.brightness = 110;
                filterSettings.contrast = 90;
                filterSettings.saturation = 80;
                break;
            case 'dramatic':
                // Dramatic has higher contrast
                brightnessSlider.value = 90;
                contrastSlider.value = 130;
                saturationSlider.value = 90;
                
                filterSettings.brightness = 90;
                filterSettings.contrast = 130;
                filterSettings.saturation = 90;
                break;
        }
        
        // Redraw with new filters
        drawImage();
    }
    
    // Save current state to history
    function saveToHistory() {
        // Create a deep copy of the current text blocks
        const currentState = textBlocks.map(block => ({
            id: block.id,
            text: block.text,
            x: block.x,
            y: block.y,
            fontSize: block.fontSize,
            color: block.color,
            strokeColor: block.strokeColor,
            strokeWidth: block.strokeWidth
        }));
        
        // If we're not at the end of the history, remove future states
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        // Add current state to history
        history.push(currentState);
        
        // Limit history size
        if (history.length > maxHistorySteps) {
            history.shift();
        }
        
        // Update history index
        historyIndex = history.length - 1;
    }
    
    // Undo last action
    function undo() {
        if (historyIndex <= 0) return; // Nothing to undo
        
        historyIndex--;
        restoreFromHistory();
    }
    
    // Redo last undone action
    function redo() {
        if (historyIndex >= history.length - 1) return; // Nothing to redo
        
        historyIndex++;
        restoreFromHistory();
    }
    
    // Restore state from history
    function restoreFromHistory() {
        if (historyIndex < 0 || historyIndex >= history.length) return;
        
        const state = history[historyIndex];
        
        // Clear existing text blocks
        textBlocks.forEach(block => {
            if (block.element) {
                block.element.remove();
            }
        });
        
        // Clear text blocks array
        textBlocks = [];
        
        // Clear text blocks container
        textBlocksContainer.innerHTML = '';
        
        // Restore text blocks from history
        state.forEach(blockData => {
            // Recreate text block UI
            const textBlockId = blockData.id;
            const textBlock = document.createElement('div');
            textBlock.className = 'text-block';
            textBlock.innerHTML = `
                <input type="text" id="${textBlockId}-input" placeholder="أدخل النص هنا..." value="${blockData.text}">
                <div class="text-controls-row">
                    <input type="color" id="${textBlockId}-color" value="${blockData.color}" class="color-picker" title="لون النص">
                    <div class="size-controls">
                        <button class="size-btn decrease-size" data-id="${textBlockId}" title="تصغير النص"><i class="fas fa-minus"></i></button>
                        <span class="size-value" id="${textBlockId}-size">${blockData.fontSize}</span>
                        <button class="size-btn increase-size" data-id="${textBlockId}" title="تكبير النص"><i class="fas fa-plus"></i></button>
                    </div>
                    <button class="delete-text-btn" data-id="${textBlockId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="text-controls-row stroke-controls">
                    <label>الحدود:</label>
                    <input type="color" id="${textBlockId}-stroke-color" value="${blockData.strokeColor}" class="color-picker" title="لون الحدود">
                    <div class="size-controls">
                        <button class="size-btn decrease-stroke" data-id="${textBlockId}" title="تقليل سمك الحدود"><i class="fas fa-minus"></i></button>
                        <span class="size-value" id="${textBlockId}-stroke-width">${blockData.strokeWidth}</span>
                        <button class="size-btn increase-stroke" data-id="${textBlockId}" title="زيادة سمك الحدود"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            `;
            
            // Add text block to container
            textBlocksContainer.appendChild(textBlock);
            
            // Add event listeners
            const textInput = document.getElementById(`${textBlockId}-input`);
            textInput.addEventListener('input', function() {
                updateTextBlock(textBlockId, this.value);
            });
            
            const colorPicker = document.getElementById(`${textBlockId}-color`);
            colorPicker.addEventListener('input', function() {
                updateTextColor(textBlockId, this.value);
            });
            
            const decreaseSizeBtn = textBlock.querySelector(`.decrease-size[data-id="${textBlockId}"]`);
            const increaseSizeBtn = textBlock.querySelector(`.increase-size[data-id="${textBlockId}"]`);
            
            decreaseSizeBtn.addEventListener('click', function() {
                updateTextSize(textBlockId, -2);
            });
            
            increaseSizeBtn.addEventListener('click', function() {
                updateTextSize(textBlockId, 2);
            });
            
            const strokeColorPicker = document.getElementById(`${textBlockId}-stroke-color`);
            strokeColorPicker.addEventListener('input', function() {
                updateStrokeColor(textBlockId, this.value);
            });
            
            const decreaseStrokeBtn = textBlock.querySelector(`.decrease-stroke[data-id="${textBlockId}"]`);
            const increaseStrokeBtn = textBlock.querySelector(`.increase-stroke[data-id="${textBlockId}"]`);
            
            decreaseStrokeBtn.addEventListener('click', function() {
                updateStrokeWidth(textBlockId, -1);
            });
            
            increaseStrokeBtn.addEventListener('click', function() {
                updateStrokeWidth(textBlockId, 1);
            });
            
            const deleteBtn = textBlock.querySelector('.delete-text-btn');
            deleteBtn.addEventListener('click', function() {
                deleteTextBlock(textBlockId);
            });
            
            // Create canvas text element
            if (uploadedImage) {
                const canvasText = document.createElement('div');
                canvasText.className = 'canvas-text';
                canvasText.id = textBlockId;
                canvasText.textContent = blockData.text;
                
                // Ensure we explicitly set position and size properties
                canvasText.style.top = blockData.y + 'px';
                canvasText.style.left = blockData.x + 'px';
                canvasText.style.fontSize = blockData.fontSize + 'px';
                canvasText.style.color = blockData.color;
                
                // Add inline controls
                const controls = document.createElement('div');
                controls.className = 'canvas-text-controls';
                controls.innerHTML = `
                    <button class="canvas-text-control-btn decrease-size-inline" data-id="${textBlockId}" title="تصغير النص">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <button class="canvas-text-control-btn increase-size-inline" data-id="${textBlockId}" title="تكبير النص">
                        <i class="fas fa-search-plus"></i>
                    </button>
                `;
                canvasText.appendChild(controls);
                
                // Add to canvas container
                canvasContainer.appendChild(canvasText);
                
                // Add event listeners for inline controls
                const decreaseSizeInlineBtn = canvasText.querySelector(`.decrease-size-inline[data-id="${textBlockId}"]`);
                const increaseSizeInlineBtn = canvasText.querySelector(`.increase-size-inline[data-id="${textBlockId}"]`);
                
                decreaseSizeInlineBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    updateTextSize(textBlockId, -2);
                });
                
                increaseSizeInlineBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    updateTextSize(textBlockId, 2);
                });
                
                // Add click handler to select this text block
                canvasText.addEventListener('click', function(e) {
                    if (selectedTextBlockId && selectedTextBlockId !== textBlockId) {
                        const prevSelected = document.getElementById(selectedTextBlockId);
                        if (prevSelected) {
                            prevSelected.classList.remove('selected');
                        }
                    }
                    
                    canvasText.classList.add('selected');
                    selectedTextBlockId = textBlockId;
                    
                    const inputField = document.getElementById(`${textBlockId}-input`);
                    if (inputField) {
                        inputField.focus();
                    }
                    
                    e.stopPropagation();
                });
                
                // Make text draggable
                makeTextDraggable(canvasText);
                
                // Add touch support
                addTouchSupportForElement(canvasText);
                
                console.log(`Restored text: ${blockData.text}, Font size: ${blockData.fontSize}px, Stroke width: ${blockData.strokeWidth}`);
                
                // Add to text blocks array with element reference
                textBlocks.push({
                    ...blockData,
                    element: canvasText
                });
            }
        });
        
        // Ensure canvas is redrawn with the restored text blocks
        drawImage();
    }

    // Add selectTextBlock function if it doesn't exist
    function selectTextBlock(id) {
        // Deselect all text blocks
        document.querySelectorAll('.canvas-text').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select the specified text block
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('selected');
            
            // Focus on the corresponding input field
            const inputField = document.getElementById(`${id}-input`);
            if (inputField) {
                inputField.focus();
            }
        }
    }

    // Ultra-fast dragging system that decouples DOM updates from canvas rendering
    function makeTextDraggableUltrafast(element) {
        let startX, startY;
        let startLeft, startTop;
        let isDragging = false;
        
        // Use more modern event listeners instead of direct properties
        element.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Select this text block
            const textBlockId = element.id;
            selectedTextBlockId = textBlockId;
            selectTextBlock(textBlockId);
            
            // Store initial positions
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left) || element.offsetLeft;
            startTop = parseInt(element.style.top) || element.offsetTop;
            
            // Set global event handlers
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
            
            isDragging = true;
        }
        
        function dragMove(e) {
            if (!isDragging) return;
            
            // Calculate new position - direct calculation is faster
            const newLeft = startLeft + (e.clientX - startX);
            const newTop = startTop + (e.clientY - startY);
            
            // Apply bounds checking and update DOM position only (no canvas updates during drag)
            element.style.left = `${Math.max(0, Math.min(canvas.width - 100, newLeft))}px`;
            element.style.top = `${Math.max(0, Math.min(canvas.height - 50, newTop))}px`;
            
            // Don't update canvas during drag - just update the text block data
            const textBlock = textBlocks.find(block => block.id === element.id);
            if (textBlock) {
                textBlock.x = parseInt(element.style.left);
                textBlock.y = parseInt(element.style.top);
            }
        }
        
        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            // Clean up event listeners
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            
            // Update the text block data
            const textBlock = textBlocks.find(block => block.id === element.id);
            if (textBlock) {
                textBlock.x = parseInt(element.style.left);
                textBlock.y = parseInt(element.style.top);
                
                // Now update canvas only once at the end of dragging
                drawImage();
                
                // Save state to history
                saveToHistory();
            }
        }
    }
    
    // Ultra-fast touch support that doesn't bog down on mobile
    function addTouchSupportUltrafast(element) {
        let startX, startY;
        let startLeft, startTop;
        
        element.addEventListener('touchstart', function(e) {
            // Get the first touch
            const touch = e.touches[0];
            
            // Select this text block
            const textBlockId = element.id;
            selectedTextBlockId = textBlockId;
            selectTextBlock(textBlockId);
            
            // Store starting positions
            startX = touch.clientX;
            startY = touch.clientY;
            startLeft = parseInt(element.style.left) || element.offsetLeft;
            startTop = parseInt(element.style.top) || element.offsetTop;
            
            e.preventDefault();
        }, { passive: false });
        
        element.addEventListener('touchmove', function(e) {
            // Get the first touch
            const touch = e.touches[0];
            
            // Calculate the new position - direct calculation
            const newLeft = startLeft + (touch.clientX - startX);
            const newTop = startTop + (touch.clientY - startY);
            
            // Update DOM position with bounds checking
            element.style.left = `${Math.max(0, Math.min(canvas.width - 100, newLeft))}px`;
            element.style.top = `${Math.max(0, Math.min(canvas.height - 50, newTop))}px`;
            
            // Update data model but don't render canvas yet
            const textBlock = textBlocks.find(block => block.id === element.id);
            if (textBlock) {
                textBlock.x = parseInt(element.style.left);
                textBlock.y = parseInt(element.style.top);
            }
            
            e.preventDefault();
        }, { passive: false });
        
        element.addEventListener('touchend', function() {
            // Update the text block data
            const textBlock = textBlocks.find(block => block.id === element.id);
            if (textBlock) {
                textBlock.x = parseInt(element.style.left);
                textBlock.y = parseInt(element.style.top);
                
                // Now update canvas only once at the end
                drawImage();
                
                // Save state to history
                saveToHistory();
            }
        });
    }
    
    // Make sure text blocks are properly styled for cleaner appearance
    const style = document.createElement('style');
    style.textContent = `
        .canvas-text {
            position: absolute;
            background: transparent;
            min-width: 100px;
            text-align: center;
            cursor: move;
            user-select: none;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 5px;
            border: 1px dashed transparent;
            color: white;
            font-weight: bold;
            font-family: Arial, sans-serif;
            /* Better text shadow for improved readability on any background */
            text-shadow: 
                2px 2px 0 #000,
                -2px 2px 0 #000,
                2px -2px 0 #000,
                -2px -2px 0 #000,
                0px 2px 0 #000,
                0px -2px 0 #000,
                2px 0px 0 #000,
                -2px 0px 0 #000;
        }
        .canvas-text.selected {
            border-color: #00a8ff;
            border-width: 2px;
            border-style: dashed;
        }
        .canvas-text:hover {
            border-color: rgba(255, 255, 255, 0.7);
        }
    `;
    document.head.appendChild(style);
    
    // Override the original addTextBlock to ensure first text always works properly
    const originalAddTextBlock = addTextBlock;
    addTextBlock = function() {
        // Call original function
        originalAddTextBlock();
        
        // Make sure first text block appears correctly
        if (textBlocks.length === 1 && canvas) {
            setTimeout(() => {
                try {
                    if (!textBlocks[0] || !textBlocks[0].element) return;
                    
                    // Set a very clear center position
                    const centerX = Math.max(50, canvas.width / 2 - 60);
                    const centerY = Math.max(50, canvas.height / 3);
                    
                    // Update both model and DOM
                    textBlocks[0].x = centerX;
                    textBlocks[0].y = centerY;
                    textBlocks[0].element.style.left = `${centerX}px`;
                    textBlocks[0].element.style.top = `${centerY}px`;
                    
                    // Force larger font
                    textBlocks[0].fontSize = 32;
                    const sizeElement = document.getElementById(`${textBlocks[0].id}-size`);
                    if (sizeElement) {
                        sizeElement.textContent = '32';
                    }
                    
                    // Force render
                    drawImage();
                } catch (error) {
                    console.error("Error handling first text block:", error);
                }
            }, 250); // Slightly longer timeout to ensure DOM is ready
        }
    };

    function scheduleCanvasUpdate() {
        if (!pendingCanvasUpdate) {
            pendingCanvasUpdate = true;
            // Use requestAnimationFrame for optimal performance
            requestAnimationFrame(function() {
                drawImage();
                pendingCanvasUpdate = false;
            });
        }
    }
});