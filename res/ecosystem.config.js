const fs = require("fs")
const currentGitBranch = require("current-git-branch")
const gitBranch = currentGitBranch()

const defaultPreset = gitBranch === "master" || gitBranch === "stable" ? "prod" : "repl"

const configFilePath = ".deploy"


const configPresets = {
  repl: {
    script: "replServer/dist/server.js",
    log_date_format : "DD.MM.YYYY @ HH:mm:ss Z",
    merge_logs: true,
    max_restarts: 50,
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "fork",
    instances: 1,
    wait_ready: true,
    namespace: "repl",
    env: {
      port: "$[ port ]",
      inProd: false,
      // some libs like express use this to determin if they should publicly print debug logs
      NODE_ENV: "production"
    },
    args: "--port $[ port ]"
  },
  prod: {
    script: "server/dist/server.js",
    log_date_format : "DD.MM.YYYY @ HH:mm:ss Z",
    merge_logs: true,
    max_restarts: 50,
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "fork",
    instances: 1,
    wait_ready: true,
    namespace: "prod",
    env: {
      port: "$[ port ]",
      inProd: true,
      NODE_ENV: "production"
    },
    args: "--port $[ port ]"
  }
}





function constructMergeConfig(defaultConfig) {
  return function mergeConfig(config) {
    for (const key in defaultConfig) {
      if (config[key] === undefined) config[key] = defaultConfig[key]
    }
    return config
  }
}

const mergeConfig = constructMergeConfig(configPresets.repl)

let config
if (fs.existsSync(configFilePath)) {
  let rawConfig = fs.readFileSync(configFilePath).toString()
  let isValidJSON = true
  let jsonConfig
  try {
    jsonConfig = JSON.parse(rawConfig)
    if (typeof jsonConfig !== "object") throw new Error()
  }
  catch(e) {
    isValidJSON = false
  }


  if (isValidJSON) config = mergeConfig(jsonConfig)
  else {
    let presetConfSplit = rawConfig.split(", ").join(" ").split(" ")


    if (configPresets[presetConfSplit[0]] !== undefined) config = configPresets[presetConfSplit[0]]
    else config = configPresets.repl
  }
  
}
else config = configPresets[defaultPreset]




module.exports = config
