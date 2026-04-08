package com.microservice.productservice.controller;



import com.microservice.productservice.dto.request.CreateProductRequest;
import com.microservice.productservice.dto.response.ProductResponse;
import com.microservice.productservice.exception.BadRequestException;
import com.microservice.productservice.exception.NotFoundException;
import com.microservice.productservice.service.abstractions.ProductService;
import com.microservice.productservice.service.implementations.ProductServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductServiceImpl productService) {
        this.productService = productService;
    }


    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @RequestBody @Valid CreateProductRequest request,
            @RequestHeader(value="X-User-Id", required=false) String adminId,
            @RequestHeader(value="X-User-Role", required=false) String role)
            throws  BadRequestException {

        if (!"ADMIN".equals(role)) {return ResponseEntity.status(403).build();}

        ProductResponse response= productService.createProduct(request,adminId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);//201 created
    }


    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAllProduct());
    }


   @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getOne(@PathVariable String id) throws NotFoundException {
       return ResponseEntity.ok(productService.getProductById(id));
   }


//    @PutMapping("/{id}/update-stock")
//    public ResponseEntity<ProductResponse> updateProductStock(@PathVariable Long id, @RequestParam Integer quantity) {
//        return  ResponseEntity.ok(productService.updateProduct(id,quantity));
//    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @RequestHeader(value="X-User-Role", required=false) String role) {
        if (!"ADMIN".equals(role)) return ResponseEntity.status(403).build();
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @RequestBody @Valid CreateProductRequest req,
            @PathVariable String id,
            @RequestHeader(value="X-User-Role", required=false) String role) {
        if (!"ADMIN".equals(role)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(productService.update(req,id));
    }



    // Internal — called by order-service via RestTemplate
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Void> decrementStock(@PathVariable String id, @RequestParam int quantity) {
        productService.decrementStock(id, quantity);
        return ResponseEntity.ok().build();
    }
}
