# Start with a base image that includes Java
FROM openjdk:17-slim

# Set the working directory in the Docker image
WORKDIR /app

# Install Python, pip, and any other dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the local code to the container
COPY . .

# Install Python dependencies
RUN pip3 install earthengine-api datetime geemap ipython requests Pillow reportlab fpdf sklearn numpy

# Ensure the Gradle wrapper is executable
RUN chmod +x ./gradlew

# Expose port 8080 for the web server
EXPOSE 8080

# Command to run the Spring Boot application using Gradle
CMD ["./gradlew", "bootRun"]
