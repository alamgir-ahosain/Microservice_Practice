package csembstu.alamgir.orderservice.service.abstractions;

import csembstu.alamgir.orderservice.dto.request.CreateOrderRequest;
import csembstu.alamgir.orderservice.dto.response.OrderResponse;
import csembstu.alamgir.orderservice.entity.Order;

import java.util.List;

public interface OrderService {
    public OrderResponse mapToResponseHelper(Order newOrder);
    public OrderResponse placeOrder(CreateOrderRequest request);
    public List<OrderResponse> getAll();
}
