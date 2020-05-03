const { clearDir, ensureDir, ensureDirEmpty, ensureFileEmpty, isDirEmpty } = require("./util")
const resolveTemplate = require("./resolveTemplate")
const { promises: fs } = require("fs")
const path = require("path")

const shell = require("shelljs")


// const masterConfig = {
//   nginxDest: path.resolve(args.nginxConfDestination),
//   appDest: path.resolve(args.appDestination),
//   domain: args.domain,
//   name: args.name,
//   branch: "master"
// }

module.exports = async (masterConfig, devConfig) => {
  const configs = [devConfig, masterConfig]

  
  
  

  let sitesAvailable = path.join(masterConfig.nginxDest, "sites-available")
  let sitesEnabled = path.join(masterConfig.nginxDest, "sites-enabled")

  let proms = []

  configs.ea((conf) => {
    proms.add(fs.writeFile(path.join(sitesAvailable, conf.domain), resolveTemplate(preConfigFileContent, conf)))
  })

  await Promise.all(proms)

  configs.ea((conf) => {
    shell.exec(`ln -s ${path.join(sitesAvailable, conf.domain)} ${sitesEnabled}`)
  })

  configs.ea((conf) => {
    shell.exec(`certbot --nginx -d ${conf.domain} --redirect --keep`)
  })


  proms = []

  // configs.ea((conf) => {
  //   proms.add(fs.writeFile(path.join(sitesAvailable, conf.domain), resolveTemplate(configFileContent, conf)))
  // })


  await Promise.all(proms)



  console.log("nginx reload")
  shell.exec("service nginx reload")
  console.log("done nginx reload")
}

const preConfigFileContent = `
upstream nodejs_upstream_$[ port ] {
  server 127.0.0.1:$[ port ];
  keepalive 64;
}

server {

  listen 80;
                 
  server_name $[ domain ];

  location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $http_host;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_pass http://nodejs_upstream_$[ port ]/;
    proxy_redirect off;
    proxy_read_timeout 240s;
  }

}`

const configFileContent = `
upstream nodejs_upstream_$[ port ] {
  server 127.0.0.1:$[ port ];
  keepalive 64;
}

server {
                 
  server_name $[ domain ];

  location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $http_host;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_pass http://nodejs_upstream_$[ port ]/;
    proxy_redirect off;
    proxy_read_timeout 240s;
  }


  listen [::]:443 http2 ssl; # managed by Certbot
  listen 443 http2 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/$[ domain ]/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/$[ domain ]/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}



server {
  if ($host = $[ domain ]) {
    return 301 https://$host$request_uri;
  } # managed by Certbot



  listen 80;
  listen [::]:80;
              
  server_name $[ domain ];
  return 404; # managed by Certbot
}`