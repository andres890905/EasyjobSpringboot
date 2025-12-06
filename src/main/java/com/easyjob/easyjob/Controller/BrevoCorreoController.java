package com.easyjob.easyjob.Controller;

import org.springframework.web.bind.annotation.*;

import com.easyjob.easyjob.Service.BrevoEmailService;
import com.easyjob.easyjob.Service.SucursalEmailService;

import java.util.List;

@RestController
@RequestMapping("/brevo-correo-sucursales")
public class BrevoCorreoController {

    private final BrevoEmailService brevoEmailService;
    private final SucursalEmailService sucursalEmailService;

    public BrevoCorreoController(BrevoEmailService brevoEmailService, SucursalEmailService sucursalEmailService) {
        this.brevoEmailService = brevoEmailService;
        this.sucursalEmailService = sucursalEmailService;
    }

    // ✓ Enviar correo a UNA sucursal
    @PostMapping("/enviar/{idSucursal}")
    public String enviarIndividual(
            @PathVariable Long idSucursal,
            @RequestParam String asunto,
            @RequestParam String mensaje) {

        String correo = sucursalEmailService.obtenerCorreoPorId(idSucursal);
        return brevoEmailService.enviarIndividual(correo, asunto, mensaje);
    }

    // ✓ Enviar correo a TODAS las sucursales
    @PostMapping("/enviar-todas")
    public String enviarMasivo(
            @RequestParam String asunto,
            @RequestParam String mensaje) {

        List<String> correos = sucursalEmailService.obtenerCorreosSucursales();
        return brevoEmailService.enviarMasivo(correos, asunto, mensaje);
    }
}