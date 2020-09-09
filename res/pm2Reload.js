const pm2 = require("pm2")
const fs = require("fs")
const ecosystemConfig = require("./ecosystem.config.js")

const ecosystemCacheFileName = ".ecosystemCache"


function err(cb_keyword, forceCall_cb = false, cb = () => {}) {
  if (forceCall_cb instanceof Function) {
    cb = forceCall_cb
    forceCall_cb = false
  }
  if (typeof cb_keyword === "string") return function(err, ...a) {
    if (cb_keyword === "disconnect") forceCall_cb = true

    if (forceCall_cb) return function(err, ...a) {
      if (err) console.error(err)
      pm2[cb_keyword](err(() => {
        if (err) process.exit(2)
        cb()
      }))
      
    }
    else return function(err, ...a) {
      if (err) {console.error(err); process.exit(2)}
      pm2[cb_keyword](cb)
    }

  }
  else {
    if (forceCall_cb) return function(err, ...a) {
      if (err) console.error(err)
      cb_keyword(...a)
      if (err) process.exit(2)
      cb()
    }
    else return function(err, ...a) {
      if (err) {console.error(err); process.exit(2)}
      cb_keyword(...a)
      cb()
    }
  }
}




let lastEcosystemConfig = fs.existsSync(ecosystemCacheFileName) ? fs.readFileSync(ecosystemCacheFileName).toString() : ""

pm2.connect(err(() => {
  if (JSON.stringify(ecosystemConfig) === lastEcosystemConfig) {
    pm2.reload(ecosystemConfig, err("disconnect"))
  }
  else {
    pm2.delete(JSON.parse(lastEcosystemConfig), err("disconnect", () => {
      pm2.start(ecosystemConfig, err("disconnect"))
    }))
  }
  fs.writeFileSync(ecosystemCacheFileName, JSON.stringify(ecosystemConfig))
}))