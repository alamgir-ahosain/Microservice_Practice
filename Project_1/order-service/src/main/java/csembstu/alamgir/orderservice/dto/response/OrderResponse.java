package csembstu.alamgir.orderservice.dto.response;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class OrderResponse {

    private Long id;
    private Long productId;// plain number, NOT a DB foreign key
    private Integer quantity;
    private String status;// PENDING, CONFIRMED, CANCELLED
}
