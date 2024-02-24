package com.example.ClimatePerception.repository.csv;

import com.example.ClimatePerception.model.User;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class FileCsvHandler {
    public static String csvFilePath="src/main/resources/users.csv";
    public static List<User> readUsersFromCsv() {
        List<User> users = new ArrayList<>();

        try (FileReader fileReader = new FileReader(csvFilePath);
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            List<CSVRecord> records = csvParser.getRecords();

            for (CSVRecord record : records) {
                String email = record.get("Email");
                String password = record.get("Password");

                User user = new User(email, password);
                users.add(user);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return users;
    }
}
