package com.example.ClimatePerception;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AppController {
    @GetMapping(value = "/test/")
    public String getTest() {
        return "Successful test";
    }

}
