package br.com.belyeve.backend.protection;

import br.com.belyeve.backend.api.StandardError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.time.Instant;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;

public class CheckoutProtectionFilter extends OncePerRequestFilter {
    private final CheckoutProtectionProperties properties;
    private final ClientIpResolver ips;
    private final CheckoutRateLimiter limiter;
    private final TurnstileClient turnstile;
    private final Validator validator;
    private final JsonMapper mapper;
    public CheckoutProtectionFilter(CheckoutProtectionProperties properties, ClientIpResolver ips,
            CheckoutRateLimiter limiter, TurnstileClient turnstile, Validator validator, JsonMapper mapper) {
        this.properties = properties; this.ips = ips; this.limiter = limiter;
        this.turnstile = turnstile; this.validator = validator; this.mapper = mapper;
    }
    private record Token(@NotBlank @Size(max = 2048) @Pattern(regexp = "[!-~]+") String value) {}
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())) return true;
        String path = request.getServletPath();
        return !(path.equals("/api/orders") || path.equals("/api/payments")
                || path.matches("/api/orders/[^/]+/payments/pix"));
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String ip;
        boolean invalidAddress = false;
        try { ip = ips.resolve(request); }
        catch (IllegalArgumentException e) {
            ip = request.getRemoteAddr();
            invalidAddress = true;
        }
        CheckoutRateLimiter.Admission admission = limiter.acquire(ip);
        if (!admission.allowed()) {
            response.setHeader("Retry-After", Long.toString(admission.retryAfterSeconds()));
            reject(request, response, 429, "Too many attempts. Please wait before trying again."); return;
        }
        boolean completed = false;
        try {
            if (invalidAddress) { reject(request, response, 400, "Invalid client address"); return; }
            if (properties.turnstileEnabled()) {
                String token = request.getHeader("X-Turnstile-Token");
                if (!validator.validate(new Token(token)).isEmpty()) {
                    reject(request, response, 400, "Human verification is required"); return;
                }
                boolean valid;
                try {
                    valid = turnstile.verify(token, ip,
                            request.getServletPath().equals("/api/orders") ? "checkout_order" : "checkout_payment");
                } catch (RuntimeException e) {
                    // Never log the provider exception: it can contain the submitted secret/token.
                    reject(request, response, 503, "Human verification is temporarily unavailable"); return;
                }
                if (!valid) { reject(request, response, 403, "Human verification failed. Please try again."); return; }
            }
            chain.doFilter(request, response);
            completed = true;
        } finally {
            limiter.complete(admission, !completed || response.getStatus() >= 400);
        }
    }
    private void reject(HttpServletRequest request, HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        mapper.writeValue(response.getOutputStream(), new StandardError(Instant.now(), status,
                status == 429 ? "Too Many Requests" : "Checkout protection", message, request.getRequestURI()));
    }
}
