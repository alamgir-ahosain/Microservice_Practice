package csembstu.alamgir.productservice.controller;


import csembstu.alamgir.productservice.dto.request.CreateProductRequest;
import csembstu.alamgir.productservice.dto.response.ProductResponse;
import csembstu.alamgir.productservice.entity.Product;
import csembstu.alamgir.productservice.exception.BadRequestException;
import csembstu.alamgir.productservice.exception.NotFoundException;
import csembstu.alamgir.productservice.service.abstractions.ProductService;
import csembstu.alamgir.productservice.service.implementations.ProductServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
public class ProductController {


    private final ProductService productService;


    public ProductController(ProductServiceImpl productService) {
        this.productService = productService;
    }


   @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid  @RequestBody CreateProductRequest request) throws BadRequestException {
      ProductResponse response= productService.createProduct(request);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);//201 created
   }


    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getProduct());
    }


   @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) throws NotFoundException {
       return ResponseEntity.ok(productService.getProductById(id));
   }


    @PutMapping("/{id}/update-stock")
    public ResponseEntity<ProductResponse> updateProductStock(@PathVariable Long id, @RequestParam Integer quantity) {
        return  ResponseEntity.ok(productService.updateProduct(id,quantity));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id){
       productService.deleteProduct(id);
       return  ResponseEntity.noContent().build();
   }


}
