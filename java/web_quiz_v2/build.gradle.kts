plugins {
	java
	id("org.springframework.boot") version "3.3.4"
	id("io.spring.dependency-management") version "1.1.6"
}

//bootRun {
//    jvmArgs([
//        "-Djava.util.logging.config.file=${rootProject.projectDir}/logging.properties"
//    ])
//}

//tasks.withType<JavaCompile> {
//    options.compilerArgs.add("-parameters")
//}

tasks.withType<JavaCompile>().configureEach {
    options.apply {
        compilerArgs.addAll(listOf("-Xlint:deprecation", "-Xlint:unchecked", "-parameters"))
        //encoding = "UTF-8"
        isWarnings = true
    }
}

tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    jvmArgs("-Djava.util.logging.config.file=${rootProject.projectDir}/logging.properties")
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

// Apply a specific Java toolchain to ease working on different environments.
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.owasp.safetypes:safetypes-java:1.0.0")
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")
	implementation("com.j2html:j2html:1.6.0")
}
