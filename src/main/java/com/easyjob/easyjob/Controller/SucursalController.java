package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.DTO.SucursalDTO;
import com.easyjob.easyjob.Service.SucursalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/sucursales")
public class SucursalController {

    @Autowired
    private SucursalService sucursalService;

    @GetMapping
    public ResponseEntity<List<SucursalDTO>> listarSucursales() {
        return ResponseEntity.ok(sucursalService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SucursalDTO> obtenerSucursal(@PathVariable Long id) {
        SucursalDTO dto = sucursalService.obtenerPorId(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<SucursalDTO> crearSucursal(@RequestBody SucursalDTO dto) {
        SucursalDTO creada = sucursalService.guardarSucursal(dto);
        return ResponseEntity.ok(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> actualizarSucursal(@PathVariable Long id, @RequestBody SucursalDTO dto) {
        boolean ok = sucursalService.actualizarSucursal(id, dto);
        return ok ? ResponseEntity.ok("Sucursal actualizada correctamente")
                  : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarSucursal(@PathVariable Long id) {
        boolean ok = sucursalService.eliminarSucursal(id);
        return ok ? ResponseEntity.ok("Sucursal eliminada correctamente")
                  : ResponseEntity.notFound().build();
    }
}
