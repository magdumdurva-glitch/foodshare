plugins {
    kotlin("jvm") version "2.0.21"
    application
}

group = "org.foodshare"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.18.1")
    implementation("org.xerial:sqlite-jdbc:3.47.1.0")
    implementation("com.auth0:java-jwt:4.4.0")
    implementation("org.mindrot:jbcrypt:0.4")
    implementation("ch.qos.logback:logback-classic:1.5.12")
}

application {
    mainClass.set("org.foodshare.ApplicationKt")
}

kotlin {
    jvmToolchain(21)
}