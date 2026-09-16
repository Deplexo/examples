FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html styles.css /usr/share/nginx/html/
EXPOSE 3000
ENTRYPOINT ["nginx", "-g", "daemon off;"]
