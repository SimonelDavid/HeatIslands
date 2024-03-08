package com.example.ClimatePerception;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Update the path according to your file system
        String htmlExportPath = "file:/app/heat_island/html_export/";
        String pdfExportPath = "file:/app/heat_island/pdf_export/";

        // Handler for HTML files
        registry.addResourceHandler("/heat_island/html_export/**")
                .addResourceLocations(htmlExportPath);

        // Handler for PDF files
        registry.addResourceHandler("/heat_island/pdf_export/**")
                .addResourceLocations(pdfExportPath);
    }
}
