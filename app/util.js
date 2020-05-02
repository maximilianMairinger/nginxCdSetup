const { promises: fs } = require("fs")
const path = require("path")

async function ensureDir(dir) {
  if (await fs.exists(dir)) {
    await fs.mkdir(dir)
  }
}

async function clearDir(dir) {
  if (await fs.exists(dir)) {
    await fs.rmdir(dir, { recursive: true })
  }
  await fs.mkdir(dir)
}

async function isDirEmpty(dir) {
  const files = await fs.promises.readdir(dir);
  return files.length === 0;
}

async function ensureDirEmpty(dir) {
  if (await fs.exists(dir)) {
    if (!(await isDirEmpty())) throw new Error(dir + " is not an empty directory")
  }
  else {
    await fs.mkdir(dir)
  }
}

async function ensureFileEmpty(file) {
  if (await fs.exists(file)) {
    if ((await fs.read(file)).length !== 0) throw new Error(file + " already exsists")
  }
}

module.exports = {
  ensureDir,
  clearDir,
  isDirEmpty,
  ensureDirEmpty,
  ensureFileEmpty
}