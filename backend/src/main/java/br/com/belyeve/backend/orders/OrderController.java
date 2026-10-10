package br.com.belyeve.backend.orders;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CheckoutOrderResponse create(@Valid @RequestBody CheckoutOrderRequest request) {
        return CheckoutOrderResponse.from(service.create(request.toCreateOrderRequest()));
    }

    @GetMapping("/{id}/status")
    public OrderStatusResponse status(@PathVariable UUID id) {
        return OrderStatusResponse.from(service.find(id));
    }
}
