// main.js
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const sharp = require('sharp')

// Enable better error handling for Sharp
sharp.cache(false)

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Handle image processing
ipcMain.handle('process-image', async (event, options) => {
  try {
    const { filePath, width, height, format, quality } = options
    const outputPath = path.join(
      path.dirname(filePath),
      `processed-${path.basename(filePath, path.extname(filePath))}.${format}`
    )

    let pipeline = sharp(filePath)

    // Resize if dimensions provided
    if (width || height) {
      const resizeOptions = {
        width: width || null,
        height: height || null,
        fit: options.cropTo16_9 ? 'cover' : 'inside',
        withoutEnlargement: true
      }
      
      if (options.cropTo16_9) {
        // Calculate height based on 16:9 ratio if width is provided
        if (width) {
          resizeOptions.height = Math.round(width * (9/16))
        }
        // Calculate width based on 16:9 ratio if height is provided
        else if (height) {
          resizeOptions.width = Math.round(height * (16/9))
        }
      }
      
      pipeline = pipeline.resize(resizeOptions)
    }

    // Set format and quality
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality: quality || 80 })
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: quality || 80, mozjpeg: true }) // Use mozjpeg for better compression
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality: quality || 80, compressionLevel: 9 })
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality: quality || 80 })
    }

    await pipeline.toFile(outputPath)
    return { success: true, outputPath }
  } catch (error) {
    return { success: false, error: error.message }
  }
})