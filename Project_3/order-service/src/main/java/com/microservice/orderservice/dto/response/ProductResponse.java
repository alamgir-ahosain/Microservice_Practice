package com.microservice.orderservice.dto.response;

import lombok.Data;
import java.math.BigDecimal;

// This mirrors product-service's ProductResponse —
// only include fields order-service actually needs
@Data
public class ProductResponse {

    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String category;
    private String imageUrl;
    private boolean active;
}