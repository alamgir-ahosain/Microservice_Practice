package csembstu.alamgir.productservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProductServiceApplication {

	public static void main(String[] args) {
//		EnvConfig.loadEnv();
		SpringApplication.run(ProductServiceApplication.class, args);
	}

}
