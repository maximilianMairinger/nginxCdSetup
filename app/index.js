const yargs = require("yargs")
const args = yargs.argv
const detectPort = require("detect-port")
const { promises: fs } = require("fs")
const setup = require("./setup")
const path = require("path")
const startPort = 5000


const options = {
  nginxDest: path.resolve(args.nginxConfDestination),
  appDest: path.resolve(args.appDestination),
  domain: args.domain,
  name: args.name
}

(async () => {
  


  let setupProm = setup(options).then(() => {
    console.log("Setup done")
  })
  let portProm = detectPort(startPort).then((port) => {
    options.port = port
    console.log("Port found: " + port)
  })
  

  await Promise.all([setupProm, portProm])


  
  
  
  


})()




