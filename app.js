// PDF Editor with OCR Application
class PDFEditor {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.ocrResults = [];
        this.editMode = false;
        this.currentEditElement = null;
        this.textLayers = new Map();
        this.pdfLibLoaded = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializePDFJS();
        this.checkPDFLib();
    }

    checkPDFLib() {
        // Check if PDFLib is loaded
        const checkInterval = setInterval(() => {
            if (typeof PDFLib !== 'undefined') {
                this.pdfLibLoaded = true;
                console.log('✅ PDF-lib yüklendi');
                clearInterval(checkInterval);
            }
        }, 100);
        
        // Stop checking after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!this.pdfLibLoaded) {
                console.error('❌ PDF-lib yüklenemedi');
            }
        }, 10000);
    }

    initializeElements() {
        // File upload
        this.pdfUpload = document.getElementById('pdf-upload');
        this.dropZone = document.getElementById('drop-zone');
        this.pdfContainer = document.getElementById('pdf-container');
        this.pdfViewer = document.getElementById('pdf-viewer');
        
        // Buttons
        this.ocrBtn = document.getElementById('ocr-btn');
        this.editModeBtn = document.getElementById('edit-mode-btn');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Display elements
        this.zoomLevel = document.getElementById('zoom-level');
        this.pageInfo = document.getElementById('page-info');
        this.pageThumbnails = document.getElementById('page-thumbnails');
        this.textLayersContainer = document.getElementById('text-layers');
        
        // Progress
        this.progressContainer = document.getElementById('progress-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Modal
        this.editModal = document.getElementById('edit-modal');
        this.editTextContent = document.getElementById('edit-text-content');
        this.editFontSize = document.getElementById('edit-font-size');
        this.editFontFamily = document.getElementById('edit-font-family');
        this.editColor = document.getElementById('edit-color');
        this.editFontWeight = document.getElementById('edit-font-weight');
        this.saveTextEdit = document.getElementById('save-text-edit');
    }

    initializePDFJS() {
        // Set PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    attachEventListeners() {
        // File upload
        this.pdfUpload.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.dropZone.addEventListener('click', () => this.pdfUpload.click());
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Buttons
        this.ocrBtn.addEventListener('click', () => this.performOCR());
        this.editModeBtn.addEventListener('click', () => this.toggleEditMode());
        this.zoomInBtn.addEventListener('click', () => this.zoom(0.1));
        this.zoomOutBtn.addEventListener('click', () => this.zoom(-0.1));
        this.downloadBtn.addEventListener('click', () => this.downloadPDF());
        
        // Modal
        this.saveTextEdit.addEventListener('click', () => this.saveTextChanges());
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // Close modal on outside click
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeModal();
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            this.loadPDF(files[0]);
        } else {
            alert('Please drop a valid PDF file');
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            this.loadPDF(file);
        }
    }

    async loadPDF(file) {
        try {
            this.showProgress('Loading PDF...', 0);
            
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            
            this.dropZone.style.display = 'none';
            this.pdfContainer.style.display = 'block';
            
            this.updatePageInfo();
            await this.renderAllPages();
            await this.generateThumbnails();
            
            this.ocrBtn.disabled = false;
            this.editModeBtn.disabled = false;
            this.downloadBtn.disabled = false;
            
            this.hideProgress();
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF file');
            this.hideProgress();
        }
    }

    async renderAllPages() {
        this.pdfViewer.innerHTML = '';
        
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            await this.renderPage(pageNum);
            this.updateProgress((pageNum / this.totalPages) * 50);
        }
    }

    async renderPage(pageNum) {
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.scale });
        
        const pageContainer = document.createElement('div');
        pageContainer.className = 'pdf-page';
        pageContainer.dataset.pageNumber = pageNum;
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        pageContainer.appendChild(canvas);
        
        // Create text layer container
        const textLayerDiv = document.createElement('div');
        textLayerDiv.className = 'text-layer';
        textLayerDiv.dataset.pageNumber = pageNum;
        pageContainer.appendChild(textLayerDiv);
        
        this.pdfViewer.appendChild(pageContainer);
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
    }

    async generateThumbnails() {
        this.pageThumbnails.innerHTML = '';
        
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            const thumbnail = await this.createThumbnail(pageNum);
            this.pageThumbnails.appendChild(thumbnail);
        }
    }

    async createThumbnail(pageNum) {
        const page = await this.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.3 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'thumbnail';
        if (pageNum === 1) thumbnailDiv.classList.add('active');
        
        thumbnailDiv.appendChild(canvas);
        
        const label = document.createElement('div');
        label.className = 'thumbnail-label';
        label.textContent = `Page ${pageNum}`;
        thumbnailDiv.appendChild(label);
        
        thumbnailDiv.addEventListener('click', () => {
            this.scrollToPage(pageNum);
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnailDiv.classList.add('active');
        });
        
        return thumbnailDiv;
    }

    scrollToPage(pageNum) {
        const pageElement = document.querySelector(`[data-page-number="${pageNum}"]`);
        if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async performOCR() {
        if (!this.pdfDoc) return;
        
        this.showProgress('Extracting text with OCR...', 0);
        this.ocrResults = [];
        this.textLayersContainer.innerHTML = '';
        
        try {
            for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
                const page = await this.pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: this.scale });
                
                // Create a canvas for OCR
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                // Perform OCR
                this.updateProgressText(`Processing page ${pageNum} of ${this.totalPages}...`);
                const result = await Tesseract.recognize(canvas, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            const progress = 50 + ((pageNum - 1) / this.totalPages + m.progress / this.totalPages) * 50;
                            this.updateProgress(progress);
                        }
                    }
                });
                
                this.ocrResults.push({
                    pageNum: pageNum,
                    data: result.data
                });
                
                // Render text layer
                this.renderTextLayer(pageNum, result.data);
            }
            
            this.displayTextLayers();
            this.hideProgress();
            alert('OCR completed successfully!');
            
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Error performing OCR');
            this.hideProgress();
        }
    }

    renderTextLayer(pageNum, ocrData) {
        const textLayerDiv = document.querySelector(`.text-layer[data-page-number="${pageNum}"]`);
        if (!textLayerDiv) return;
        
        textLayerDiv.innerHTML = '';
        
        // Store text items for this page
        const pageTextItems = [];
        
        if (ocrData.lines && ocrData.lines.length > 0) {
            ocrData.lines.forEach((line, lineIndex) => {
                if (!line.words || line.words.length === 0) return;
                
                // Group words by line
                line.words.forEach((word, wordIndex) => {
                    if (word.text.trim() === '') return;
                    
                    const textItem = document.createElement('div');
                    textItem.className = 'text-item';
                    textItem.textContent = word.text;
                    textItem.dataset.pageNumber = pageNum;
                    textItem.dataset.lineIndex = lineIndex;
                    textItem.dataset.wordIndex = wordIndex;
                    
                    // Calculate position and size
                    const bbox = word.bbox;
                    const x = bbox.x0;
                    const y = bbox.y0;
                    const width = bbox.x1 - bbox.x0;
                    const height = bbox.y1 - bbox.y0;
                    
                    textItem.style.left = `${x}px`;
                    textItem.style.top = `${y}px`;
                    textItem.style.width = `${width}px`;
                    textItem.style.height = `${height}px`;
                    
                    // Estimate font size based on height
                    const fontSize = Math.max(10, Math.round(height * 0.85));
                    textItem.style.fontSize = `${fontSize}px`;
                    textItem.style.lineHeight = `${height}px`;
                    
                    // Auto-detect font family based on characteristics
                    const fontFamily = this.detectFontFamily(word, height);
                    textItem.style.fontFamily = fontFamily;
                    
                    // Store original values
                    textItem.dataset.originalText = word.text;
                    textItem.dataset.originalFontSize = fontSize;
                    textItem.dataset.originalFontFamily = fontFamily;
                    
                    // Add click handler for editing
                    textItem.addEventListener('click', (e) => {
                        if (this.editMode) {
                            e.stopPropagation();
                            this.openEditModal(textItem);
                        }
                    });
                    
                    textLayerDiv.appendChild(textItem);
                    
                    pageTextItems.push({
                        element: textItem,
                        text: word.text,
                        bbox: bbox
                    });
                });
            });
            
            this.textLayers.set(pageNum, pageTextItems);
            
            // Make text layer visible after a short delay
            setTimeout(() => {
                textLayerDiv.classList.add('visible');
            }, 100);
        }
    }

    detectFontFamily(word, height) {
        // Simple font detection based on text characteristics
        const text = word.text;
        const confidence = word.confidence || 0;
        
        // Check for monospace (all chars same width)
        if (text.length > 3 && /^[A-Z0-9_]+$/.test(text)) {
            return 'Courier New, monospace';
        }
        
        // Check for serif fonts (formal documents)
        if (confidence > 80 && height > 12) {
            return 'Times New Roman, serif';
        }
        
        // Check for bold/headers (larger size)
        if (height > 18) {
            return 'Arial, sans-serif';
        }
        
        // Default sans-serif
        return 'Arial, Helvetica, sans-serif';
    }

    displayTextLayers() {
        this.textLayersContainer.innerHTML = '';
        
        this.ocrResults.forEach(result => {
            const item = document.createElement('div');
            item.className = 'text-layer-item';
            item.innerHTML = `
                <strong>Page ${result.pageNum}:</strong><br>
                ${result.data.text.substring(0, 100)}${result.data.text.length > 100 ? '...' : ''}
            `;
            item.addEventListener('click', () => this.scrollToPage(result.pageNum));
            this.textLayersContainer.appendChild(item);
        });
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        
        const textLayers = document.querySelectorAll('.text-layer');
        textLayers.forEach(layer => {
            if (this.editMode) {
                layer.classList.add('edit-mode');
            } else {
                layer.classList.remove('edit-mode');
            }
        });
        
        this.editModeBtn.textContent = this.editMode ? '✓ Edit Mode On' : '✏️ Edit Mode';
        this.editModeBtn.style.background = this.editMode ? 'var(--success-color)' : '';
        this.editModeBtn.style.color = this.editMode ? 'white' : '';
    }

    openEditModal(textElement) {
        this.currentEditElement = textElement;
        
        // Get current styles
        const computedStyle = window.getComputedStyle(textElement);
        
        this.editTextContent.value = textElement.textContent;
        this.editFontSize.value = parseInt(textElement.dataset.originalFontSize || computedStyle.fontSize);
        
        // Get font family
        const fontFamily = textElement.dataset.originalFontFamily || 
                          computedStyle.fontFamily.replace(/['"]/g, '').split(',')[0];
        this.editFontFamily.value = fontFamily;
        
        this.editColor.value = this.rgbToHex(computedStyle.color || '#000000');
        this.editFontWeight.value = computedStyle.fontWeight === 'bold' || 
                                    parseInt(computedStyle.fontWeight) > 400 ? 'bold' : 'normal';
        
        this.editModal.classList.add('active');
    }

    closeModal() {
        this.editModal.classList.remove('active');
        this.currentEditElement = null;
    }

    saveTextChanges() {
        if (!this.currentEditElement) return;
        
        this.currentEditElement.textContent = this.editTextContent.value;
        this.currentEditElement.style.fontSize = `${this.editFontSize.value}px`;
        this.currentEditElement.style.fontFamily = this.editFontFamily.value;
        this.currentEditElement.style.color = this.editColor.value;
        this.currentEditElement.style.fontWeight = this.editFontWeight.value;
        
        this.closeModal();
    }

    zoom(delta) {
        this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
        this.zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
        this.renderAllPages();
        
        // Re-render OCR text layers if they exist
        if (this.ocrResults.length > 0) {
            this.ocrResults.forEach(result => {
                this.renderTextLayer(result.pageNum, result.data);
            });
        }
    }

    async downloadPDF() {
        if (!this.pdfDoc) {
            alert('Lütfen önce bir PDF yükleyin');
            return;
        }

        // Check if PDFLib is loaded
        if (!this.pdfLibLoaded || typeof PDFLib === 'undefined') {
            alert('PDF kütüphanesi henüz yüklenmedi. Lütfen sayfayı yenileyin ve birkaç saniye bekleyin.');
            console.error('PDFLib durumu:', typeof PDFLib);
            return;
        }

        try {
            this.showProgress('PDF hazırlanıyor...', 0);

            // Create a new PDF document
            const pdfDoc = await PDFLib.PDFDocument.create();
            
            // Process each page
            for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
                this.updateProgressText(`Sayfa ${pageNum}/${this.totalPages} işleniyor...`);
                this.updateProgress((pageNum / this.totalPages) * 80);

                // Get the page element from DOM
                const pageElement = document.querySelector(`.pdf-page[data-page-number="${pageNum}"]`);
                if (!pageElement) continue;

                // Get the original canvas (background)
                const originalCanvas = pageElement.querySelector('canvas');
                if (!originalCanvas) continue;

                // Create a new canvas for the combined output
                const outputCanvas = document.createElement('canvas');
                const outputContext = outputCanvas.getContext('2d');
                outputCanvas.width = originalCanvas.width;
                outputCanvas.height = originalCanvas.height;

                // Draw the original PDF page (background image only, no text)
                outputContext.drawImage(originalCanvas, 0, 0);

                // Now cover the old text with white rectangles and draw new text
                const textItems = this.textLayers.get(pageNum);
                if (textItems && textItems.length > 0) {
                    textItems.forEach(item => {
                        const element = item.element;
                        const text = element.textContent;
                        
                        if (!text || text.trim() === '') return;

                        // Get position and styling
                        const x = parseFloat(element.style.left) || 0;
                        const y = parseFloat(element.style.top) || 0;
                        const width = parseFloat(element.style.width) || 100;
                        const height = parseFloat(element.style.height) || 20;
                        const fontSize = parseFloat(element.style.fontSize) || 12;
                        
                        // First, cover the old text area with white rectangle
                        outputContext.fillStyle = 'white';
                        outputContext.fillRect(x - 2, y - 2, width + 4, height + 4);
                        
                        // Get text color
                        const computedColor = window.getComputedStyle(element).color;
                        outputContext.fillStyle = computedColor || '#000000';
                        
                        // Get font properties
                        const fontFamily = element.style.fontFamily || 'Arial';
                        const fontWeight = element.style.fontWeight || 'normal';
                        outputContext.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
                        
                        // Draw the new text
                        outputContext.fillText(text, x, y + fontSize);
                    });
                }

                // Convert canvas to image for PDF
                const imageData = outputCanvas.toDataURL('image/jpeg', 0.95);
                const imageBytes = await fetch(imageData).then(res => res.arrayBuffer());
                
                // Embed image in new PDF
                const image = await pdfDoc.embedJpg(imageBytes);
                const page = pdfDoc.addPage([outputCanvas.width, outputCanvas.height]);
                
                // Draw the combined image
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: outputCanvas.width,
                    height: outputCanvas.height,
                });
            }

            // Save the PDF
            this.updateProgressText('PDF kaydediliyor...');
            this.updateProgress(95);

            const pdfBytes = await pdfDoc.save();
            
            // Download the file
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited-document-${Date.now()}.pdf`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.updateProgress(100);
            this.hideProgress();
            
            setTimeout(() => {
                alert('PDF başarıyla indirildi! ✅');
            }, 300);

        } catch (error) {
            console.error('PDF indirme hatası:', error);
            this.hideProgress();
            alert('PDF indirilemedi. Hata: ' + error.message);
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    showProgress(text, percent) {
        this.progressContainer.style.display = 'block';
        this.progressText.textContent = text;
        
        // Add spinner if not exists
        if (!this.progressContainer.querySelector('.progress-spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'progress-spinner';
            this.progressContainer.insertBefore(spinner, this.progressContainer.firstChild);
        }
        
        this.updateProgress(percent);
    }

    updateProgress(percent) {
        this.progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }

    updateProgressText(text) {
        this.progressText.textContent = text;
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
        const spinner = this.progressContainer.querySelector('.progress-spinner');
        if (spinner) spinner.remove();
    }

    updatePageInfo() {
        this.pageInfo.textContent = `${this.currentPage} / ${this.totalPages}`;
    }

    rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result) return '#000000';
        
        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const pdfEditor = new PDFEditor();
});
