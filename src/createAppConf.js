
import { promises as fs } from "fs"
import fss from "fs"
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


const ecosystemConfigJsTemplate = fss.readFileSync(path.join(__dirname, "../res/ecosystem.config.js")).toString()
const pm2ReloadJsTemplate = fss.readFileSync(path.join(__dirname, "../res/pm2Reload.js")).toString()

export async function createAppConf(configs, progressCb) {
  if (!(configs instanceof Array)) configs = [configs]
  const log = progressCb ? progressCb : console.log.bind(console);


  configs.ea((conf) => {
    if (conf.branch !== undefined) conf.modifier = conf.branch
    else conf.modifier = conf.hash
    conf.dir = path.join(conf.appDest, conf.name, conf.modifier)
  })

  let lastName

  console.log("files", await fs.readdir(configs[0].dir))

  configs.ea((conf) => {
    if (conf.name !== lastName) log(`Cloning <i title="${conf.modifier}">${conf.name}</i>...`)
    lastName = conf.name

    

    $(`git clone git@github.com:${conf.githubUsername}/${conf.name} ${conf.dir}`, `The repository <i title="${conf.modifier}">${conf.name}</i> does not exist on user ${conf.githubUsername}.`)
    if (conf.branch !== undefined) {
      $(`cd ${conf.dir} && git checkout ${conf.branch}`, `The branch <i>${conf.branch}</i> does not exist on repository ${conf.name} of user ${conf.githubUsername}.`)
    }
    else if (conf.hash !== undefined) {
      $(`cd ${conf.dir} && git checkout ${conf.hash}`, `The commit hash <i>${conf.hash}</i> does not exist on repository ${conf.name} of user ${conf.githubUsername}.`)
      $(`cd ${conf.dir} && git reset --hard`)
    }
    try {
      $(`cd ${conf.dir} && git lfs pull`, `Unable to pull lfs files for <i title="${conf.modifier}">${conf.name}</i>`)
    }
    catch (e) {
      error(`Continuing without lfs, this may cause issues later when trying to compress images`)
    }

    
    
  })


  

  configs.ea((conf) => {
    log(`Installing dependencies for <i title="${conf.modifier}">${conf.name}</i>...`)
    $(`cd ${conf.dir} && npm i`, `While installing dependencies`)
    log(`Building <i title="${conf.modifier}">${conf.name}</i>...`)
    $(`cd ${conf.dir} && npm run build --if-present`)
  })


  log(`Configuring pm2...`)

  let proms = []
  configs.ea((conf) => {
    proms.add(fs.writeFile(path.join(conf.dir, "ecosystem.config.js"), resolveTemplate(ecosystemConfigJsTemplate, conf).get()))
    proms.add(fs.writeFile(path.join(conf.dir, "pm2Reload.js"), resolveTemplate(pm2ReloadJsTemplate, conf).get()))
  })

  await Promise.all(proms)

  log(`Starting pm2 threads...`)

  configs.ea((conf) => {
    $(`cd ${conf.dir} && pm2 start ecosystem.config.js`, `Unable to start pm2 for <i title="${conf.modifier}">${conf.name}</i>`)
  })

  log(`Done with app installation`)
}
export default createAppConf

