const pm2 = require("pm2")
const fs = require("fs")
const { deepEqual: equals } = require("fast-equals")
const ecosystemConfig = require("./ecosystem.config.js")
const ecosystemCacheFileName = "./.ecosystemCache"


function err(cb_keyword = () => {}) {
  if (typeof cb_keyword === "string" | cb_keyword instanceof Array) {
    if (cb_keyword === "end") cb_keyword = ["dump", "disconnect"]

    return function(error, ...a) {
      if (error) {console.log("err", error); process.exit(2)}
      if (cb_keyword instanceof Array) {
        function rec() {
          if (cb_keyword[0]) cb_keyword[0](err(() => {
            cb_keyword.splice(0, 1);
            rec()
          }))
        }
        rec()
      }
      else pm2[cb_keyword](err())
      
    }
  }

  else return function(error, ...a) {
    if (error) {console.log("err", error); process.exit(2)}
    cb_keyword(...a)
  }
}



let lastEcosystemConfigString = fs.existsSync(ecosystemCacheFileName) ? fs.readFileSync(ecosystemCacheFileName).toString() : "{}"
let lastEcosystemConfig = JSON.parse(lastEcosystemConfigString)
let ecosystemConfigString = JSON.stringify(ecosystemConfig)

/*{
  script: "replServer/dist/server.js",
  name: "$[ branch / hash ].$[ name ]",
  exec_mode : "cluster",
  instances: 2,
  wait_ready: true,
  args: "--port $[ port ]"
}*/

pm2.connect(err(() => {
  pm2.list(err((list) => {
    let nameList = []
    list.forEach((e) => {
      nameList.push(e.name)
    })

    if (equals(ecosystemConfig, lastEcosystemConfig)) {
      if (nameList.includes(ecosystemConfig.name)) pm2.reload(ecosystemConfig.name, err("end"))
      else pm2.start(ecosystemConfig, err("end"))
    }
    else {
      if (nameList.includes(lastEcosystemConfig.name)) {
        pm2.delete(lastEcosystemConfig.name, err(() => {
          pm2.start(ecosystemConfig, err("end"))
        }))
      }
      else {
        pm2.start(ecosystemConfig, err("end"))
      }
    }

    fs.writeFileSync(ecosystemCacheFileName, JSON.stringify(ecosystemConfig))
  }))
}))
