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

  const tree = await window.electronAPI.scanFolderTree(folderPath);
  const preview = `Project Tree:\n${renderTree(tree)}`;
  document.getElementById("previewPane").textContent = preview;
});
