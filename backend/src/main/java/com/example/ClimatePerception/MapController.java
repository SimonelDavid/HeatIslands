package com.example.ClimatePerception;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://heat.island.aim-space.com")
public class MapController {

    private static final Logger log = LoggerFactory.getLogger(MapController.class);

    private Map<String, String> getStatsFromCSV(String city, Map<String, String> formData) {
        String fileNameCsv = String.format("%s_%s_%s_%s_%s_%s_city_heat_island_stats.csv", city, formData.get("startYear"), formData.get("endYear"), formData.get("startMonth"), formData.get("endMonth"), formData.get("type"));
        String filePath = "heat_island/csv_export/stats/" + fileNameCsv;

        Map<String, String> stats = new HashMap<>();

        try (BufferedReader br = new BufferedReader(new FileReader(filePath, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 2) {
                    stats.put(parts[0], parts[1]);
                }
            }
        } catch (IOException e) {
            log.error("Error reading CSV file", e);
        }

        return stats;
    }

    @PostMapping(value = "/showMap", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> showMap(@RequestBody Map<String, String> formData) {

        log.info("Received request for showMap with data: " + formData);

        String city = formData.get("cityName");
        String type = formData.get("type");
        String fileName = String.format("%s_%s_%s_%s_%s_%s.html", city, formData.get("startYear"), formData.get("endYear"), formData.get("startMonth"), formData.get("endMonth"), type);

        System.out.println(fileName);

        if (checkIfHtmlFileExists(fileName)) {
            String mapUrl = generateMapUrl(fileName);
            System.out.println(mapUrl);
            return ResponseEntity.ok(Map.of("map_url", mapUrl));
        }

        runHeatIslandScript(city, formData.get("startYear"), formData.get("endYear"), formData.get("startMonth"), formData.get("endMonth"), type);

        // Wait for the file to be created by the Python script, with a timeout of 60 seconds
        boolean fileReady = waitForFile("heat_island/html_export/" + fileName, 120);

        if (!fileReady) {
            log.error("File was not created within the expected time.");
            // Handle the error condition, perhaps by returning an error response
        }

        String mapUrl = generateMapUrl(fileName);
        System.out.println(mapUrl);
        Map<String, String> stats = getStatsFromCSV(city, formData);
        return ResponseEntity.ok(Map.of("map_url", mapUrl, stats));

    }

    @PostMapping(value = "/generatePDF", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> generatePDF(@RequestBody Map<String, String> formData) {

        log.info("Received request for generatePDF with data: " + formData);

        String city = formData.get("cityName");
        String type = formData.get("type");
        String fileName = String.format("%s_%s_%s_%s_%s_%s.pdf", city, formData.get("startYear"), formData.get("endYear"), formData.get("startMonth"), formData.get("endMonth"), type);

        if (checkIfPdfFileExists(fileName)) {
            String pdfUrl = generatePDFUrl(fileName);
            System.out.println(pdfUrl);
            System.out.println("PDF already found");
            System.out.println(fileName);
            boolean fileReady = waitForFile("heat_island/pdf_export/" + fileName, 120);
            System.out.println(fileReady);
            if (!fileReady) {
                log.error("File was not created within the expected time.");
                // Handle the error condition, perhaps by returning an error response
            }
            return ResponseEntity.ok(Map.of("pdf_url", pdfUrl));
        }

        runPDFGeneratorScript(city, formData.get("startYear"), formData.get("endYear"), formData.get("startMonth"), formData.get("endMonth"), type);

        // Wait for the file to be created by the Python script, with a timeout of 60 seconds
        boolean fileReady = waitForFile("heat_island/pdf_export/" + fileName, 120);

        System.out.println(fileReady);
        System.out.println(fileName);

        if (!fileReady) {
            log.error("File was not created within the expected time.");
            // Handle the error condition, perhaps by returning an error response
        }

        String pdfUrl = generatePDFUrl(fileName);
        System.out.println(pdfUrl);
        return ResponseEntity.ok(Map.of("pdf_url", pdfUrl));

    }

    @GetMapping("/pdf_export/{fileName:.+}")
    public ResponseEntity<byte[]> getPdfFile(@PathVariable String fileName) {
        try {
            String filePath = "heat_island/pdf_export/" + fileName;
            Path file = Paths.get(filePath);
            if (!Files.exists(file)) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(file);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("inline").filename(fileName).build());
            return ResponseEntity.ok().headers(headers).body(fileContent);
        } catch (IOException e) {
            log.error("Error reading PDF file", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private boolean waitForFile(String filePath, int timeoutInSeconds) {
        File file = new File(filePath);
        long endTime = System.currentTimeMillis() + timeoutInSeconds * 1000;
        while (System.currentTimeMillis() < endTime) {
            if (file.exists()) {
                return true; // File exists
            }
            try {
                Thread.sleep(1000); // Wait for 1 second before checking again
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false; // Thread was interrupted
            }
        }
        return false; // Timeout reached and file does not exist
    }

    private void runHeatIslandScript(String city, String startYear, String endYear, String startMonth, String endMonth, String type) {
        try {
            String scriptPath = "heat_island/gee_export.py";
            ProcessBuilder processBuilder = new ProcessBuilder("python3", scriptPath, city, startYear, endYear, startMonth, endMonth, type);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // Read the output of the script
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                log.info(line);
            }

            int exitCode = process.waitFor();
            log.info("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            log.error("Error running Python script", e);
        }
    }

    private void runPDFGeneratorScript(String city, String startYear, String endYear, String startMonth, String endMonth, String type) {
        try {
            String scriptPath = "heat_island/pdf_generator.py";
            ProcessBuilder processBuilder = new ProcessBuilder("python3", scriptPath, city, startYear, endYear, startMonth, endMonth, type);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // Read the output of the script
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                log.info(line);
            }

            int exitCode = process.waitFor();
            log.info("Exited with code: " + exitCode);
        } catch (IOException | InterruptedException e) {
            log.error("Error running Python script", e);
        }
    }

    private String generateMapUrl(String fileName) {
        return "https://heat.island.aim-space.com/heat_island/html_export/" + fileName;
    }

    private String generatePDFUrl(String fileName) {
        return "https://heat.island.aim-space.com/heat_island/pdf_export/" + fileName;
    }

    private void saveFile(String fileName, String generatedHtml) {
    }

//    private String generateMap(Map<String, String> formData) {
//    }

    private String loadFileContent(String fileName) {
        String filePath = "heat_island/html_export/" + fileName;
        Path path = Paths.get(filePath);

        try {
            byte[] fileBytes = Files.readAllBytes(path);
            return new String(fileBytes);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private boolean checkIfHtmlFileExists(String fileName) {
        String filePath = "heat_island/html_export/" + fileName;
        File file = new File(filePath);
        return file.exists();
    }

    private boolean checkIfPdfFileExists(String fileName) {
        String filePath = "heat_island/pdf_export/" + fileName;
        File file = new File(filePath);
        return file.exists();
    }
}
