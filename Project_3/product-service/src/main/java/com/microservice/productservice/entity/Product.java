package com.microservice.productservice.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Entity
@Table(name="products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
@Accessors(chain = true)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String description;
    private double price;
    private int stockQuantity;
    private String category;
    private String imageUrl;
    private boolean active = true; // soft delete flag
    private LocalDateTime createdAt;
    private String createdBy; // createdBy stores the adminId who created this product


}
