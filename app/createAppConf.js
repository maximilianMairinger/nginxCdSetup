const { clearDir, ensureDir, ensureDirEmpty, ensureFileEmpty, isDirEmpty } = require("./util")
const shell = require("shelljs")
const { promises: fs } = require("fs")
const resolveTemplate = require("./resolveTemplate")
const path = require("path")

// const masterConfig = {
//   nginxDest: path.resolve(args.nginxConfDestination),
//   appDest: path.resolve(args.appDestination),
//   domain: args.domain,
//   name: args.name,
//   branch: "master"
// }

module.exports = async (masterConfig, devConfig) => {
  let configs = [masterConfig, devConfig]

  console.log("started app")

  configs.ea((conf) => {
    shell.exec(`cd ${path.join(conf.appDest, conf.branch)} && git clone git@github.com:${conf.githubUsername}/${conf.name} && cd ${conf.name} && git checkout ${conf.branch}`)
  })

  console.log("clone done")

  

  configs.ea((conf) => {
    shell.cd(path.join(conf.appDest, conf.branch, conf.name))
    shell.exec(`npm i && npm run build --if-present`)
  })

  console.log("Installing and building done")


  let proms = []
  configs.ea((conf) => {
    proms.add(fs.writeFile(path.join(conf.appDest, conf.branch, conf.name, "ecosystem.config.js"), resolveTemplate(ecosystemConfigJsTemplate, conf)))
  })

  await Promise.all(proms)

  console.log("write ecosystem done")

  configs.ea((conf) => {
    shell.cd(path.join(conf.appDest, conf.branch, conf.name))
    shell.exec(`pm2 start ecosystem.config.js`)
  })

  console.log("started pm2")
  

}

const ecosystemConfigJsTemplate = `
module.exports = {
  apps : [{
    script: "replServer/dist/server.js",
    name: "$[ branch ].$[ name ]",
    exec_mode : "cluster",
    instances: 2,
    wait_ready: true,
    args: "--port $[ port ]"
  }]
}
`


