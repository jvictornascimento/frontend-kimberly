package br.com.belyeve.backend.asaas;

import jakarta.validation.Valid;
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
    public PixPaymentResponse createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.createPix(request.orderId());
    }

    @GetMapping("/payments/{paymentId}/status")
    public PaymentStatusBody paymentStatus(@PathVariable String paymentId) {
        return new PaymentStatusBody(paymentService.statusByPaymentId(paymentId));
    }
}
