plugins {
	java
	id("org.springframework.boot") version "3.3.4"
	id("io.spring.dependency-management") version "1.1.6"
}

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

group = "com.securefromscratch"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web:3.4.3")
	implementation("org.owasp.safetypes:safetypes-java:1.0.0")
	implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")
	//implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("javax.validation:validation-api:2.0.1.Final")
	implementation("com.j2html:j2html:1.6.0")
	implementation("org.apache.commons:commons-collections4:4.0")
    implementation("jakarta.validation:jakarta.validation-api:3.0.2")

	//implementation("io.github.owasp-untrust:untrust-boxedpath:0.2")

	//implementation("org.owasp.safetypes:safetypes-java:1.0.0")
	//implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.5")
	//implementation("com.j2html:j2html:1.6.0")
    //implementation("org.springframework.vault:spring-vault-core:3.1.2")
    //implementation("org.springframework.cloud:spring-cloud-starter-vault-config:4.1.4")
    //implementation("org.springframework.boot:spring-boot-starter-actuator")
    //implementation("org.apache.commons:commons-text:1.10.0")


	//implementation("org.springframework.security:spring-security-core:6.3.4")
	//implementation("org.springframework.security:spring-security-config:6.3.4")
	//implementation("org.springframework.security:spring-security-web:6.3.4")

	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
