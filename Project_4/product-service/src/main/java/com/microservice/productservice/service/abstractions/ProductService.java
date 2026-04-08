package com.microservice.productservice.service.abstractions;


import com.microservice.productservice.dto.request.CreateProductRequest;
import com.microservice.productservice.dto.response.ProductResponse;
import com.microservice.productservice.entity.Product;

import java.util.List;

public interface ProductService {

    public ProductResponse mapToResponseHelper(Product newProduct);
    public ProductResponse createProduct(CreateProductRequest request, String adminId);
    public List<ProductResponse> getAllProduct();
    public ProductResponse getProductById(String id);
    public ProductResponse update(CreateProductRequest request,String id);
    public void deleteProduct(String id);
    public void decrementStock(String id, int qty);
    
}
