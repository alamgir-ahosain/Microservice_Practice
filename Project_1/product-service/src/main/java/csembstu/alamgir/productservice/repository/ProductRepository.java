package csembstu.alamgir.productservice.repository;

import csembstu.alamgir.productservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ProductRepository extends JpaRepository<Product,Long> {
    boolean existsProductsByName(String name);
}
