const { promises: fs } = require("fs")
const path = require("path")


async function doesFileExist(filepath){
  try {
    await fs.access(filepath, fs.F_OK);
    return true
  }
  catch(e) {
    return false
  }
}

async function ensureDir(dir) {
  if (!(await doesFileExist(dir))) {
    await fs.mkdir(dir)
  }
}

async function clearDir(dir) {
  if (await doesFileExist(dir)) {
    await fs.rmdir(dir, { recursive: true })
  }
  await fs.mkdir(dir)
}

async function isDirEmpty(dir) {
  const files = await fs.readdir(dir);
  return files.length === 0;
}

async function ensureDirEmpty(dir) {
  if (await doesFileExist(dir)) {
    if (!(await isDirEmpty())) throw new Error(dir + " is not an empty directory")
  }
  else {
    await fs.mkdir(dir)
  }
}

async function ensureFileEmpty(file) {
  if (await doesFileExist(file)) {
    if ((await fs.read(file)).length !== 0) throw new Error(file + " already exsists")
  }
}

module.exports = {
  doesFileExist,
  ensureDir,
  clearDir,
  isDirEmpty,
  ensureDirEmpty,
  ensureFileEmpty
}