const { contextBridge, ipcRenderer } = require("electron");

// Securely expose APIs to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Folder Picker
  chooseFolder: () => ipcRenderer.invoke("dialog:openFolder"),

  // Folder + File Scan
  scanFolderTree: (folderPath) =>
    ipcRenderer.invoke("scan:folderTree", folderPath),

  // Save Output File
  saveOutput: (content) => ipcRenderer.invoke("save:output", content),

  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
});
