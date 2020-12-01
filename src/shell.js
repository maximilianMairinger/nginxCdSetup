import shelljs from "shelljs"

export class ShellError extends Error {
  constructor(msg, stderr, cmd) {
    super(msg)
    this.stderr = stderr
    this.cmd = cmd
  }
}



export default function(cmd, errorMsg = "An unknown error occurred") {
  let q = shelljs.exec(cmd)
  if (q.code !== 0) throw new ShellError(errorMsg, q.stderr, cmd)
  return q.stdout
}

