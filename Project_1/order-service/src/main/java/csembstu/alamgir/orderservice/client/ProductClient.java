package csembstu.alamgir.orderservice.client;


import csembstu.alamgir.orderservice.dto.response.ProductResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class ProductClient {

    private  final RestTemplate restTemplate;
    private  final String productServiceUrl;

    public ProductClient(@Value("${product.service.url}") String url) {
        this.restTemplate = new RestTemplate();
        this.productServiceUrl = url;
    }




    public  boolean isProductExist(Long productId){
        try {
            restTemplate.getForObject(productServiceUrl+"/api/product/"+productId, Object.class);
            return  true;
        }
        catch (Exception e){
            return  false;
        }
    }




    public  boolean isStockAvailable(Long productId,Integer quantity){
        try {
            ProductResponse response= restTemplate.getForObject(
                    productServiceUrl+"/api/product/"+productId,
                    ProductResponse.class);

            if (response != null && response.getStock() != null && quantity <= response.getStock()) {
                log.info("Entering IF block...");

                //isStockAvaiable then update the product
                ProductResponse response1 = restTemplate.exchange(
                        productServiceUrl + "/api/product/" + productId + "/update-stock?quantity=" + quantity,
                        HttpMethod.PUT,
                        null,
                        ProductResponse.class
                ).getBody();

                log.info("Response after update:" + response1);
                return true;
            }
            return false;
        }
        catch (Exception e){
            return  false;
        }
    }


}
