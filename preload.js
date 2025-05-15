const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  chooseFolder: () => ipcRenderer.invoke("dialog:openFolder"),
});
