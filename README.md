# 📄 Advanced PDF Editor with OCR

A powerful, web-based PDF editor featuring advanced OCR (Optical Character Recognition) capabilities. Upload PDFs, automatically extract and recognize text, and edit documents while preserving original typography and formatting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML-5-orange.svg)
![CSS3](https://img.shields.io/badge/CSS-3-blue.svg)

## ✨ Features

- **📤 Drag & Drop Upload** - Easy PDF file upload via drag-and-drop or file selection
- **🔍 Advanced OCR** - Automatic text extraction using Tesseract.js OCR engine
- **✏️ Smart Text Editing** - Edit extracted text with automatic font detection and matching
- **🎨 Typography Preservation** - Maintains original font family, size, color, and weight
- **🔎 Zoom Controls** - Zoom in/out for detailed editing
- **📑 Page Navigation** - Thumbnail sidebar for quick page navigation
- **💾 PDF Export** - Download edited PDFs with all modifications applied
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🎯 Real-time Preview** - See changes as you edit

## 🚀 Demo

![PDF Editor Demo](https://via.placeholder.com/800x450/667eea/ffffff?text=PDF+Editor+Demo)

## 🛠️ Technologies

- **[PDF.js](https://mozilla.github.io/pdf.js/)** - Mozilla's PDF rendering library
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** - Pure JavaScript OCR engine
- **[PDF-lib](https://pdf-lib.js.org/)** - Create and modify PDF documents
- **HTML5 & CSS3** - Modern web standards
- **Vanilla JavaScript** - No framework dependencies

## 📦 Installation

### Prerequisites

- A modern web browser (Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+)
- A local web server for development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pdf-editor-ocr.git
   cd pdf-editor-ocr
   ```

2. **Start a local server**
   
   Using Python:
   ```bash
   python3 -m http.server 8000
   ```
   
   Using Node.js:
   ```bash
   npx http-server -p 8000
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📖 Usage Guide

### 1. Upload a PDF

- Click **"Upload PDF"** button or drag and drop a PDF file
- The document will be loaded and rendered with page thumbnails

### 2. Extract Text (OCR)

- Click **"Extract Text (OCR)"** button
- Progress indicator shows OCR processing status
- Extracted text appears as overlays on the PDF

### 3. Edit Text

- Enable **"Edit Mode"**
- Click on any text element to open the editor
- Modify content, font properties, size, and color
- Click **"Save Changes"** to apply modifications

### 4. Download

- Click **"Download PDF"** to export the edited document
- Original formatting is preserved with your edits applied

## 🎨 Features in Detail

### Automatic Font Detection

The application automatically detects font characteristics:
- **Monospace fonts** for code blocks
- **Serif fonts** for formal documents  
- **Sans-serif fonts** for regular text
- **Size-based detection** for headers and body text

### Smart Text Overlay

- Text is extracted and positioned precisely over original content
- White rectangles mask old text before applying edits
- Canvas-based rendering ensures pixel-perfect alignment

### Responsive Interface

- Sidebar with page thumbnails
- Toolbar with intuitive controls
- Modal dialogs for text editing
- Loading indicators with progress bars

## 📂 Project Structure

```
pdf-editor-ocr/
│
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── app.js             # Core application logic
└── README.md          # Documentation
```

## 🔧 Configuration

All libraries are loaded via CDN. To use local copies:

1. Download libraries from their respective websites
2. Update script sources in `index.html`
3. Ensure CORS policies are configured correctly

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full Support |
| Firefox | 88+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 90+     | ✅ Full Support |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mozilla** for PDF.js
- **Tesseract.js Team** for the OCR engine
- **PDF-lib** for PDF manipulation capabilities
- **Feather Icons** for the icon set

## 👨‍💻 Author

**Mehmet Kesimalioğlu**

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

<p align="center">Made by Mehmet Kesimalioğlu</p>
