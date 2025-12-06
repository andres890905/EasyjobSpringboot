package com.easyjob.easyjob.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BrevoEmailService {

    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();

    public String enviarIndividual(String para, String asunto, String mensaje) {
        return enviarCorreo(para, asunto, mensaje);
    }

    public String enviarMasivo(List<String> correos, String asunto, String mensaje) {
        int enviados = 0;
        int fallidos = 0;
        
        System.out.println("=== INICIANDO ENVÍO MASIVO VÍA BREVO ===");
        System.out.println("Remitente: " + senderEmail);
        System.out.println("Total de correos a enviar: " + correos.size());
        
        for (int i = 0; i < correos.size(); i++) {
            String correo = correos.get(i);
            
            if (correo != null && !correo.isBlank()) {
                System.out.println("\n[" + (i + 1) + "/" + correos.size() + "] Enviando a: " + correo);
                
                String respuesta = enviarCorreo(correo, asunto, mensaje);
                
                if (respuesta.startsWith("Enviado")) {
                    enviados++;
                    System.out.println("✅ Enviado correctamente");
                } else {
                    fallidos++;
                    System.out.println("❌ Falló: " + respuesta);
                }
                
                // Pausa entre correos (2 segundos, menos que SendGrid)
                if (i < correos.size() - 1) {
                    try {
                        System.out.println("⏳ Esperando 2 segundos...");
                        Thread.sleep(2000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        System.err.println("⚠️ Envío interrumpido");
                        break;
                    }
                }
            }
        }
        
        System.out.println("\n=== RESUMEN DE ENVÍO ===");
        System.out.println("✅ Enviados: " + enviados);
        System.out.println("❌ Fallidos: " + fallidos);
        System.out.println("📊 Total: " + correos.size());
        
        return String.format("Correos enviados: %d | Fallidos: %d | Total: %d", 
                           enviados, fallidos, correos.size());
    }

    private String enviarCorreo(String para, String asunto, String mensaje) {
        try {
            String url = "https://api.brevo.com/v3/smtp/email";
            
            // Construir el JSON manualmente para evitar dependencias extra
            String jsonBody = String.format("""
                {
                    "sender": {
                        "email": "%s",
                        "name": "%s"
                    },
                    "to": [
                        {
                            "email": "%s"
                        }
                    ],
                    "subject": "%s",
                    "htmlContent": "%s"
                }
                """,
                senderEmail,
                senderName,
                para,
                escaparJson(asunto),
                escaparJson(construirMensajeHTML(mensaje))
            );
            
            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);
            headers.set("accept", "application/json");
            
            // Request
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
            
            // Enviar
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.CREATED || 
                response.getStatusCode() == HttpStatus.OK) {
                return "Enviado correctamente a " + para;
            } else {
                return "Error: Status " + response.getStatusCode();
            }
            
        } catch (Exception e) {
            System.err.println("ERROR al enviar a " + para + ": " + e.getMessage());
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
    
    private String construirMensajeHTML(String mensajeOriginal) {
        return "<html>" +
               "<body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>" +
               "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
               "<h2 style='color: #2c3e50;'>Notificación EasyJob</h2>" +
               "<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
               "<p>" + mensajeOriginal.replace("\n", "<br>") + "</p>" +
               "</div>" +
               "<hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>" +
               "<p style='font-size: 12px; color: #666;'>" +
               "Este correo fue enviado desde EasyJob<br>" +
               "Si no deseas recibir más notificaciones, por favor contacta al administrador." +
               "</p>" +
               "</div>" +
               "</body>" +
               "</html>";
    }
    
    private String escaparJson(String texto) {
        if (texto == null) return "";
        return texto
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }
}