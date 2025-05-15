// Elements
const folderInput = document.getElementById("folderPath");
const fileNameInput = document.getElementById("outputFileName");
const previewPane = document.getElementById("previewPane");
const settingsPanel = document.getElementById("settingsPanel");
const extensionsInput = document.getElementById("extensionsInput");

// 📁 Browse for Folder
document.getElementById("chooseFolder").addEventListener("click", async () => {
  const folderPath = await window.electronAPI.chooseFolder();
  if (folderPath) folderInput.value = folderPath;
});

// ⚙ Open Settings Panel
document.getElementById("openSettings").addEventListener("click", async () => {
  const settings = await window.electronAPI.getSettings();
  extensionsInput.value = settings.extensions.join(", ");
  settingsPanel.classList.remove("hidden");
});

// 💾 Save Settings
document.getElementById("saveSettings").addEventListener("click", async () => {
  const exts = extensionsInput.value
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.startsWith("."));

  await window.electronAPI.saveSettings({ extensions: exts });
  settingsPanel.classList.add("hidden");
  alert("Settings saved!");
});

// ❌ Close Settings Panel
document.getElementById("closeSettings").addEventListener("click", () => {
  settingsPanel.classList.add("hidden");
});

// 📦 Generate Preview + Export
document.getElementById("generate").addEventListener("click", async () => {
  const folderPath = folderInput.value;
  const outputFileName = fileNameInput.value || "project-summary.txt";
  if (!folderPath) return alert("Please select a folder first.");

  const { tree, contents } = await window.electronAPI.scanFolderTree(
    folderPath
  );

  // Format Tree Section
  const renderTree = (nodes, indent = "") => {
    return nodes
      .map((node) => {
        if (node.type === "folder") {
          return `${indent}├── ${node.name}/\n${renderTree(
            node.children,
            indent + "│   "
          )}`;
        } else {
          return `${indent}├── ${node.name}`;
        }
      })
      .join("\n");
  };

  let output = `Project Tree:\n${renderTree(tree)}\n\nFile Contents:\n`;

  // Format File Contents Section
  for (const file of contents) {
    output += `${file.fileName}:\n// ${file.relativePath}\n${file.content}\n\n`;
  }

  // Update Preview
  previewPane.textContent = output.trim();

  // Prompt to Save File
  const filePath = await window.electronAPI.saveOutput(output.trim());
  if (filePath) alert(`Exported to:\n${filePath}`);
});
