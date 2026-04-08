package com.microservice.orderservice.controller;

import com.microservice.orderservice.dto.request.PlaceOrderRequest;
import com.microservice.orderservice.dto.response.OrderResponse;
import com.microservice.orderservice.service.abstractions.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @RequestBody @Valid PlaceOrderRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Email") String userEmail) {
        return ResponseEntity.status(201).body(orderService.placeOrder(request, userId, userEmail));
    }

    @GetMapping
    public List<OrderResponse> myOrders(
            @RequestHeader("X-User-Id") String userId) {
        return orderService.getUserOrders(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(orderService.getOrder(id, userId));
    }
}