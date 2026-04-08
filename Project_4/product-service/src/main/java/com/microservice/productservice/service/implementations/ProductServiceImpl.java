package com.microservice.productservice.service.implementations;


import com.microservice.productservice.dto.request.CreateProductRequest;
import com.microservice.productservice.dto.response.ProductResponse;
import com.microservice.productservice.entity.Product;
import com.microservice.productservice.exception.BadRequestException;
import com.microservice.productservice.exception.NotFoundException;
import com.microservice.productservice.repository.ProductRepository;
import com.microservice.productservice.service.abstractions.ProductService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }



    @Override
    public ProductResponse mapToResponseHelper(Product newProduct) {
        return ProductResponse.builder()
                .id(newProduct.getId())
                .name(newProduct.getName())
                .description(newProduct.getDescription())
                .price(newProduct.getPrice())
                .stockQuantity(newProduct.getStockQuantity())
                .category(newProduct.getCategory())
                .imageUrl(newProduct.getImageUrl())
                .active(newProduct.isActive())
                .createdAt(newProduct.getCreatedAt())
                .createdBy(newProduct.getCreatedBy())
                .build();
    }



    //create product
    @Override
    public ProductResponse createProduct(CreateProductRequest request,String adminId) {

       boolean existsProductsByName= productRepository.existsByName(request.getName());
       if (existsProductsByName) throw new BadRequestException("Product "+request.getName()+" already exists!");

       Product newProduct= new Product();
       newProduct.setName(request.getName())
                .setDescription(request.getDescription())
                .setPrice(request.getPrice())
                .setStockQuantity(request.getStockQuantity())
                .setImageUrl(request.getImageUrl())
                .setCategory(request.getCategory())
                .setCreatedAt(LocalDateTime.now())
                .setCreatedBy(adminId);

       Product savedProduct=productRepository.save(newProduct);

       return  mapToResponseHelper(savedProduct);
    }




    //get all product
    @Override
    public List<ProductResponse> getAllProduct(){
        return productRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponseHelper)
                .toList();
        //or
//        List<ProductResponse> responseList=new ArrayList<>();
//        List<Product> products=productRepository.findByActiveTrue(true);
//        for(Product product:products){
//            ProductResponse dto=mapToResponseHelper(product);
//            responseList.add(dto);
//        }
//        return  responseList;

    }



   //get produc by id
    @Override
    public ProductResponse getProductById(String id){
       Product product=productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product does not exist: " + id));
       return mapToResponseHelper(product);

    }


 //update product
   @Override
    public ProductResponse update(CreateProductRequest req,String id) {
        Product p=productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product does not exist: " + id));
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setStockQuantity(req.getStockQuantity());
        p.setCategory(req.getCategory());
        p.setImageUrl(req.getImageUrl());

        return mapToResponseHelper(productRepository.save(p));
    }


    // DELETE
    @Override
    public void deleteProduct(String id) {
        Product product=productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product does not exist: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    

    // Called by order-service 
    @Override
    public void decrementStock(String id, int qty) {
        Product p=productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product does not exist: " + id));
        if (p.getStockQuantity() < qty) throw new RuntimeException("Not enough stock for: " + p.getName());
        
        p.setStockQuantity(p.getStockQuantity() - qty);
        productRepository.save(p);
    }

}

