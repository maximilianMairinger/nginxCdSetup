import { promises as fs } from "fs"
import path from "path"


export async function doesFileExist(filepath){
  try {
    await fs.access(filepath, fs.F_OK);
    return true
  }
  catch(e) {
    return false
  }
}

export async function ensureDir(dir) {
  if (!(await doesFileExist(dir))) {
    await fs.mkdir(dir)
  }
}

export async function clearDir(dir) {
  if (await doesFileExist(dir)) {
    await fs.rmdir(dir, { recursive: true })
  }
  await fs.mkdir(dir)
}

export async function isDirEmpty(dir) {
  const files = await fs.readdir(dir);
  return files.length === 0;
}

export async function ensureDirEmpty(dir) {
  if (await doesFileExist(dir)) {
    if (!(await isDirEmpty(dir))) throw new Error(dir + " is not an empty directory")
  }
  else {
    await fs.mkdir(dir)
  }
}

export async function ensureFileEmpty(file) {
  if (await doesFileExist(file)) {
    if ((await fs.readFile(file)).length !== 0) throw new Error(file + " already exsists")
  }
}

