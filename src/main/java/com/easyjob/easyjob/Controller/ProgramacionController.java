package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.DTO.ProgramacionDTO;
import com.easyjob.easyjob.Model.Programacion;
import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.Service.ProgramacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/programacion")
@CrossOrigin(origins = "*") // Permite peticiones desde cualquier frontend
public class ProgramacionController {

    @Autowired
    private ProgramacionService programacionService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ===================== GUARDAR O ACTUALIZAR =====================
    @PostMapping("/guardar")
    public ResponseEntity<?> guardarProgramacion(@RequestBody ProgramacionDTO dto) {
        try {
            // Buscar empleado y supervisor en la BD
            Optional<Usuario> empleado = usuarioRepository.findById(dto.getIdUsuario());
            Optional<Usuario> supervisor = usuarioRepository.findById(dto.getIdSupervisor());

            if (empleado.isEmpty() || supervisor.isEmpty()) {
                return ResponseEntity.badRequest().body("Empleado o Supervisor no encontrados.");
            }

            // Crear entidad Programacion
            Programacion programacion = new Programacion();
            programacion.setIdProgramacion(dto.getIdProgramacion());
            programacion.setUsuario(empleado.get());
            programacion.setSupervisor(supervisor.get());
            programacion.setFecha(dto.getFecha());
            programacion.setHoraEntrada(dto.getHoraEntrada());
            programacion.setHoraSalida(dto.getHoraSalida());
            programacion.setHorasExtra(dto.getHorasExtra());
            programacion.setEsDescanso(dto.getEsDescanso());
            programacion.setEsDominical(dto.getEsDominical());
            programacion.setDescripcion(dto.getDescripcion());

            // Guardar en base de datos
            Programacion nueva = programacionService.guardar(programacion);
            return ResponseEntity.ok(nueva);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al guardar la programación: " + e.getMessage());
        }
    }
 // ===================== ACTUALIZAR =====================
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarProgramacion(@PathVariable Long id, @RequestBody ProgramacionDTO dto) {
        try {
            // Verificar que la programación existe
            Optional<Programacion> programacionExistente = programacionService.buscarPorId(id);
            if (programacionExistente.isEmpty()) {
                return ResponseEntity.badRequest().body("Programación no encontrada");
            }

            // Buscar empleado y supervisor
            Optional<Usuario> empleado = usuarioRepository.findById(dto.getIdUsuario());
            Optional<Usuario> supervisor = usuarioRepository.findById(dto.getIdSupervisor());

            if (empleado.isEmpty() || supervisor.isEmpty()) {
                return ResponseEntity.badRequest().body("Empleado o Supervisor no encontrados.");
            }

            // Actualizar la programación existente
            Programacion programacion = programacionExistente.get();
            programacion.setUsuario(empleado.get());
            programacion.setSupervisor(supervisor.get());
            programacion.setFecha(dto.getFecha());
            programacion.setHoraEntrada(dto.getHoraEntrada());
            programacion.setHoraSalida(dto.getHoraSalida());
            programacion.setHorasExtra(dto.getHorasExtra());
            programacion.setEsDescanso(dto.getEsDescanso());
            programacion.setEsDominical(dto.getEsDominical());
            programacion.setDescripcion(dto.getDescripcion());

            // Guardar cambios
            Programacion actualizada = programacionService.guardar(programacion);
            return ResponseEntity.ok(actualizada);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al actualizar la programación: " + e.getMessage());
        }
    }
    // ===================== LISTAR TODAS =====================
    @GetMapping("/listar")
    public ResponseEntity<List<Programacion>> listarProgramaciones() {
        return ResponseEntity.ok(programacionService.listarTodas());
    }

    // ===================== OBTENER POR ID =====================
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        Optional<Programacion> programacion = programacionService.buscarPorId(id);

        if (programacion.isPresent()) {
            return ResponseEntity.ok(programacion.get());
        } else {
            return ResponseEntity.badRequest().body("Programación no encontrada");
        }
    }

    // ===================== ELIMINAR =====================
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarProgramacion(@PathVariable Long id) {
        try {
            programacionService.eliminar(id);
            return ResponseEntity.ok("Programación eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al eliminar: " + e.getMessage());
        }
    }

    // ===================== LISTAR POR EMPLEADO =====================
    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<Programacion>> listarPorEmpleado(@PathVariable Long idEmpleado) {
        List<Programacion> lista = programacionService.listarPorEmpleado(idEmpleado);
        return ResponseEntity.ok(lista);
    }

    // ===================== LISTAR POR SUPERVISOR =====================
    @GetMapping("/supervisor/{idSupervisor}")
    public ResponseEntity<List<Programacion>> listarPorSupervisor(@PathVariable Long idSupervisor) {
        List<Programacion> lista = programacionService.listarPorSupervisor(idSupervisor);
        return ResponseEntity.ok(lista);
    }

    // ===================== LISTAR POR MES =====================
    @GetMapping("/empleado/{idEmpleado}/mes")
    public ResponseEntity<List<Programacion>> listarPorMes(
            @PathVariable Long idEmpleado,
            @RequestParam int year,
            @RequestParam int month) {
        List<Programacion> lista = programacionService.listarPorMes(idEmpleado, year, month);
        return ResponseEntity.ok(lista);
    }
    
 // ✅ NUEVO: OBTENER HORARIO DE HOY PARA EL EMPLEADO
    @GetMapping("/empleado/{idEmpleado}/hoy")
    public ResponseEntity<?> obtenerHorarioHoy(@PathVariable Long idEmpleado) {
        try {
            LocalDate hoy = LocalDate.now();
            List<Programacion> programaciones = programacionService.listarPorEmpleado(idEmpleado);
            
            // Filtrar solo la programación de hoy
            Optional<Programacion> horarioHoy = programaciones.stream()
                .filter(p -> p.getFecha().equals(hoy))
                .findFirst();
            
            if (horarioHoy.isPresent()) {
                return ResponseEntity.ok(horarioHoy.get());
            } else {
                return ResponseEntity.ok().body(null); // No hay horario para hoy
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ✅ NUEVO: OBTENER PRÓXIMOS TURNOS (próximos 7 días)
    @GetMapping("/empleado/{idEmpleado}/proximos")
    public ResponseEntity<List<Programacion>> obtenerProximosTurnos(@PathVariable Long idEmpleado) {
        try {
            LocalDate hoy = LocalDate.now();
            LocalDate finSemana = hoy.plusDays(3);
            
            List<Programacion> programaciones = programacionService.listarPorEmpleado(idEmpleado);
            
            // Filtrar programaciones de los próximos 7 días
            List<Programacion> proximosTurnos = programaciones.stream()
                .filter(p -> !p.getFecha().isBefore(hoy) && !p.getFecha().isAfter(finSemana))
                .sorted((p1, p2) -> p1.getFecha().compareTo(p2.getFecha()))
                .toList();
            
            return ResponseEntity.ok(proximosTurnos);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}
