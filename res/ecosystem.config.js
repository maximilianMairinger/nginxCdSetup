const fs = require("fs")

const configFilePath = ".deploy"


const configPresets = {
  repl: {
    script: "replServer/dist/server.js",
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "cluster",
    instances: 2,
    wait_ready: true,
    args: "--port $[ port ]"
  },
  prod: {
    script: "server/dist/server.js",
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "cluster",
    instances: 2,
    wait_ready: true,
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
  else if (configPresets[rawConfig] !== undefined) config = configPresets[rawConfig]
  else config = configPresets.repl
}
else config = configPresets.repl



module.exports = config
