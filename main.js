const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

// 🔧 Constants
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
const settingsPath = path.join(app.getPath("userData"), "settings.json");

// 🪟 Create Main Window
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

// ⚙ Load user settings or defaults
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  } catch {
    return {
      extensions: [
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
      ],
    };
  }
}

function saveSettings(newSettings) {
  fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
}

// 📂 Recursive Folder Scanner
function scanFolderTree(dir, extensions, base = dir) {
  const items = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      if (defaultExcludeDirs.includes(entry.name)) continue;
      const children = scanFolderTree(fullPath, extensions, base);
      items.push({ type: "folder", name: entry.name, children });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        items.push({ type: "file", name: entry.name, path: relativePath });
      }
    }
  }

  return items;
}

// 📄 Read & Clean File Contents
function getFileContents(fileList, baseDir) {
  return fileList.map((file) => {
    const fullPath = path.join(baseDir, file.path);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const cleaned = raw
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
    return {
      fileName: file.name,
      relativePath: file.path,
      content: cleaned,
    };
  });
}

// 📦 Handle Folder Scan + File Read
ipcMain.handle("scan:folderTree", async (event, folderPath) => {
  const settings = loadSettings();
  const extensions = settings.extensions;

  const tree = scanFolderTree(folderPath, extensions);

  function flattenFiles(nodes) {
    return nodes.flatMap((node) =>
      node.type === "file"
        ? [node]
        : node.children
        ? flattenFiles(node.children)
        : []
    );
  }

  const flatFiles = flattenFiles(tree);
  const contents = getFileContents(flatFiles, folderPath);

  return { tree, contents };
});

// 📁 Folder Picker
ipcMain.handle("dialog:openFolder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  return result.canceled ? null : result.filePaths[0];
});

// 💾 Export Output
ipcMain.handle("save:output", async (event, content) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Save Project Summary",
    defaultPath: "project-summary.txt",
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });

  if (!filePath || canceled) return null;
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
});

// ⚙ Settings Handlers
ipcMain.handle("settings:get", () => loadSettings());
ipcMain.handle("settings:save", (event, settings) => saveSettings(settings));

// 🚀 Launch App
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
