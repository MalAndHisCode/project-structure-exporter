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

  let output = `Project Tree:\n${renderTree(tree)}\n\n`;

  output += `File Contents:\n`;
  for (const file of contents) {
    output += `${file.fileName}:\n// ${file.relativePath}\n${file.content}\n\n`;
  }

  // Show in preview
  document.getElementById("previewPane").textContent = output.trim();

  // Export to file
  const filePath = await window.electronAPI.saveOutput(output.trim());
  if (filePath) alert(`Exported to:\n${filePath}`);
});
