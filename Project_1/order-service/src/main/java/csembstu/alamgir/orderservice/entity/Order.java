package csembstu.alamgir.orderservice.entity;


import jakarta.persistence.*;
import lombok.Data;
import lombok.experimental.Accessors;

@Table(name="orders")
@Entity
@Data
@Accessors(chain = true)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;// plain number, NOT a DB foreign key
    private Integer quantity;
    private String status;// PENDING, CONFIRMED, CANCELLED

}
