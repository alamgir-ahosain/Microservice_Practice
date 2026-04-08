package com.microservice.orderservice.dto.response;

import lombok.Data;
import java.math.BigDecimal;


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