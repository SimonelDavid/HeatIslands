package com.example.ClimatePerception.model;

import com.example.ClimatePerception.repository.csv.FileCsvHandler;

import java.util.List;
import java.util.Objects;

public class User {
    private String email;
    private String password;


    public User() {
    }

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(email, user.email) && Objects.equals(password, user.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email, password);
    }

    @Override
    public String toString() {
        return "User{" +
                "email='" + email + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

    public static List<User> readUsersFromCsv() {
        return FileCsvHandler.readUsersFromCsv();
    }

}
