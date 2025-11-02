package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.Model.Sucursal;
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

    // ✅ 1. Listar todas las sucursales
    @GetMapping
    public ResponseEntity<List<Sucursal>> listarSucursales() {
        List<Sucursal> sucursales = sucursalService.obtenerTodas();
        return ResponseEntity.ok(sucursales);
    }

    // ✅ 2. Obtener una sucursal por ID (Cambiado de int a Long)
    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> obtenerSucursal(@PathVariable Long id) {
        Sucursal sucursal = sucursalService.obtenerPorId(id);
        if (sucursal != null) {
            return ResponseEntity.ok(sucursal);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ 3. Crear nueva sucursal
    @PostMapping
    public ResponseEntity<String> crearSucursal(@RequestBody Sucursal sucursal) {
        sucursalService.guardarSucursal(sucursal);
        return ResponseEntity.ok("Sucursal creada correctamente");
    }

    // ✅ 4. Editar sucursal existente (Cambiado de int a Long)
    @PutMapping("/{id}")
    public ResponseEntity<String> actualizarSucursal(@PathVariable Long id, @RequestBody Sucursal sucursalActualizada) {
        boolean actualizada = sucursalService.actualizarSucursal(id, sucursalActualizada);
        if (actualizada) {
            return ResponseEntity.ok("Sucursal actualizada correctamente");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ 5. Eliminar sucursal (Cambiado de int a Long)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarSucursal(@PathVariable Long id) {
        boolean eliminada = sucursalService.eliminarSucursal(id);
        if (eliminada) {
            return ResponseEntity.ok("Sucursal eliminada correctamente");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}