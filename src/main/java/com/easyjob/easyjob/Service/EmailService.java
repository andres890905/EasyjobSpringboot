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
        for (String correo : correos) {
            if (correo != null && !correo.isBlank()) {
                String respuesta = enviarCorreo(correo, asunto, mensaje);
                if (respuesta.startsWith("Enviado")) enviados++;
            }
        }
        return "Correos enviados: " + enviados + " de " + correos.size();
    }

    private String enviarCorreo(String para, String asunto, String mensaje) {
        Email from = new Email("andressin007@outlook.com");
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

            return "Enviado! Status: " + response.getStatusCode();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
