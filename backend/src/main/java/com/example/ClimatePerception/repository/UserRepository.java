package com.example.ClimatePerception.repository;

import com.example.ClimatePerception.model.User;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UserRepository implements IUserRepository {

    @Override
    public List<User> findAll() {
        return User.readUsersFromCsv();
    }

    @Override
    public User findByEmailAndPassword(String email, String password) {
        List<User> users = findAll();
        //BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        for (User user : users) {
            if (user.getEmail().equals(email)) {
                // Verifică potrivirea parolelor criptate
//                if (passwordEncoder.matches(password, user.getPassword())) {
//                    return user; // Găsit utilizatorul cu adresa de email și parola corespunzătoare
//                }
            }
        }

        return null; // Nu a fost găsit niciun utilizator cu adresa de email și parola furnizate
    }
}
