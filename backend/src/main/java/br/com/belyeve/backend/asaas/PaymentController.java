package br.com.belyeve.backend.asaas;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/orders/{orderId}/payments/pix")
    public PixPaymentResponse createPix(@PathVariable UUID orderId) {
        return paymentService.createPix(orderId);
    }

    @PostMapping("/payments")
    public Object createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest servletRequest
    ) {
        if ("pix".equals(request.method())) {
            return paymentService.createPix(request.orderId());
        }
        return paymentService.createCreditCard(
                request.orderId(),
                request.card(),
                request.installments(),
                remoteIp(servletRequest)
        );
    }

    @GetMapping("/payments/{paymentId}/status")
    public PaymentStatusBody paymentStatus(@PathVariable String paymentId) {
        return new PaymentStatusBody(paymentService.statusByPaymentId(paymentId));
    }

    private String remoteIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
