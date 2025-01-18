const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('file')

// Handle 16:9 checkbox visibility
document.getElementById('cropTo16_9').addEventListener('change', (e) => {
  document.getElementById('cropPositionGroup').style.display = e.target.checked ? 'block' : 'none'
})

// Update file extension when format changes
document.getElementById('format').addEventListener('change', (e) => {
  const extension = '.' + e.target.value.toLowerCase();
  document.getElementById('fileExtension').textContent = extension;
});

// Handle drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('drag-over')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')
  fileInput.files = e.dataTransfer.files
  updatePreview(fileInput.files[0])
})

dropZone.addEventListener('click', () => {
  fileInput.click()
})

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    updatePreview(e.target.files[0])
  }
})

function updatePreview(file) {
  if (!file) return

  const previewContainer = document.getElementById('previewContainer')
  const imagePreview = document.getElementById('imagePreview')
  const fileInfo = document.getElementById('fileInfo')
  const uploadPrompt = document.querySelector('.upload-prompt')

  // Update filename input with original filename (without extension)
  const baseFilename = file.name.replace(/\.[^/.]+$/, "")
  document.getElementById('outputFilename').value = baseFilename + '_processed'

  // Create object URL for preview
  const objectUrl = URL.createObjectURL(file)
  imagePreview.src = objectUrl

  // Update file info
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
  fileInfo.innerHTML = `
    <div class="upload-success">File uploaded successfully!</div>
    <div>Name: ${file.name}</div>
    <div>Size: ${fileSizeMB} MB</div>
  `

  // Show preview, hide prompt
  previewContainer.style.display = 'block'
  uploadPrompt.style.display = 'none'

  // Clean up object URL when image loads
  imagePreview.onload = () => {
    URL.revokeObjectURL(objectUrl)
  }
}

// Function to get sanitized filename
function getSanitizedFilename(originalName, format) {
  const customName = document.getElementById('outputFilename').value.trim();
  if (customName) {
    // Remove any file extension from custom name and invalid characters
    const sanitized = customName.replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9-_]/gi, '_');
    return `${sanitized}.${format.toLowerCase()}`;
  }
  
  // If no custom name, use original filename with _processed suffix
  const baseName = originalName.replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]/gi, '_');
  return `${baseName}_processed.${format.toLowerCase()}`;
}

async function processImage() {
  const width = parseInt(document.getElementById('width').value) || null
  const height = parseInt(document.getElementById('height').value) || null
  const format = document.getElementById('format').value
  const quality = parseInt(document.getElementById('quality').value)
  const cropTo16_9 = document.getElementById('cropTo16_9').checked
  const cropPosition = document.querySelector('input[name="cropPosition"]:checked').value
  const status = document.getElementById('status')

  if (!fileInput.files.length) {
    status.className = 'error'
    status.textContent = 'Please select an image first'
    return
  }

  const filePath = fileInput.files[0].path
  const originalFilename = fileInput.files[0].name
  const outputFilename = getSanitizedFilename(originalFilename, format)

  try {
    status.textContent = 'Processing...'
    const result = await window.electronAPI.processImage({
      filePath,
      width,
      height,
      format,
      quality,
      cropTo16_9,
      cropPosition,
      outputFilename
    })

    if (result.success) {
      status.className = 'success'
      status.textContent = `Image processed successfully! Saved to: ${result.outputPath}`
    } else {
      status.className = 'error'
      status.textContent = `Error: ${result.error}`
    }
  } catch (error) {
    status.className = 'error'
    status.textContent = `Error: ${error.message}`
  }
}