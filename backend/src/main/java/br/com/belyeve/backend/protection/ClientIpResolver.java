package br.com.belyeve.backend.protection;

import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;

@Component
public class ClientIpResolver {
    private final List<IpAddressMatcher> trusted;
    public ClientIpResolver(CheckoutProtectionProperties properties) {
        trusted = properties.trustedProxyCidrs() == null ? List.of()
                : properties.trustedProxyCidrs().stream().filter(s -> !s.isBlank())
                .map(IpAddressMatcher::new).toList();
    }
    public String resolve(HttpServletRequest request) {
        String peer = literal(request.getRemoteAddr());
        if (!isTrusted(peer)) return peer;
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded == null) return peer;
        if (forwarded.length() > 1024) throw new IllegalArgumentException("Invalid proxy address");
        String[] hops = forwarded.split(",", -1);
        if (hops.length > 20) throw new IllegalArgumentException("Invalid proxy address");
        for (int i = hops.length - 1; i >= 0 && isTrusted(peer); i--) peer = literal(hops[i].trim());
        return peer;
    }
    private boolean isTrusted(String ip) { return trusted.stream().anyMatch(m -> m.matches(ip)); }
    static String literal(String value) {
        // Reject hostnames before InetAddress: this must never trigger DNS lookups.
        if (value == null || value.length() > 45
                || !(value.matches("[0-9]{1,3}(\\.[0-9]{1,3}){3}")
                    || (value.contains(":") && value.matches("[0-9a-fA-F:.]+"))))
            throw new IllegalArgumentException("Invalid proxy address");
        try { return InetAddress.getByName(value).getHostAddress(); }
        catch (UnknownHostException e) { throw new IllegalArgumentException("Invalid proxy address"); }
    }
}
