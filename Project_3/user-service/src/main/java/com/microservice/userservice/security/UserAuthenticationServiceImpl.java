package com.microservice.userservice.security;


import com.microservice.userservice.user.entity.User;
import com.microservice.userservice.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;



@Service
public class UserAuthenticationServiceImpl implements UserDetailsService {

    Logger logger = LoggerFactory.getLogger(UserAuthenticationServiceImpl.class);

    @Autowired
    UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("UserAuthenticationServiceImpl : loading data from DB of username  : "+username);
        User user = repository.findByEmail(username);
        if (user == null) {
            logger.info("UserAuthenticationServiceImpl : username is not found in DB");
            throw new UsernameNotFoundException("Invalid User Name : "+username);

        }
        return user;
    }

}