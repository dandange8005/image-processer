const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  processImage: (options) => ipcRenderer.invoke('process-image', options)
})