package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.DTO.SucursalDTO;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SucursalEmailService {

    private final SucursalService sucursalService;

    public SucursalEmailService(SucursalService sucursalService) {
        this.sucursalService = sucursalService;
    }

    // ✔ Obtener correos de todas las sucursales
    public List<String> obtenerCorreosSucursales() {
        return sucursalService.obtenerTodas() // ESTE es tu método correcto
                .stream()
                .map(SucursalDTO::getCorreo)
                .filter(correo -> correo != null && !correo.isEmpty())
                .toList();
    }

    // ✔ Obtener correo por ID
    public String obtenerCorreoPorId(Long idSucursal) {
        SucursalDTO sucursal = sucursalService.obtenerPorId(idSucursal);
        if (sucursal == null) {
            return null;
        }
        return sucursal.getCorreo();
    }
}
