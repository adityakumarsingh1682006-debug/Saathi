const fs = require("fs");
const path = require("path");

function getAllAppDirs(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fileList.push(path.relative("src/app", fullPath).replace(/\\/g, "/"));
      getAllAppDirs(fullPath, fileList);
    }
  }
  return fileList;
}

const appDirs = ["", "_not-found", "_global-error", ...getAllAppDirs(path.join(process.cwd(), "src/app"))];

for (const r of appDirs) {
  const base = path.basename(r);
  const parent = path.dirname(r) === "." ? "" : path.dirname(r);

  const candidates = [
    path.join(".next/server/app", `${r}.segments`, base),
    path.join(".next/server/app", `${r}.segments`),
    path.join(".next/server/app", parent, `${base}.segments`, base),
    path.join(".next/server/app", `${parent}.segments`, base),
    path.join(".next/server/app", r),
    path.join(".next/types/app", r),
    path.join(".next/static/chunks/app", r),
    path.join(".next/server/chunks", r),
  ];

  for (const d of candidates) {
    try {
      fs.mkdirSync(path.join(process.cwd(), d), { recursive: true });
    } catch (e) {
      // ignore
    }
  }
}

console.log(`Prebuild: Created segment, type, and static chunk skeletons for ${appDirs.length} route directories.`);
