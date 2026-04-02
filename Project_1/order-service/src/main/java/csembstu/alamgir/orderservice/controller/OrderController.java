package csembstu.alamgir.orderservice.controller;

import csembstu.alamgir.orderservice.dto.request.CreateOrderRequest;
import csembstu.alamgir.orderservice.dto.response.OrderResponse;
import csembstu.alamgir.orderservice.entity.Order;
import csembstu.alamgir.orderservice.exception.BadRequestException;
import csembstu.alamgir.orderservice.service.abstractions.OrderService;
import csembstu.alamgir.orderservice.service.implementations.OrderServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/orders")
@RestController
public class OrderController {


    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody CreateOrderRequest request) throws BadRequestException {
        return  ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAll() {
        return  ResponseEntity.ok(orderService.getAll());
    }
}
