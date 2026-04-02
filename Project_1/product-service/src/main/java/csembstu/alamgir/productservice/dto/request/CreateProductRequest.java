package csembstu.alamgir.productservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)

public class CreateProductRequest {

    @NotBlank(message = "Name is required") private String name;
    @NotBlank(message = "Description is required") private String description;
    @NotNull(message  = "Price is required") private Double price;
    @NotNull(message  = "Stock is required") private Integer stock;
}
