FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /build
COPY .mvn/ .mvn/
COPY --chmod=0755 mvnw ./mvnw
COPY pom.xml ./pom.xml
COPY src/ src/
RUN ./mvnw -B --no-transfer-progress package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /build/target/remote-server-java-1.0.0.jar app.jar
ENV LISTEN_HOST=0.0.0.0 PORT=3200
USER 10001:10001
EXPOSE 3200
ENTRYPOINT ["java", "-jar", "app.jar"]
