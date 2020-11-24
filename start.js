const fs = require("fs")



function formatLog(kind, logs) {
  return "[" + kind + "]: " + logs.join(", ").split("\n").join("\n\t\t\t") + "\t\t\t\t\t\t\t[" + new Date().toLocaleString("de-AT", { timeZone: "Europe/Vienna" }) + "]"
}
function writeToLogFile(log) {
  fs.appendFileSync("log", log + "\n")
}

function injectFsToLogLevel(level) {
  const logLocal = console[level].bind(console)
  console[level] = (...logs) => {
    let formattedLog = formatLog(level, logs)
    logLocal(formattedLog)
    writeToLogFile(formattedLog)
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



