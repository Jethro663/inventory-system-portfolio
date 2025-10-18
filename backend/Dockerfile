# --- Stage 1: Build the application ---
# Use an official Maven image to build the project.
# We name this stage "build".
FROM maven:3.8-openjdk-17 AS build

# Set the working directory in the build stage
WORKDIR /source

# Copy the entire project's source code into the build stage
COPY . .

# Run the Maven command to build the JAR file.
# This creates the /source/target/ directory.
RUN mvn clean package -DskipTests


# --- Stage 2: Create the final, lightweight image ---
# Use a JRE image, which is smaller than a full JDK image
FROM eclipse-temurin:17-jre-jammy

# Set the working directory for the final application
WORKDIR /app

# Copy the JAR file from the "build" stage into the final image
COPY --from=build /source/target/*.jar app.jar

# Expose the port the application runs on
EXPOSE 8080

# The command to run the application
ENTRYPOINT ["java","-jar","app.jar"]