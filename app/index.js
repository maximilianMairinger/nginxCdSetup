const yargs = require("yargs")
const args = yargs.argv
const detectPort = require("detect-port")
const { promises: fs } = require("fs")
const setup = require("./setup")
const path = require("path")
const clone = require("fast-copy")
const createNginxConf = require("./createNginxConf")
const createAppConf = require("./createAppConf")
const startPort = 5000



const masterOptions = {
  nginxDest: path.resolve(args.nginxConfDestination),
  appDest: path.resolve(args.appDestination),
  domain: args.domain,
  name: args.name,
  branch: "master"
}

const devOptions = clone(masterOptions);
devOptions.domain = `dev.${devOptions.domain}`
devOptions.branch = "dev"

(async () => {
  

  
  

  let setupProm = setup(masterOptions).then(() => {
    console.log("Setup done")
  })
  let portProm1 = detectPort(startPort).then((port) => {
    masterOptions.port = port
    console.log("Port found: " + port)
  })
  let portProm2 = detectPort(startPort).then((port) => {
    devOptions.port = port
    console.log("Port found: " + port)
  })
  

  await Promise.all([setupProm, portProm1, portProm2])


  let nginxSetupProm = createNginxConf(masterOptions, devOptions)
  let appSetupProm = createAppConf(masterOptions, devOptions)
  

  await Promise.all([nginxSetupProm, appSetupProm])
  


})()




