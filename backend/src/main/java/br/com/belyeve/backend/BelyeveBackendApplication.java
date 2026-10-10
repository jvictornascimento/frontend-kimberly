package br.com.belyeve.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BelyeveBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BelyeveBackendApplication.class, args);
    }
}
