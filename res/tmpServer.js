const detectPort = require('detect-port');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
})

const port = process.env.port !== undefined ? Promise.resolve(process.env.port) : (() => {
  const port = detectPort(4400)
  port.then((port) => {
    console.log(`No port specified, using port ${port}`)
  })
  return port
})()

port.then((port) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}!`);
  })
})

