package com.microservice.productservice.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ProductResponse(
        String id,
        String name,
        String description,
        Double price,
        Integer stockQuantity,
        String category,
        String imageUrl,
        Boolean active,
        LocalDateTime createdAt,
        String createdBy
) {}