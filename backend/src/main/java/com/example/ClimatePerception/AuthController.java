package com.example.ClimatePerception;

import com.example.ClimatePerception.repository.csv.FileCsvHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import com.example.ClimatePerception.model.User;

@RestController
@CrossOrigin(origins = "https://heat.island.aim-space.com")
public class AuthController {
    private final String csvFilePath = "src/main/resources/users.csv";

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (verifierAuthenticate(email, password)) {
            return ResponseEntity.ok("Authentication successful");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect login credentials");
        }
    }

    private boolean verifierAuthenticate(String username, String password) {
        List<User> users = FileCsvHandler.readUsersFromCsv();

        for (User user : users) {
            if (user.getEmail().equals(username) && user.getPassword().equals(password)) {
                return true;
            }
        }

        return false;
    }
}
