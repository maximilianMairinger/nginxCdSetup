const yargs = require("yargs")
const args = yargs.argv
const detectPort = require("detect-port")
const setup = require("./setup")
const path = require("path")
const clone = require("fast-copy")
const createNginxConf = require("./createNginxConf")
const createAppConf = require("./createAppConf")
const xrray = require("xrray")
xrray(Array)
const startPort = 5000



const masterConfig = {
  nginxDest: args.nginxConfDestination ? path.resolve(args.nginxConfDestination) : "/etc/nginx",
  appDest: args.appDestination ? path.resolve(args.appDestination) : "/var/www/html",
  domain: args.domain,
  name: args.name,
  branch: "master",
  gtihubUsername: args.githubUsername
}


const devConfig = clone(masterConfig);
devConfig.domain = `dev.${devConfig.domain}`
devConfig.branch = "dev";




(async () => {





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


  let nginxSetupProm = createNginxConf(masterConfig, devConfig)
  let appSetupProm = createAppConf(masterConfig, devConfig)
  

  await Promise.all([nginxSetupProm, appSetupProm])
  


})()






