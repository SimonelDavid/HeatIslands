package com.example.ClimatePerception.config;

import com.example.ClimatePerception.model.User;
import com.example.ClimatePerception.repository.IUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserDataLoader {

    @Bean
    CommandLineRunner initDatabase(IUserRepository userRepository) {
        return args -> {
            // Load initial users if the collection is empty
            if (userRepository.count() == 0) {
                userRepository.save(new User("admin@example.com", "adminpassword"));
                userRepository.save(new User("user@example.com", "userpassword"));
                // Add more users as needed
            }
        };
    }
}
