const fs = require("fs")

const configFilePath = ".deploy"


const configPresets = {
  repl: {
    script: "replServer/dist/server.js",
    merge_logs: true,
    max_restarts: 50,
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "fork",
    instances: 1,
    wait_ready: true,
    namespace: "repl",
    env: {
      port: "$[ port ]",
      inProd: false
    },
    args: "--port $[ port ]"
  },
  prod: {
    script: "server/dist/server.js",
    merge_logs: true,
    max_restarts: 50,
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "fork",
    instances: 1,
    wait_ready: true,
    namespace: "prod",
    env: {
      port: "$[ port ]",
      inProd: true
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
else config = configPresets.repl



module.exports = config
