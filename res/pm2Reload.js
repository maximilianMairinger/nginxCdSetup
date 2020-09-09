const pm2 = require("pm2")
const fs = require("fs")
const { deepEqual: equals } = require("fast-equals")
const ecosystemConfig = require("./ecosystem.config.js")
const ecosystemCacheFileName = "./.ecosystemCache"


function err(cb_keyword, forceCall_cb = false, cb = () => {}) {
  if (forceCall_cb instanceof Function) {
    cb = forceCall_cb
    forceCall_cb = false
  }
  if (typeof cb_keyword === "string") {
    if (cb_keyword === "disconnect") forceCall_cb = true

    if (forceCall_cb) return function(error, ...a) {
      if (error) console.log("err", error)
      pm2[cb_keyword](err(() => {
        if (error) process.exit(2)
        cb()
      }))
      
    }
    else return function(err, ...a) {
      if (err) {console.log("err", err); process.exit(2)}
      pm2[cb_keyword](cb)
    }

  }
  else {
    if (forceCall_cb) return function(err, ...a) {
      if (err) console.log("err", err)
      cb_keyword(...a)
      if (err) process.exit(2)
      cb()
    }
    else return function(err, ...a) {
      if (err) {console.log("err", err); process.exit(2)}
      cb_keyword(...a)
      cb()
    }
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
  if (equals(ecosystemConfig, lastEcosystemConfig)) {
    pm2.reload(ecosystemConfig.name, err("disconnect"))
  }
  else {
    pm2.list(err((list) => {
      let nameList = []
      
      list.forEach((e) => {
        nameList.push(e.name)
      })

      if (nameList.includes(lastEcosystemConfig.name)) {
        pm2.delete(lastEcosystemConfig.name, err(() => {
          pm2.start(ecosystemConfig, err("disconnect"))
        }))
      }
      else {
        pm2.start(ecosystemConfig, err("disconnect"))
      }
    }))
  }
  fs.writeFileSync(ecosystemCacheFileName, JSON.stringify(ecosystemConfig))
}))
