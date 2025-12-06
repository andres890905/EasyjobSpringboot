package com.easyjob.easyjob.Controller;


import com.easyjob.easyjob.DTO.IncapacidadDTO;
import com.easyjob.easyjob.Service.IncapacidadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/incapacidades")
public class IncapacidadController {

    private final IncapacidadService incapacidadService;

    public IncapacidadController(IncapacidadService incapacidadService) {
        this.incapacidadService = incapacidadService;
    }

    // ============================
    // LISTAR TODAS
    // ============================
    @GetMapping
    public ResponseEntity<List<IncapacidadDTO>> listar() {
        return ResponseEntity.ok(incapacidadService.listarIncapacidades());
    }

    // ============================
    // OBTENER POR ID
    // ============================
    @GetMapping("/{id}")
    public ResponseEntity<IncapacidadDTO> obtenerPorId(@PathVariable String id) {
        return ResponseEntity.ok(incapacidadService.obtenerPorId(id));
    }

    // ============================
    // LISTAR POR USUARIO
    // ============================
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<IncapacidadDTO>> buscarPorUsuario(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(incapacidadService.buscarPorUsuario(idUsuario));
    }

    // ============================
    // CREAR INCAPACIDAD
    // ============================
    @PostMapping
    public ResponseEntity<IncapacidadDTO> guardar(@RequestBody IncapacidadDTO dto) {
        return ResponseEntity.ok(incapacidadService.guardarIncapacidad(dto));
    }

    // ============================
    // ACTUALIZAR INCAPACIDAD
    // ============================
    @PutMapping("/{id}")
    public ResponseEntity<IncapacidadDTO> actualizar(
            @PathVariable String id,
            @RequestBody IncapacidadDTO dto) {
        return ResponseEntity.ok(incapacidadService.actualizarIncapacidad(id, dto));
    }

    // ============================
    // ELIMINAR INCAPACIDAD
    // ============================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        incapacidadService.eliminarIncapacidad(id);
        return ResponseEntity.noContent().build();
    }

    // ======================================================
    //    ENDPOINTS DE ESTADO: aprobar / rechazar / pendiente
    // ======================================================

    // APROBAR
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<IncapacidadDTO> aprobar(@PathVariable String id) {
        IncapacidadDTO dto = new IncapacidadDTO();
        dto.setEstado("APROBADA");
        return ResponseEntity.ok(incapacidadService.actualizarIncapacidad(id, dto));
    }

    // RECHAZAR
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<IncapacidadDTO> rechazar(
            @PathVariable String id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        IncapacidadDTO dto = new IncapacidadDTO();
        dto.setEstado("RECHAZADA");
        if (body != null && body.containsKey("motivo")) {
            dto.setMotivo(body.get("motivo"));
        }
        return ResponseEntity.ok(incapacidadService.actualizarIncapacidad(id, dto));
    }

    // MARCAR COMO PENDIENTE
    @PutMapping("/{id}/pendiente")
    public ResponseEntity<IncapacidadDTO> marcarPendiente(@PathVariable String id) {
        IncapacidadDTO dto = new IncapacidadDTO();
        dto.setEstado("PENDIENTE");
        return ResponseEntity.ok(incapacidadService.actualizarIncapacidad(id, dto));
    }

    // ============================
    // CREAR INCAPACIDAD CON ARCHIVO
    // ============================
    @PostMapping("/upload")
    public ResponseEntity<IncapacidadDTO> guardarConArchivo(
            @RequestParam Integer idusuarios,
            @RequestParam String nombreEmpleado,
            @RequestParam String nombreEps,
            @RequestParam String tipo,
            @RequestParam String motivo,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin,
            @RequestParam String estado,
            @RequestParam(required = false) MultipartFile archivoSoporte) {
        
        try {
            // Crear DTO con los datos recibidos
            IncapacidadDTO dto = new IncapacidadDTO();
            dto.setIdusuarios(idusuarios);
            dto.setNombreEmpleado(nombreEmpleado);
            dto.setNombreEps(nombreEps);
            dto.setTipo(tipo);
            dto.setMotivo(motivo);
            dto.setFechaInicio(fechaInicio);
            dto.setFechaFin(fechaFin);
            dto.setEstado(estado);
            
            // Si hay archivo, procesarlo
            if (archivoSoporte != null && !archivoSoporte.isEmpty()) {
                String nombreArchivo = incapacidadService.guardarArchivo(archivoSoporte);
                dto.setArchivoSoporte(nombreArchivo);
            }
            
            // Guardar la incapacidad
            return ResponseEntity.ok(incapacidadService.guardarIncapacidad(dto));
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar incapacidad con archivo: " + e.getMessage());
        }
    }
    
 // ============================
 // LISTAR POR ZONA DEL SUPERVISOR
 // ============================
 @GetMapping("/zona/{idSupervisor}")
 public ResponseEntity<List<IncapacidadDTO>> listarPorZonaSupervisor(@PathVariable Integer idSupervisor) {
     return ResponseEntity.ok(incapacidadService.listarPorZonaSupervisor(idSupervisor));
 }

 // ============================
 // DESCARGAR ARCHIVO DE INCAPACIDAD
 // ============================
 @GetMapping("/archivo/{nombreArchivo}")
 public ResponseEntity<byte[]> descargarArchivo(@PathVariable String nombreArchivo) {
     try {
         byte[] contenido = incapacidadService.obtenerArchivo(nombreArchivo);
         
         // Determinar tipo de contenido basado en extensión
         String contentType = "application/octet-stream";
         if (nombreArchivo.toLowerCase().endsWith(".pdf")) {
             contentType = "application/pdf";
         } else if (nombreArchivo.toLowerCase().endsWith(".jpg") || 
                   nombreArchivo.toLowerCase().endsWith(".jpeg")) {
             contentType = "image/jpeg";
         } else if (nombreArchivo.toLowerCase().endsWith(".png")) {
             contentType = "image/png";
         }
         
         return ResponseEntity.ok()
                 .header("Content-Type", contentType)
                 .header("Content-Disposition", "attachment; filename=\"" + nombreArchivo + "\"")
                 .body(contenido);
     } catch (Exception e) {
         return ResponseEntity.status(404).build();
     }
 }
}
