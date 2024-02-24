package com.example.ClimatePerception.repository;

import com.example.ClimatePerception.model.User;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUserRepository {
    User findByEmailAndPassword(String email, String password);

    List<User> findAll();
}
