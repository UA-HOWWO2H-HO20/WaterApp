# WaterApp

docker compose up -d --build 

sudo certbot certonly -d floviz.undo.it --webroot --webroot-path /home/floviz/WaterApp/certbot/webroot/

sudo crontab -l to lsit or -e to edit
0 0 * * * certbot renew

docker compose up -d --build --force-recreate