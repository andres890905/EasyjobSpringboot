package com.easyjob.easyjob.Controller;


import org.springframework.web.bind.annotation.*;

import com.easyjob.easyjob.Service.EmailService;
import com.easyjob.easyjob.Service.SucursalEmailService;

import java.util.List;

@RestController
@RequestMapping("/correo-sucursales")
public class CorreoSucursalController {

    private final EmailService emailService;
    private final SucursalEmailService sucursalEmailService;

    public CorreoSucursalController(EmailService emailService, SucursalEmailService sucursalEmailService) {
        this.emailService = emailService;
        this.sucursalEmailService = sucursalEmailService;
    }

    // ✔ Enviar correo a UNA sucursal
    @PostMapping("/enviar/{idSucursal}")
    public String enviarIndividual(
            @PathVariable Long idSucursal,
            @RequestParam String asunto,
            @RequestParam String mensaje) {

        String correo = sucursalEmailService.obtenerCorreoPorId(idSucursal);
        return emailService.enviarIndividual(correo, asunto, mensaje);
    }

    // ✔ Enviar correo a TODAS las sucursales
    @PostMapping("/enviar-todas")
    public String enviarMasivo(
            @RequestParam String asunto,
            @RequestParam String mensaje) {

        List<String> correos = sucursalEmailService.obtenerCorreosSucursales();
        return emailService.enviarMasivo(correos, asunto, mensaje);
    }
}
