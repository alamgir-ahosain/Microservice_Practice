package com.microservice.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import com.microservice.orderservice.dto.response.ProductResponse;

@FeignClient(name = "product-service")
public interface ProductClient {

    
    @GetMapping("/api/products/{id}")
    ProductResponse getProduct(@PathVariable("id") String id);

    @PutMapping("/api/products/{id}/stock")
    void decrementStock(@PathVariable("id") String id, @RequestParam("quantity") int quantity);
}
