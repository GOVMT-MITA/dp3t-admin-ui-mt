FROM nginx:alpine
#CMD mkdir /usr/share/nginx/html
COPY /build /usr/share/nginx/html
ADD default.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]