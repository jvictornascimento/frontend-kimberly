package br.com.belyeve.backend.integrations.melhorenvio;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Map;
import java.util.Set;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/integrations/melhor-envio")
public class MelhorEnvioOAuthController {
    private static final MediaType TEXT = new MediaType("text", "plain", java.nio.charset.StandardCharsets.UTF_8);
    private final MelhorEnvioOAuthService service;
    public MelhorEnvioOAuthController(MelhorEnvioOAuthService service) { this.service=service; }
    @PostMapping("/authorize")
    public ResponseEntity<Map<String,String>> authorize(@RequestHeader(value="X-Integration-Setup-Key",required=false) String key) {
        return ResponseEntity.ok().headers(headers()).body(Map.of("authorizationUrl",service.authorize(key)));
    }
    public record Callback(@Size(max=4096) @Pattern(regexp="[!-~]+") String code,
            @Size(min=43,max=43) @Pattern(regexp="[A-Za-z0-9_-]+") String state,
            @Size(max=80) @Pattern(regexp="[a-zA-Z0-9_-]+") String error,
            @Size(max=512) String error_description) {}
    @GetMapping(value="/callback",produces="text/plain;charset=UTF-8")
    public ResponseEntity<String> callback(@Valid @ModelAttribute Callback callback, HttpServletRequest request) {
        if(request.getParameterMap().isEmpty())
            return ResponseEntity.ok().headers(headers()).contentType(TEXT).body("Callback BELYEVE disponível. Inicie a autorização pelo procedimento de configuração.");
        Set<String> accepted=Set.of("code","state","error","error_description");
        if(request.getParameterMap().entrySet().stream().anyMatch(e -> !accepted.contains(e.getKey()) || e.getValue().length!=1)
                || callback.state()==null || (callback.code()==null)==(callback.error()==null))
            throw new OAuthFailure(400,"Retorno de autorização inválido.");
        service.callback(callback.code(),callback.state(),callback.error());
        return ResponseEntity.ok().headers(headers()).contentType(TEXT).body("Conta Melhor Envio conectada à BELYEVE. Você pode fechar esta janela.");
    }
    @ExceptionHandler(OAuthFailure.class)
    ResponseEntity<String> failure(OAuthFailure error) {
        return ResponseEntity.status(error.status).headers(headers()).contentType(TEXT).body(error.getMessage());
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<String> invalid(Exception error) {
        // Binding errors can embed the authorization code in their message; never log or echo them.
        return ResponseEntity.badRequest().headers(headers()).contentType(TEXT).body("Retorno de autorização inválido.");
    }
    private static HttpHeaders headers() {
        HttpHeaders headers=new HttpHeaders();
        headers.setCacheControl("no-store"); headers.set("Pragma","no-cache");
        headers.set("Referrer-Policy","no-referrer");headers.set("X-Robots-Tag","noindex, nofollow");
        return headers;
    }
}
