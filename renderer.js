document.getElementById("chooseFolder").addEventListener("click", async () => {
  const folderPath = await window.electronAPI.chooseFolder();
  if (folderPath) {
    document.getElementById("folderPath").value = folderPath;
  }
});

function renderTree(data, indent = "") {
  let output = "";
  for (const item of data) {
    if (item.type === "folder") {
      output += `${indent}├── ${item.name}/\n`;
      output += renderTree(item.children, indent + "│   ");
    } else {
      output += `${indent}├── ${item.name}\n`;
    }
  }
  return output;
}

document.getElementById("generate").addEventListener("click", async () => {
  const folderPath = document.getElementById("folderPath").value;
  if (!folderPath) return alert("Please select a folder first.");

  const { tree, contents } = await window.electronAPI.scanFolderTree(
    folderPath
  );

  let preview = `Project Tree:\n${renderTree(tree)}\n\n`;

  preview += `File Contents:\n`;
  for (const file of contents) {
    preview += `${file.fileName}:\n// ${file.relativePath}\n${file.content}\n\n`;
  }

  document.getElementById("previewPane").textContent = preview.trim();

  const settingsPanel = document.getElementById("settingsPanel");
  const extensionsInput = document.getElementById("extensionsInput");

  document
    .getElementById("openSettings")
    .addEventListener("click", async () => {
      const settings = await window.electronAPI.getSettings();
      extensionsInput.value = settings.extensions.join(", ");
      settingsPanel.classList.remove("hidden");
    });

  document.getElementById("closeSettings").addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
  });

  document
    .getElementById("saveSettings")
    .addEventListener("click", async () => {
      const exts = extensionsInput.value
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.startsWith("."));

      await window.electronAPI.saveSettings({ extensions: exts });
      settingsPanel.classList.add("hidden");
      alert("Settings saved!");
    });
});
