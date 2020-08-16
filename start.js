const { go } = require("./dist/nginxCdSetup")
go().then(() => console.log("Done."))