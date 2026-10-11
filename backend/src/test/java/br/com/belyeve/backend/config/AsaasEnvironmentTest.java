package br.com.belyeve.backend.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AsaasEnvironmentTest {
    @Test
    void selectsSandboxCredentialsWhenSandboxIsActive() {
        AppProperties.Asaas properties = new AppProperties.Asaas(
                "sandbox", "https://sandbox.example/v3", "https://production.example/v3",
                "sandbox-key", "production-key", "webhook-token"
        );

        assertThat(properties.baseUrl()).isEqualTo("https://sandbox.example/v3");
        assertThat(properties.apiKey()).isEqualTo("sandbox-key");
        assertThat(properties.isEnvironmentConfigured()).isTrue();
    }

    @Test
    void selectsProductionCredentialsWhenProductionIsActive() {
        AppProperties.Asaas properties = new AppProperties.Asaas(
                "production", "https://sandbox.example/v3", "https://production.example/v3",
                "sandbox-key", "production-key", "webhook-token"
        );

        assertThat(properties.baseUrl()).isEqualTo("https://production.example/v3");
        assertThat(properties.apiKey()).isEqualTo("production-key");
        assertThat(properties.isEnvironmentConfigured()).isTrue();
    }

    @Test
    void rejectsProductionWithoutAProductionKey() {
        AppProperties.Asaas properties = new AppProperties.Asaas(
                "production", "https://sandbox.example/v3", "https://production.example/v3",
                "sandbox-key", "", "webhook-token"
        );

        assertThat(properties.isEnvironmentConfigured()).isFalse();
    }
}
