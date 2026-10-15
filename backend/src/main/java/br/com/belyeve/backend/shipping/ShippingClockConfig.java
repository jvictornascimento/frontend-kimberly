package br.com.belyeve.backend.shipping;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Clock;

@Configuration
public class ShippingClockConfig {
    @Bean Clock shippingClock() { return Clock.systemUTC(); }
}
