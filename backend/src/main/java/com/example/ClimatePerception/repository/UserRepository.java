package com.example.ClimatePerception.repository;

import com.example.ClimatePerception.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByEmailAndPassword(String email, String password);

    List<User> findAll();
}
