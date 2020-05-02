const { clearDir, ensureDir, ensureDirEmpty, ensureFileEmpty, isDirEmpty } = require("./util")
const path = require("path") 






// const options = {
//   nginxDest: args.nginxConfDestination,
//   appDest: args.appDestination,
//   domain: args.domain,
//   name: args.name
// }


module.exports = async (options) => {

  await Promise.all([
    ensureDir(path.join(options.appDest)),
    ensureDir(path.join(options.appDest))
  ])

  await Promise.all([
    Promise.all([
      ensureDir(path.join(options.appDest, "master")),
      ensureDir(path.join(options.appDest, "dev"))
    ]).then(() => Promise.all([
      ensureDirEmpty(path.join(options.appDest, "master", options.name)),
      ensureDirEmpty(path.join(options.appDest, "dev", options.name)),
    ])),

    ensureFileEmpty(path.join(options.nginxConfDestination, options.domain)),
    ensureFileEmpty(path.join(options.nginxConfDestination, `dev.${options.domain}`))
  ])

  
}
