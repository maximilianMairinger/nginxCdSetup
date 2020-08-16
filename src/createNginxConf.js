import { promises as fs } from "fs"
import path from "path"
import resolveTemplate from "josm-interpolate-string"
import $ from "./shell"
import xrray from "xrray"
xrray(Array)




// const masterConfig = {
//   nginxDest: path.resolve(args.nginxConfDestination),
//   appDest: path.resolve(args.appDestination),
//   domain: args.domain,
//   name: args.name,
//   branch: "master"
//   hash: "commithash",
//   githubUsername: "",
//   port: 6500
// }

export async function createNginxConf(configs, progressCb) {
  if (!(configs instanceof Array)) configs = [configs]
  const log = progressCb ? (...a) => {console.log(...a); progressCb(...a)} : console.log.bind(console);

  
  
  log(`Adding and linking entry to nginx routing registry...`)
  let aConfig = configs[0]

  let sitesAvailable = path.join(aConfig.nginxDest, "sites-available")
  let sitesEnabled = path.join(aConfig.nginxDest, "sites-enabled")

  let proms = []

  configs.ea((conf) => {
    if (conf.hash !== undefined) {
      conf.shortDomain = `${conf.hash.substr(0, 7)}.${conf.name}.maximilian.mairinger.com`
      conf.shortDomainWithSpace = " " + conf.shortDomain
    }
    else {
      conf.shortDomainWithSpace = ""
    }
  })

  configs.ea((conf) => {
    proms.add(fs.writeFile(path.join(sitesAvailable, conf.domain), resolveTemplate(preConfigFileContent, conf).get()))
  })

  await Promise.all(proms)

  configs.ea((conf) => {
    $(`ln -s ${path.join(sitesAvailable, conf.domain)} ${sitesEnabled}`, `Unable to link ${conf.domain}.`)
  })

  

  try {
    log(`Obtaining ssl certificate...`)

    let domainCliParam = ""
    configs.ea((conf) => {
      if (conf.shortDomain !== undefined) domainCliParam += `-d ${conf.shortDomain} `
      domainCliParam += `-d ${conf.domain} `
    })
  
   
    $(`cd ${path.join(sitesAvailable)} && certbot --nginx ${domainCliParam}--redirect --reinstall`, `Unable to obtain ssl certificate for domain(s) ${configs.Inner("domain").toString()} from letsEncrypt registry. Maybe you've hit a rate limit? Check https://crt.sh/.`)
    
  
    log(`Reloading nginx...`)
  
    $(`service nginx reload`, `Reload of nginx failed`)
  }
  catch(e) {
    console.log("Failure after linking. Cleanup: Removing links")
    configs.ea((conf) => {
      $(`rm ${path.join(sitesEnabled, conf.domain)}`, `Unable to unlink ${conf.domain}.`)
      $(`rm ${path.join(sitesAvailable, conf.domain)}`, `Unable to unlink ${conf.domain}.`)
    })

    $(`service nginx reload`, `Reload of nginx failed`)
    
    throw e
  }

  
}

export default createNginxConf


const preConfigFileContent = `
upstream nodejs_upstream_$[ port ] {
  server 127.0.0.1:$[ port ];
  keepalive 64;
}

server {

  listen 80;
                 
  server_name $[ domain ]$[ shortDomainWithSpace ];

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

// const configFileContent = `
// upstream nodejs_upstream_$[ port ] {
//   server 127.0.0.1:$[ port ];
//   keepalive 64;
// }

// server {
                 
//   server_name $[ domain ];

//   location / {
//     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//     proxy_set_header X-Real-IP $remote_addr;
//     proxy_set_header Host $http_host;

//     proxy_http_version 1.1;
//     proxy_set_header Upgrade $http_upgrade;
//     proxy_set_header Connection "upgrade";

//     proxy_pass http://nodejs_upstream_$[ port ]/;
//     proxy_redirect off;
//     proxy_read_timeout 240s;
//   }


//   listen [::]:443 http2 ssl; # managed by Certbot
//   listen 443 http2 ssl; # managed by Certbot
//   ssl_certificate /etc/letsencrypt/live/$[ domain ]/fullchain.pem; # managed by Certbot
//   ssl_certificate_key /etc/letsencrypt/live/$[ domain ]/privkey.pem; # managed by Certbot
//   include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
//   ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


// }



// server {
//   if ($host = $[ domain ]) {
//     return 301 https://$host$request_uri;
//   } # managed by Certbot



//   listen 80;
//   listen [::]:80;
              
//   server_name $[ domain ];
//   return 404; # managed by Certbot
// }`