package com.microservice.userservice.user.service.abstraction;

import com.microservice.userservice.user.dto.request.LoginRequest;
import com.microservice.userservice.user.dto.request.RegistrationRequest;
import com.microservice.userservice.user.dto.response.LoginResponse;

public interface AuthService {

        public LoginResponse register(RegistrationRequest request) ;
        public LoginResponse login(LoginRequest request) ;
           
}
