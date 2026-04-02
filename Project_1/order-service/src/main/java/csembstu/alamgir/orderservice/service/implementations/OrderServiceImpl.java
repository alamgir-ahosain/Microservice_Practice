package csembstu.alamgir.orderservice.service.implementations;


import csembstu.alamgir.orderservice.client.ProductClient;
import csembstu.alamgir.orderservice.dto.request.CreateOrderRequest;
import csembstu.alamgir.orderservice.dto.response.OrderResponse;
import csembstu.alamgir.orderservice.entity.Order;
import csembstu.alamgir.orderservice.exception.BadRequestException;
import csembstu.alamgir.orderservice.exception.NotFoundException;
import csembstu.alamgir.orderservice.repository.OrderRepository;
import csembstu.alamgir.orderservice.service.abstractions.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {


    private  final  OrderRepository orderRepository;
    private  final ProductClient productClient;

    public OrderServiceImpl(OrderRepository orderRepository, ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
    }


    @Override
    public OrderResponse mapToResponseHelper(Order newOrder){

        OrderResponse response=new OrderResponse();

        response.setId(newOrder.getId())
                .setProductId(newOrder.getProductId())
                .setQuantity(newOrder.getQuantity())
                .setStatus(newOrder.getStatus());
        return response;
    }


    //place order
    @Override
    public OrderResponse placeOrder(CreateOrderRequest request){
        if (!productClient.isProductExist(request.getProductId()))throw new NotFoundException("Product not found: " + request.getProductId());
        if (!productClient.isStockAvailable(request.getProductId(),request.getQuantity()))
            throw new BadRequestException("Request: "+request.getQuantity()+ ", Insufficient Stock");

        Order newOrder=new Order();
        newOrder.setProductId(request.getProductId())
                .setQuantity(request.getQuantity())
                .setStatus("CONFIRMED");

        Order savedOrder=orderRepository.save(newOrder);
       return mapToResponseHelper(savedOrder);
    }



    //get order
    @Override
    public List<OrderResponse> getAll() {

        List<OrderResponse> orderResponseList=new ArrayList<>();
        List<Order> orders=orderRepository.findAll();
        for (Order order:orders){
            OrderResponse dto=mapToResponseHelper(order);
            orderResponseList.add(dto);
        }
        return  orderResponseList;
    }

}
