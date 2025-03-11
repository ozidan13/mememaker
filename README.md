# Mememaker - صانع الميمز

## Overview

Mememaker is a web-based application that allows users to create custom memes by uploading images and adding customizable text overlays. The application is designed with Arabic users in mind, featuring RTL (Right-to-Left) support and the Tajawal font for Arabic typography. Users can create, save, view, and download their memes through an intuitive and responsive interface.

![Mememaker Screenshot](memes/1.jpeg)

## Features

### Core Features

- **Image Upload**: Upload any image to use as a meme base
- **Text Customization**:
  - Add up to 5 text blocks (with option to add more)
  - Customize text color
  - Adjust text size
  - Add text stroke/outline with customizable color and width
  - Delete individual text blocks
- **Drag-and-Drop**: Reposition text anywhere on the image
- **Meme Gallery**: View all created memes in a gallery section
- **Popup Modal**: Click on any meme to view it in an enlarged modal with download option
- **Responsive Design**: Works on both desktop and mobile devices

## Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server-side dependencies required (pure HTML, CSS, and JavaScript)

### Setup

1. Clone the repository or download the source code
   ```
   git clone [repository-url]
   ```

2. No build process is required. You can run the application locally using any web server, for example:
   ```
   python -m http.server 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

## Usage Guide

### Creating a Meme

1. **Upload an Image**:
   - Click on the "اختر صورة" (Choose Image) button
   - Select an image from your device

2. **Add Text**:
   - Click the "إضافة نص" (Add Text) button
   - Type your text in the input field
   - The text will appear on the image

3. **Customize Text**:
   - **Change Color**: Use the color picker to change text color
   - **Adjust Size**: Use the "+" and "-" buttons to increase or decrease text size
   - **Add Stroke/Outline**: Use the stroke color picker and width controls to add an outline to your text
   - **Reposition**: Drag and drop text to position it anywhere on the image

4. **Save Your Meme**:
   - Click the "حفظ الميم" (Save Meme) button
   - Your meme will appear in the gallery section below

5. **View and Download**:
   - Click on any meme in the gallery to open it in a larger view
   - Click the download button to save the meme to your device

## Technical Implementation

### Project Structure

```
mememaker/
├── css/
│   └── styles.css       # Styling for the application
├── js/
│   └── app.js           # JavaScript functionality
├── memes/               # Sample memes and saved memes
│   └── 1.jpeg           # Sample meme
├── index.html           # Main HTML structure
├── README.md            # This documentation
└── projectOverview.md   # Development roadmap
```

### Technologies Used

- **HTML5**: For structure and canvas element
- **CSS3**: For styling and responsive design
- **JavaScript (ES6+)**: For interactive functionality
- **Font Awesome**: For icons
- **Google Fonts (Tajawal)**: For Arabic typography

### Key Components

1. **Canvas System**:
   - Uses HTML5 Canvas for rendering the image
   - Overlays draggable text elements using absolute positioning

2. **Text Customization**:
   - Dynamic text creation and manipulation
   - Real-time updates for color, size, and position changes
   - Text stroke/outline implementation for better visibility on various backgrounds

3. **Drag-and-Drop**:
   - Custom implementation using mouse/touch event listeners
   - Maintains text position relative to the canvas

4. **Meme Generation**:
   - Combines the image and text overlays into a single image
   - Renders text with specified styles (color, size, stroke)

5. **Gallery and Modal**:
   - Displays created memes in a responsive grid
   - Modal implementation for enlarged view and download functionality

## Accessibility and Localization

- **RTL Support**: Full right-to-left layout support for Arabic users
- **Responsive Design**: Adapts to different screen sizes and devices
- **Semantic HTML**: Uses appropriate HTML elements for better accessibility
- **Arabic Interface**: All UI elements are in Arabic

## Future Enhancements

- **Additional Text Customization**: Add rotation, font selection, and text effects
- **Templates**: Add pre-designed meme templates
- **Local Storage**: Save work-in-progress memes for later editing
- **Social Sharing**: Direct sharing to social media platforms
- **Filters and Effects**: Add image filters and effects
- **Undo/Redo**: Add history functionality for editing actions

## Browser Compatibility

The application has been tested and works on:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest)
- Mobile browsers (Chrome for Android, Safari for iOS)

## License

[Specify your license here]

## Credits

- Font Awesome for icons
- Google Fonts for Tajawal font
- [Add any other credits or acknowledgments]