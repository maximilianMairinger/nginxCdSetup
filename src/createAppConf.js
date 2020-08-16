
import { promises as fs } from "fs"
import path from "path"
import resolveTemplate from "josm-interpolate-string"
import $ from "./shell"
import xrray from "xrray"
xrray(Array)


// const masterConfig = {
//   nginxDest: path.resolve(args.nginxConfDestination),
//   appDest: path.resolve(args.appDestination),
//   domain: args.domain,
//   name: args.name,
//   branch: "master"
//   hash: "commithash",
//   githubUsername: "",
//   port: 6500
// }

export async function createAppConf(configs, progressCb) {
  if (!(configs instanceof Array)) configs = [configs]
  const log = progressCb ? (...a) => {console.log(...a); progressCb(...a)} : console.log.bind(console);


  configs.ea((conf) => {
    if (conf.branch !== undefined) conf.modifier = conf.branch
    else conf.modifier = conf.hash
    conf.dir = path.join(conf.appDest, conf.name, conf.modifier)
  })

  let lastName

  configs.ea((conf) => {
    if (conf.name !== lastName) log(`Cloning ${conf.name}...`)
    lastName = conf.name

    console.log("Cloning into " + conf.dir)

    $(`cd ${conf.dir}`)
    $(`git clone git@github.com:${conf.githubUsername}/${conf.name} .`, `The repository ${conf.name} does not exist on user ${conf.githubUsername}.`)
    $(`cd ${conf.name}`)
    if (conf.branch !== undefined) {
      $(`git checkout ${conf.branch}`, `The branch ${conf.branch} does not exist on repository ${conf.name} of user ${conf.githubUsername}.`)
    }
    else if (conf.hash !== undefined) {
      $(`git checkout ${conf.hash}`, `The commit hash ${conf.hash} does not exist on repository ${conf.name} of user ${conf.githubUsername}.`)
      $(`git reset --hard`)
    }

    
    
  })


  

  configs.ea((conf) => {
    $(`cd ${conf.dir}`)
    log(`Installing dependencies for ${conf.name}@${conf.modifier}...`)
    $(`npm i`, `While installing dependencies`)
    log(`Building ${conf.name}@${conf.modifier}...`)
    $(`npm run build --if-present`)
  })


  log(`Configuring pm2...`)

  let proms = []
  configs.ea((conf) => {
    if (configs)
    proms.add(fs.writeFile(path.join(conf.dir, "ecosystem.config.js"), resolveTemplate(ecosystemConfigJsTemplate, conf)))
  })

  await Promise.all(proms)

  log(`Starting pm2 threads...`)

  configs.ea((conf) => {
    $(`cd ${conf.dir}`)
    $(`pm2 start ecosystem.config.js`, `Unable to start pm2 for ${conf.name}@${conf.modifier}`)
  })
}
export default createAppConf

const ecosystemConfigJsTemplate = `
module.exports = {
  apps : [{
    script: "replServer/dist/server.js",
    name: "$[ branch / hash ].$[ name ]",
    exec_mode : "cluster",
    instances: 2,
    wait_ready: true,
    args: "--port $[ port ]"
  }]
}
`


