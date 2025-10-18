# Use a modern, official Java 17 base image
FROM eclipse-temurin:17-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy the compiled JAR file from your project's target folder into the container
COPY target/*.jar app.jar

# Tell Docker that the container will listen on port 8080
EXPOSE 8080

# The command to run your application
ENTRYPOINT ["java","-jar","app.jar"]