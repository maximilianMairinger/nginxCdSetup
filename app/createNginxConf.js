const { clearDir, ensureDir, ensureDirEmpty, ensureFileEmpty, isDirEmpty } = require("./util")
const resolveTemplate = require("./resolveTemplate")




module.exports = (masterOptions, devOptions) => {
  let masterConfig = resolveTemplate(configFileContent, masterOptions)
  let devConfig = resolveTemplate(configFileContent, devOptions)
  


  
  console.log(devConfig)
  


}



const configFileContent = `
upstream nodejs_upstream$[ port ] {
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