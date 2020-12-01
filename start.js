const fs = require("fs")



function formatLogTime(kind, logs) {
  return "[" + kind + "]: " + logs.join(", ").split("\n").join("\n" + " ".repeat(kind.length)) + "\t\t\t\t\t\t\t[" + new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" }) + "]"
}
function formatLog(kind, logs) {
  return "[" + kind + "]: " + logs.join(", ").split("\n").join("\n" + " ".repeat(kind.length))
}
function writeToLogFile(log) {
  fs.appendFileSync("log", log + "\n")
}

function injectFsToLogLevel(level) {
  const logLocal = console.log.bind(console)
  console[level] = (...logs) => {
    let formattedLogTime = formatLogTime(level, logs)
    let formattedLog = formatLog(level, logs)
    logLocal(formattedLog)
    writeToLogFile(formattedLogTime)
  }
}

injectFsToLogLevel("log")
injectFsToLogLevel("warn")
injectFsToLogLevel("error")


try {
  const { go } = require("./dist/nginxCdSetup")
  console.log("")
  console.log("")
  console.log("Go")
  go().then(() => console.log("Done."))
}
catch(e) {
  console.error("Thrown", e)
}



