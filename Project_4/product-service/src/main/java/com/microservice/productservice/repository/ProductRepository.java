package com.microservice.productservice.repository;

import com.microservice.productservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ProductRepository extends JpaRepository<Product,String> {
    
    boolean existsByName(String name);
    List<Product> findByActiveTrue();
    boolean existsByNameAndActiveTrue(String name);
}
