## Server deployment
use rtmp + nginx for streaming
### Install
- install ffmpeg
- install nginx
    - note that nginx install step is different betweeb Mac & Windows 
    - reference: [在 Mac 上透過 Homebrew 安裝 NGINX 與啟用 HLS 功能](https://medium.com/@ponychen/%E5%9C%A8-osx-%E4%B8%8A%E9%80%8F%E9%81%8E-homebrew-%E5%AE%89%E8%A3%9D-nginx-%E8%88%87%E5%95%9F%E7%94%A8-hls-%E5%8A%9F%E8%83%BD-9b5f02130f2)
- install [ngrok](https://ngrok.com/download)(a web proxy for demo use, use when you network is private IP)

### Step
#### step1. nginx setting
1. moidify nginx.conf(`/usr/local/etc/nginx/nginx.conf` in macOS)
```
worker_processes  1;

events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       8080;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }

        # rtmp stat
        location /stat {
          rtmp_stat all;
          rtmp_stat_stylesheet stat.xsl;
        }
        location /stat.xsl {
            root /usr/local/Cellar/rtmp-nginx-module/1.1.7.10/share/rtmp-nginx-module;
        }

        location /control {
          rtmp_control all;
        }

        # HLS setting
        location /hls {

        # Disable cache
        add_header Cache-Control no-cache;

        # CORS setup
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length';

        # allow CORS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Serve HLS fragments
        types {
            application/vnd.apple.mpegurl m3u8;
            video/mp2t ts;
        }
        root /Users/john85051232/rmtp;
        
        }
        
        # HLS setting end
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
        
        
    }
    include servers/*;
}

# rtmp setting 
rtmp {
    server {
        listen 1935;
        ping 30s;
        notify_method get;

        # rtmp support hls setting
        application hls {
            live on;
            hls on;
                hls_nested on;
                hls_fragment_naming system;
            hls_path /Users/john85051232/rmtp/hls;   # where to find streaming files
            hls_fragment 3s;                         # single ().ts) files length
            # hls_cleanup off;                       # if clean video file

        }

    }
}
```
2. reload nginx config: `$ nginx -s reload`
3. put your file in ngrox server root
    - for macOS, it is under `/usr/local/var/www/`

#### step2. start web proxy(only need when you network is private IP)
1. `./ngrok http 8080`
    - 8080 is port which nginx is linstening

#### step3. streaming
1. use ffmpeg for streaming(with hls)
```
ffmpeg -f avfoundation -r 30 -i 0 -deinterlace -vcodec libx264 -pix_fmt yuv420p -preset medium -g 60 -b:v 360k -threads 6 -bufsize 2048k -f flv rtmp://localhost/hls/moive
```
- this command is for macOS
- note that output path: rtmp://localhost/hls/moive
    - hls is rtmp path under nginx server root path
    - moive is folder of video save for streaming

#### step4. demo
1. open index.html
2. change streaming source
    - view under same network: http://127.0.0.1/hls/moive/index.m3u8
    - view under different network: http://[your ngrok website]/hls/moive/index.m3u8

