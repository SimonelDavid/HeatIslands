package com.example.ClimatePerception.repository.csv;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class CSVWriter {
    public static void main(String[] args) {
        String csvFilePath = "src/main/resources/users.csv";

        // Definirea anteturilor pentru fișierul CSV
        List<String> headers = Arrays.asList("Email", "Password");

        // Exemplu de utilizatori
        List<List<String>> users = Arrays.asList(
                Arrays.asList("user1@primarie.com", "test"),
                Arrays.asList("user2@primarie.com", "test"),
                Arrays.asList("user3@primarie.com", "test"),
                Arrays.asList("test", "test")
        );

        try (FileWriter fileWriter = new FileWriter(csvFilePath);
             CSVPrinter csvPrinter = new CSVPrinter(fileWriter, CSVFormat.DEFAULT.withHeader(headers.toArray(new String[0])))) {

            for (List<String> user : users) {
                String email = user.get(0);
                String password = user.get(1);

                // Adăugare la listă și scriere în CSV
                List<String> userWithEncryptedPassword = Arrays.asList(email, password);
                csvPrinter.printRecord(userWithEncryptedPassword);
            }

            System.out.println("Fișierul CSV a fost creat cu parole criptate!");

        } catch (IOException e) {
            e.printStackTrace();
        }
        FileCsvHandler.readUsersFromCsv();

    }
}

