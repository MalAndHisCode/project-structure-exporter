document.getElementById("chooseFolder").addEventListener("click", async () => {
  const folderPath = await window.electronAPI.chooseFolder();
  if (folderPath) {
    document.getElementById("folderPath").value = folderPath;
  }
});
