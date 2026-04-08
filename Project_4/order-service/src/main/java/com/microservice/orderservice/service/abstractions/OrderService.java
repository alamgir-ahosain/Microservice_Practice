package com.microservice.orderservice.service.abstractions;


import com.microservice.orderservice.dto.request.PlaceOrderRequest;
import com.microservice.orderservice.dto.response.OrderResponse;
import com.microservice.orderservice.entity.Order;

import java.util.List;

public interface OrderService {
    public OrderResponse maptoResponse(Order order);
    public OrderResponse placeOrder(PlaceOrderRequest req, String userId, String userEmail);
    public OrderResponse getOrder(String orderId, String userId);
    public List<OrderResponse> getUserOrders(String userId);
}


