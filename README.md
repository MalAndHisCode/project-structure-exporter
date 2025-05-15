# 📁 Project Structure Exporter

A cross-platform desktop app built with Electron that lets you select a project folder and export its **folder structure** and **cleaned file contents** to a single `.txt` file. Perfect for sharing code summaries with tools like ChatGPT.

---

## ✨ Features

- Select any local project folder
- Customizable file types (e.g. `.js`, `.ts`, `.html`, etc.)
- Exclude common system folders (e.g. `node_modules`, `.git`)
- Clean preview of folder tree and source code (no empty lines)
- Save the result as a UTF-8 `.txt` file
- Settings saved between sessions
- Works on **Windows**, **macOS**, and **Linux**

---

## 🧰 Tech Stack

- [Electron](https://www.electronjs.org/) for cross-platform desktop support
- HTML, CSS, JavaScript
- Node.js file system API
- Electron Builder for packaging

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/MalAndHisCode/project-structure-exporter
cd project-structure-exporter
npm install
````

### 2. Run the App

```bash
npm start
```

---

## 📦 Build for Windows

To create a `.exe` installer:

```bash
npm run build
```

> You'll find the installer in the `dist/` folder.

---

## ⚙ Customizing Included File Types

- Click the **⚙ Settings** button in the app
- Add/remove file extensions (e.g. `.js`, `.py`, etc.)
- Settings persist automatically

---

## 📁 Example Output

```markdown
Project Tree:
my-app/
├── src/
│   ├── app.js
│   └── utils.js
└── package.json

File Contents:
app.js:
// src/app.js
const express = require('express');
const app = express();
module.exports = app;

utils.js:
// src/utils.js
module.exports = function log(msg) { console.log(msg); };
```

---
