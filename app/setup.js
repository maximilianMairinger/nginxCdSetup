const { clearDir, ensureDir, ensureDirEmpty, ensureFileEmpty, isDirEmpty } = require("./util")
const path = require("path") 






// const options = {
//   nginxDest: args.nginxConfDestination,
//   appDest: args.appDestination,
//   domain: args.domain,
//   name: args.name
// }


module.exports = async (config) => {

  await Promise.all([
    ensureDir(path.join(config.appDest)),
    ensureDir(path.join(config.nginxDest))
  ])


  await Promise.all([
    Promise.all([
      ensureDir(path.join(config.appDest, "master")),
      ensureDir(path.join(config.appDest, "dev"))
    ]).then(() => Promise.all([
      ensureDirEmpty(path.join(config.appDest, "master", config.name)),
      ensureDirEmpty(path.join(config.appDest, "dev", config.name)),
    ])),

    ensureFileEmpty(path.join(config.nginxDest, config.domain)),
    ensureFileEmpty(path.join(config.nginxDest, `dev.${config.domain}`))
  ])

  
}
