const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  chooseFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  scanFolderTree: (folderPath) =>
    ipcRenderer.invoke("scan:folderTree", folderPath),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  saveOutput: (content) => ipcRenderer.invoke("save:output", content),
});
