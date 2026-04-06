package com.microservice.orderservice.repository;


import com.microservice.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order,String> {
    Optional<Order> findByIdAndUserId(String orderId, String userId);
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
}
