package com.microservice.orderservice.service.implementations;


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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {


    @Value("${product-url}")
    private String productUrl;

    private  final OrderRepository orderRepository;
//    private  final ProductClient productClient;
    private final RestTemplate restTemplate;

    public OrderServiceImpl(OrderRepository orderRepository,  RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }


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




    //place order
   // @Override
//    @Transactional
//    public OrderResponse placeOrder(CreateOrderRequest request,String userId,String email){
//        if (!productClient.isProductExist(request.getProductId()))throw new NotFoundException("Product not found: " + request.getProductId());
//        if (!productClient.isStockAvailable(request.getProductId(),request.getQuantity()))
//            throw new BadRequestException("Request: "+request.getQuantity()+ ", Insufficient Stock");
//
//        Order newOrder=new Order();
//        newOrder.setProductId(request.getProductId())
//                .setQuantity(request.getQuantity())
//                .setStatus("CONFIRMED");
//
//        Order savedOrder=orderRepository.save(newOrder);
//       return mapToResponseHelper(savedOrder);
//    }




    @Override
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest req, String userId, String userEmail) {

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest ir : req.getItems()) {
         //  RestTemplate call to product-service
            String productEndpoint = productUrl + "/api/products/" + ir.getProductId();
            ProductResponse product = restTemplate.getForObject(productEndpoint, ProductResponse.class);


            if (product == null || product.getStockQuantity() < ir.getQuantity()) {throw new RuntimeException("Not enough stock for productId: " + ir.getProductId());}
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

       //  Decrement stock in product-service
        for (OrderItem item : items) {
            String stockUrl = productUrl + "/api/products/" +
                    item.getProductId() + "/stock?quantity=" +
                    item.getQuantity();
            restTemplate.patchForObject(stockUrl, null, Void.class);
        }
        return maptoResponse(saved);
    }





    @Override
    // Use custom repository method to ensure the user owns the order
    public OrderResponse getOrder(String orderId, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId).orElseThrow(() -> new RuntimeException("Order not found or access denied"));
        return maptoResponse(order);
    }





    @Override
    public List<OrderResponse> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::maptoResponse)
                .toList();
    }









//
//    //get order
////    @Override
//    public List<OrderResponse> getAll() {
//
//        List<OrderResponse> orderResponseList=new ArrayList<>();
//        List<Order> orders=orderRepository.findAll();
//        for (Order order:orders){
//            OrderResponse dto=mapToResponseHelper(order);
//            orderResponseList.add(dto);
//        }
//        return  orderResponseList;
//    }

}
