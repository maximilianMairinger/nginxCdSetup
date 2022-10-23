import yargs from "yargs"
const args = yargs.argv
import detectPort from "detect-port"
import setup from "./setup"
import path from "path"
import clone from "fast-copy"
import createNginxConf from "./createNginxConf"
import createAppConf from "./createAppConf"
import xrray from "xrray"
import fs from "fs"
import slugify from "slugify"
xrray(Array)

const startPort = 5000
const domainPostFix = ".maximilian.mairinger.com"

export { createNginxConf } from "./createNginxConf"
export { createAppConf } from "./createAppConf"


export async function go() {
  try {
    const masterConfig = {
      nginxDest: args.nginxConfDestination ? path.resolve(args.nginxConfDestination) : "/etc/nginx",
      appDest: args.appDestination ? path.resolve(args.appDestination) : "/var/www/html",
      domain: args.domain,
      name: args.name,
      branch: "master",
      githubUsername: args.githubUsername
    }
    
    masterConfig.domain = masterConfig.domain.split(".").map(s => slugify(s)).join(".").toLowerCase()
    // just in case slugify changes its behaviour
    masterConfig.domain = masterConfig.domain.split("|").join("or")
  
  
    if (fs.existsSync(path.join(__dirname, "../../nginxOnTheFlySetup"))) {
      if (masterConfig.domain.endsWith(domainPostFix)) {
        let domainProjectName = masterConfig.domain.slice(0, -domainPostFix.length)
        if (domainProjectName !== masterConfig.name) {
          let pth = path.join(__dirname, "../../nginxOnTheFlySetup/domainProjectIndex")
          let s
          try {
            s = fs.readFileSync(pth).toString()
          }
          catch(e) {
            s = ""
            console.warn("Did not find domainProjectIndex, is this your first invocation? Please enter all already existing (or manually added projects if your migrating) manually to this list (in nginxOnTheFlySetup/domainProjectIndex). We will continue here with a newly created list and add the current project as first entry.")
            fs.writeFileSync(pth, s)
          }
          
          if (!s.endsWith("\n")) fs.appendFileSync(pth, "\n")
          fs.appendFileSync(pth, domainProjectName + "|" + masterConfig.name + "\n")
        }
      }
    }
    else console.warn("Optional dependency nginxOnTheFlySetup not found. Skipping integration")
  
    
    
    const devConfig = clone(masterConfig);
    devConfig.domain = `dev.${devConfig.domain}`
    devConfig.branch = "dev";
    
    
    
    
    let setupProm = setup(masterConfig).then(() => {
      console.log("Setup done")
    })
    let portProm = detectPort(startPort).then((portMaster) => {
      masterConfig.port = portMaster
      return detectPort(portMaster+1).then((portDev) => {
        devConfig.port = portDev
        console.log(`Ports found: master: ${portMaster}; dev: ${portDev}`)
      })
    })
  
  
  
    await Promise.all([setupProm, portProm])



    try {
      // must be synchronous (because shell relies on current cd)
      await createAppConf([masterConfig, devConfig])
      await createNginxConf([masterConfig, devConfig])
      console.log("Done")
    } catch (e) {
      console.log("Error: " + e.message)
      console.log("Cmd: " + e.cmd)
      console.log("Stderr: " + e.stderr)
    }
  }
  catch(e) {
    console.error("Unknown error happend at the very beginning. Nothing happend yet.\n\n\n")
    throw e
  }  
}

