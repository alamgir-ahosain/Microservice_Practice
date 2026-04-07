package com.microservice.orderservice.service.implementations;

import com.microservice.orderservice.client.ProductClient;
import com.microservice.orderservice.dto.enums.OrderStatus;
import com.microservice.orderservice.dto.request.OrderItemRequest;
import com.microservice.orderservice.dto.request.PlaceOrderRequest;
import com.microservice.orderservice.dto.response.OrderItemResponse;
import com.microservice.orderservice.dto.response.OrderResponse;
import com.microservice.orderservice.dto.response.ProductResponse;
import com.microservice.orderservice.entity.Order;
import com.microservice.orderservice.entity.OrderItem;
import com.microservice.orderservice.repository.OrderRepository;
import com.microservice.orderservice.service.abstractions.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient; // ← inject Feign interface

    @Override
    public OrderResponse maptoResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .userEmail(order.getUserEmail())
                .shippingAddress(order.getShippingAddress())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest req, String userId, String userEmail) {

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest ir : req.getItems()) {

            ProductResponse product = productClient.getProduct(ir.getProductId());

            if (product == null || product.getStockQuantity() < ir.getQuantity()) {
                throw new RuntimeException("Not enough stock for productId: " + ir.getProductId());
            }
            OrderItem item = OrderItem.builder()
                    .productId(ir.getProductId())
                    .productName(product.getName())
                    .quantity(ir.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            items.add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(ir.getQuantity())));
        }

        Order order = Order.builder()
                .userId(userId)
                .userEmail(userEmail)
                .shippingAddress(req.getShippingAddress())
                .status(OrderStatus.CONFIRMED)
                .totalAmount(total)
                .build();

        Order saved = orderRepository.save(order);

        Order finalOrder = saved;
        items.forEach(i -> i.setOrder(finalOrder));
        saved.setItems(items);

        saved = orderRepository.save(saved);

        // Decrement stock in product-service
        for (OrderItem item : items) {
            productClient.decrementStock(item.getProductId(), item.getQuantity());
        }
        return maptoResponse(saved);
    }

    @Override
    // Use custom repository method to ensure the user owns the order
    public OrderResponse getOrder(String orderId, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));
        return maptoResponse(order);
    }

    @Override
    public List<OrderResponse> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::maptoResponse)
                .toList();
    }

  
}
