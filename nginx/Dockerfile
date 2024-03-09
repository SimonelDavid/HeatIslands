# Use the official NGINX image as a parent image
FROM nginx:latest

# Remove the default configuration file provided by NGINX
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom configuration files from the host machine to the container
COPY conf.d/ /etc/nginx/conf.d/
COPY certs/ /etc/nginx/certs/
COPY keys/ /etc/nginx/keys/

# Expose ports 80 and 443 for HTTP and HTTPS traffic
EXPOSE 80 443

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
