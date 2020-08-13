const { clearDir, ensureDir, ensureDirEmpty, ensureFileEmpty, isDirEmpty } = require("./fsUtil")
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
      ensureDir(path.join(config.appDest, config.name)),
    ]).then(() => Promise.all([
      ensureDirEmpty(path.join(config.appDest, config.name, "master")),
      ensureDirEmpty(path.join(config.appDest, config.name, "dev"))
    ])),

    Promise.all([
      ensureDir(path.join(config.nginxDest, "sites-enabled")),
      ensureDir(path.join(config.nginxDest, "sites-available")),
    ]).then(() => Promise.all([
      ensureFileEmpty(path.join(config.nginxDest, "sites-enabled", config.domain)),
      ensureFileEmpty(path.join(config.nginxDest, "sites-enabled", `dev.${config.domain}`)),
      ensureFileEmpty(path.join(config.nginxDest, "sites-available", config.domain)),
      ensureFileEmpty(path.join(config.nginxDest, "sites-available", `dev.${config.domain}`))
    ]))

    


    
  ])

  
}
