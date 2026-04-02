package csembstu.alamgir.productservice.service.abstractions;

import csembstu.alamgir.productservice.dto.request.CreateProductRequest;
import csembstu.alamgir.productservice.dto.response.ProductResponse;
import csembstu.alamgir.productservice.entity.Product;

import java.util.List;

public interface ProductService {

    public ProductResponse mapToResponseHelper(Product newProduct);
    public ProductResponse createProduct(CreateProductRequest request);
    public List<ProductResponse> getProduct();
    public ProductResponse getProductById(Long id);
    public  ProductResponse updateProduct(Long id,Integer quantity);
    public void deleteProduct(Long id);
}
