
package com.example.placementhub.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI placementHubOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("PlacementHub API")
                        .description(
                                "Backend API documentation for the PlacementHub "
                                        + "student placement management system."
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("PlacementHub Team")
                        )
                )
                .components(new Components()
                        .addSecuritySchemes(
                                "basicAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("basic")
                                        .description(
                                                "Enter your username and password "
                                                        + "for Basic Authentication."
                                        )
                        )
                )
                .addSecurityItem(
                        new SecurityRequirement()
                                .addList("basicAuth")
                );
    }
}