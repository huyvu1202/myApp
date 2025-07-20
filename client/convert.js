import fs from "fs";
import path from "path";
import iconv from "iconv-lite";

const folderPath = path.resolve(".");

function convertFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const content = iconv.decode(buffer, "Shift_JIS");
    const utf8Buffer = Buffer.from(content, "utf8");
    fs.writeFileSync(filePath, utf8Buffer);
    console.log(`Converted: ${filePath}`);
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error.message);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (/\.(ts|tsx|json|css|js|jsx)$/.test(file)) {
      convertFile(fullPath);
    }
  }
}

walk(folderPath);
