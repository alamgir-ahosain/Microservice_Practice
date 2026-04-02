package csembstu.alamgir.productservice.service.implementations;

import csembstu.alamgir.productservice.dto.request.CreateProductRequest;
import csembstu.alamgir.productservice.dto.response.ProductResponse;
import csembstu.alamgir.productservice.entity.Product;
import csembstu.alamgir.productservice.exception.BadRequestException;
import csembstu.alamgir.productservice.exception.NotFoundException;
import csembstu.alamgir.productservice.repository.ProductRepository;
import csembstu.alamgir.productservice.service.abstractions.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductResponse mapToResponseHelper(Product newProduct){

        ProductResponse response=new ProductResponse();

        response.setId(newProduct.getId())
                .setName(newProduct.getName())
                .setDescription(newProduct.getDescription())
                .setPrice(newProduct.getPrice())
                .setStock(newProduct.getStock());
        return response;
    }



    //create product
    @Override
    public ProductResponse createProduct(CreateProductRequest request) {

       boolean existsProductsByName= productRepository.existsProductsByName(request.getName());
       if (existsProductsByName) throw new BadRequestException("Product "+request.getName()+" already exists!");

       Product newProduct= new Product();
       newProduct
                .setName(request.getName())
                .setDescription(request.getDescription())
                .setPrice(request.getPrice())
                .setStock(request.getStock());

       Product savedProduct=productRepository.save(newProduct);
       return  mapToResponseHelper(savedProduct);
    }




    //get all product
    @Override
    public List<ProductResponse> getProduct(){
        List<ProductResponse> responseList=new ArrayList<>();
        List<Product> products=productRepository.findAll();
        for(Product product:products){
            ProductResponse dto=mapToResponseHelper(product);
            responseList.add(dto);
        }
        return  responseList;
    }



    //get product by id
    @Override
    public ProductResponse getProductById(Long id){
       Product product=productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product does not exist: " + id));
       return mapToResponseHelper(product);

    }

    //update product
    @Override
    public  ProductResponse updateProduct(Long id,Integer quantity){

        Product product=productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product does not exist: " + id));
        if (product.getStock() < quantity) throw new BadRequestException("Insufficient stock for product id: " + id);

        product.setStock(product.getStock()-quantity);
        return mapToResponseHelper(productRepository.save(product));
    }

    // DELETE
    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) throw new NotFoundException("Product does not exist: " + id);
        productRepository.deleteById(id);
    }


}

