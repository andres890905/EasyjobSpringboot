package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.DTO.VacacionDTO;
import com.easyjob.easyjob.Service.VacacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacaciones")
@CrossOrigin("*")
public class VacacionController {

    private final VacacionService vacacionService;

    public VacacionController(VacacionService vacacionService) {
        this.vacacionService = vacacionService;
    }

    // ====================================================
    // Obtener todas las vacaciones (DEBE IR PRIMERO)
    // ====================================================
    @GetMapping("/todas")
    public ResponseEntity<List<VacacionDTO>> obtenerTodas() {
        return ResponseEntity.ok(vacacionService.obtenerTodas());
    }

    // ====================================================
    // Crear solicitud de vacaciones
    // ====================================================
    @PostMapping("/crear")
    public ResponseEntity<VacacionDTO> crearVacacion(@RequestBody VacacionDTO dto) {
        return ResponseEntity.ok(vacacionService.crearVacacion(dto));
    }

    // ====================================================
    // Obtener por ID
    // ====================================================
    @GetMapping("/{id}")
    public ResponseEntity<VacacionDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vacacionService.obtenerPorId(id));
    }

    // ====================================================
    // Obtener por usuario
    // ====================================================
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<VacacionDTO>> obtenerPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(vacacionService.obtenerPorUsuario(idUsuario));
    }

    // ====================================================
    // Obtener por estado
    // ====================================================
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<VacacionDTO>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(vacacionService.obtenerPorEstado(estado));
    }

    // ====================================================
    // Actualizar solicitud
    // ====================================================
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<VacacionDTO> actualizarVacacion(
            @PathVariable Long id,
            @RequestBody VacacionDTO dto) {

        return ResponseEntity.ok(vacacionService.actualizarVacacion(id, dto));
    }

    // ====================================================
    // Cambiar estado (Aprobado / Rechazado / Pendiente)
    // ====================================================
    @PutMapping("/{id}/estado")
    public ResponseEntity<VacacionDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {

        return ResponseEntity.ok(vacacionService.cambiarEstado(id, estado));
    }

    // ====================================================
    // Obtener vacaciones por zona del supervisor
    // ====================================================
    @GetMapping("/zona/{idSupervisor}")
    public ResponseEntity<List<VacacionDTO>> obtenerPorZonaSupervisor(@PathVariable Integer idSupervisor) {
        return ResponseEntity.ok(vacacionService.obtenerPorZonaSupervisor(idSupervisor));
    }

    // ====================================================
    // Eliminar
    // ====================================================
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarVacacion(@PathVariable Long id) {
        vacacionService.eliminarVacacion(id);
        return ResponseEntity.ok("Solicitud de vacaciones eliminada correctamente");
    }
}
