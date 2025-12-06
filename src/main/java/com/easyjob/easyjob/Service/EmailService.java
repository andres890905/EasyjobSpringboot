package com.easyjob.easyjob.Service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Value("${sendgrid.api-key}")
    private String apiKey;

    @Value("${sendgrid.sender}")
    private String sender;

    public String enviarIndividual(String para, String asunto, String mensaje) {
        return enviarCorreo(para, asunto, mensaje);
    }

    public String enviarMasivo(List<String> correos, String asunto, String mensaje) {
        int enviados = 0;
        int fallidos = 0;
        
        System.out.println("=== INICIANDO ENVÍO MASIVO ===");
        System.out.println("Total de correos a enviar: " + correos.size());
        
        for (int i = 0; i < correos.size(); i++) {
            String correo = correos.get(i);
            
            if (correo != null && !correo.isBlank()) {
                System.out.println("\n[" + (i + 1) + "/" + correos.size() + "] Enviando a: " + correo);
                
                String respuesta = enviarCorreo(correo, asunto, mensaje);
                
                if (respuesta.contains("202")) {
                    enviados++;
                    System.out.println("✅ Aceptado por SendGrid");
                } else {
                    fallidos++;
                    System.out.println("❌ Falló: " + respuesta);
                }
                
                // ⭐ PAUSA entre correos para evitar bloqueos
                if (i < correos.size() - 1) { // No pausar después del último
                    try {
                        System.out.println("⏳ Esperando 3 segundos...");
                        Thread.sleep(3000); // 3 segundos entre correos
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
        Email from = new Email(sender);
        Email to = new Email(para);
        Content content = new Content("text/plain", mensaje);
        Mail mail = new Mail(from, asunto, to, content);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            
            // 202 = Accepted (correo aceptado por SendGrid)
            if (response.getStatusCode() == 202) {
                return "Enviado! Status: 202";
            } else {
                return "Status: " + response.getStatusCode() + " - " + response.getBody();
            }
            
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}