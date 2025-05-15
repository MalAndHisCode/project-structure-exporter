const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
}

const { ipcMain, dialog } = require("electron");

ipcMain.handle("dialog:openFolder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) return null;
  return result.filePaths[0];
});

const fs = require("fs");

const defaultExcludeDirs = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".cache",
];

const allowedExtensions = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".env",
  ".html",
  ".css",
  ".md",
  ".yml",
  ".yaml",
  ".sh",
  ".py",
];

// Recursive folder scan
function scanFolderTree(dir, base = dir) {
  const items = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      if (defaultExcludeDirs.includes(entry.name)) continue;

      const children = scanFolderTree(fullPath, base);
      items.push({ type: "folder", name: entry.name, children });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (allowedExtensions.includes(ext)) {
        items.push({ type: "file", name: entry.name, path: relativePath });
      }
    }
  }

  return items;
}

function getFileContents(fileList, baseDir) {
  const contents = [];

  for (const file of fileList) {
    const fullPath = path.join(baseDir, file.path);
    let raw = fs.readFileSync(fullPath, "utf-8");

    // Remove blank lines
    raw = raw
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");

    contents.push({
      fileName: file.name,
      relativePath: file.path,
      content: raw,
    });
  }

  return contents;
}

ipcMain.handle("scan:folderTree", async (event, folderPath) => {
  const tree = scanFolderTree(folderPath);

  // Flatten files from tree
  function collectFiles(nodes) {
    let files = [];
    for (const node of nodes) {
      if (node.type === "file") {
        files.push(node);
      } else if (node.children) {
        files = files.concat(collectFiles(node.children));
      }
    }
    return files;
  }

  const flatFiles = collectFiles(tree);
  const contents = getFileContents(flatFiles, folderPath);

  return { tree, contents };
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
