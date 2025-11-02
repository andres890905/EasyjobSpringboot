package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Model.Zona;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.Service.ZonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/zonas")
public class ZonaController {

    @Autowired
    private ZonaService zonaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ✅ 1. Listar todas las zonas
    @GetMapping
    public ResponseEntity<List<Zona>> listarZonas() {
        List<Zona> zonas = zonaService.obtenerTodas();
        return ResponseEntity.ok(zonas);
    }

    // ✅ 2. Obtener una zona por ID
    @GetMapping("/{id}")
    public ResponseEntity<Zona> obtenerZona(@PathVariable Integer id) {
        Zona zona = zonaService.obtenerPorId(id);
        if (zona != null) {
            return ResponseEntity.ok(zona);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ 3. Crear nueva zona
    @PostMapping
    public ResponseEntity<?> crearZona(@RequestBody Map<String, Object> request) {
        try {
            String nombreZona = (String) request.get("nombreZona");
            
            // Manejar tanto Integer como String del JSON y convertir a Long
            Long supervisorId = null;
            Object supervisorIdObj = request.get("idusuarios");
            if (supervisorIdObj instanceof Integer) {
                supervisorId = ((Integer) supervisorIdObj).longValue();
            } else if (supervisorIdObj instanceof Long) {
                supervisorId = (Long) supervisorIdObj;
            } else if (supervisorIdObj instanceof String) {
                supervisorId = Long.parseLong((String) supervisorIdObj);
            }

            if (nombreZona == null || nombreZona.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre de la zona es obligatorio");
            }

            if (supervisorId == null) {
                return ResponseEntity.badRequest().body("El supervisor es obligatorio");
            }

            // Buscar el supervisor
            Optional<Usuario> supervisorOpt = usuarioRepository.findById(supervisorId);
            if (supervisorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Supervisor no encontrado");
            }

            Usuario supervisor = supervisorOpt.get();

            // Validar que sea supervisor (sin importar mayúsculas/minúsculas)
            if (supervisor.getRol() == null || 
                !supervisor.getRol().getTipo_rol().toUpperCase().contains("SUPERVISOR")) {
                return ResponseEntity.badRequest().body("El usuario seleccionado no es un supervisor");
            }

            // Crear zona
            Zona zona = new Zona();
            zona.setNombreZona(nombreZona.trim());
            zona.setSupervisor(supervisor);

            Zona zonaNueva = zonaService.guardarZona(zona);
            return ResponseEntity.ok(zonaNueva);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al crear la zona: " + e.getMessage());
        }
    }

    // ✅ 4. Editar zona existente
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarZona(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            String nombreZona = (String) request.get("nombreZona");
            
            // Manejar tanto Integer como String del JSON
            Integer supervisorId = null;
            Object supervisorIdObj = request.get("idusuarios");
            if (supervisorIdObj instanceof Integer) {
                supervisorId = (Integer) supervisorIdObj;
            } else if (supervisorIdObj instanceof String) {
                supervisorId = Integer.parseInt((String) supervisorIdObj);
            }

            Zona zonaActualizada = new Zona();
            
            if (nombreZona != null && !nombreZona.trim().isEmpty()) {
                zonaActualizada.setNombreZona(nombreZona.trim());
            }

            if (supervisorId != null) {
                Optional<Usuario> supervisorOpt = usuarioRepository.findById(Long.valueOf(supervisorId));
                if (supervisorOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Supervisor no encontrado");
                }

                Usuario supervisor = supervisorOpt.get();

                // Validar que sea supervisor
                if (supervisor.getRol() == null || 
                    !supervisor.getRol().getTipo_rol().toUpperCase().contains("SUPERVISOR")) {
                    return ResponseEntity.badRequest().body("El usuario seleccionado no es un supervisor");
                }

                zonaActualizada.setSupervisor(supervisor);
            }

            boolean actualizada = zonaService.actualizarZona(id, zonaActualizada);
            if (actualizada) {
                return ResponseEntity.ok("Zona actualizada correctamente");
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar la zona: " + e.getMessage());
        }
    }

    // ✅ 5. Eliminar zona
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarZona(@PathVariable Integer id) {
        boolean eliminada = zonaService.eliminarZona(id);
        if (eliminada) {
            return ResponseEntity.ok("Zona eliminada correctamente");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ 6. Buscar zonas por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<Zona>> buscarZonas(@RequestParam String nombre) {
        List<Zona> zonas = zonaService.buscarPorNombre(nombre);
        return ResponseEntity.ok(zonas);
    }

    // ✅ 7. Buscar zonas por supervisor
    @GetMapping("/supervisor/{supervisorId}")
    public ResponseEntity<List<Zona>> zonasPorSupervisor(@PathVariable Integer supervisorId) {
        List<Zona> zonas = zonaService.buscarPorSupervisor(supervisorId);
        return ResponseEntity.ok(zonas);
    }

    // ✅ 8. Asignar supervisor a zona
    @PutMapping("/{zonaId}/asignar-supervisor/{supervisorId}")
    public ResponseEntity<?> asignarSupervisor(
            @PathVariable Integer zonaId, 
            @PathVariable Integer supervisorId) {
        try {
            Zona zona = zonaService.asignarSupervisor(zonaId, Long.valueOf(supervisorId));
            return ResponseEntity.ok(zona);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}