package br.com.belyeve.backend.protection;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.assertj.core.api.Assertions.*;

class ClientIpResolverTest {
    private ClientIpResolver resolver(List<String> proxies) {
        return new ClientIpResolver(new CheckoutProtectionProperties(false,"",List.of(),proxies,5));
    }
    @Test void ignoresSpoofedForwardedAndCloudflareHeadersFromUntrustedPeer() {
        var request=new MockHttpServletRequest();request.setRemoteAddr("198.51.100.7");
        request.addHeader("X-Forwarded-For","203.0.113.8");request.addHeader("CF-Connecting-IP","203.0.113.9");
        assertThat(resolver(List.of("10.0.0.0/8")).resolve(request)).isEqualTo("198.51.100.7");
    }
    @Test void walksTrustedChainFromRightAndStopsAtFirstUntrustedHop() {
        var request=new MockHttpServletRequest();request.setRemoteAddr("10.0.0.1");
        request.addHeader("X-Forwarded-For","1.2.3.4, 198.51.100.7, 10.0.0.2");
        assertThat(resolver(List.of("10.0.0.0/8")).resolve(request)).isEqualTo("198.51.100.7");
    }
    @Test void rejectsMalformedTrustedForwardingWithoutResolvingHostnames() {
        var request=new MockHttpServletRequest();request.setRemoteAddr("10.0.0.1");
        request.addHeader("X-Forwarded-For","attacker.example");
        assertThatThrownBy(() -> resolver(List.of("10.0.0.0/8")).resolve(request)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ClientIpResolver.literal("999.999.999.999")).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void canonicalizesIpv6AndUsesPeerWhenProxyHeaderIsMissing() {
        var request=new MockHttpServletRequest();request.setRemoteAddr("::1");
        assertThat(resolver(List.of("::1/128")).resolve(request)).isEqualTo("0:0:0:0:0:0:0:1");
        assertThat(ClientIpResolver.literal("2001:db8::1")).isEqualTo(ClientIpResolver.literal("2001:0db8:0:0:0:0:0:1"));
    }
}
