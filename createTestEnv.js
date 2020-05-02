const fs = require("fs")
const out = "./test_out"

if (fs.existsSync(out)) fs.rmdirSync(out, { recursive: true })

fs.mkdirSync(out)
