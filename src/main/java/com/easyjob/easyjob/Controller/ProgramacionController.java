package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.Service.UsuarioService; 
import com.easyjob.easyjob.Model.Programacion;
import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Service.ProgramacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/programacion")
@CrossOrigin(origins = "*")
public class ProgramacionController {
	
	@Autowired
    private UsuarioService usuarioService;
	
    @Autowired
    private ProgramacionService programacionService;

    // ===== Crear o asignar un horario =====
    @PostMapping("/asignar")
    public Map<String, Object> asignarHorario(@RequestBody Programacion programacion) {
        Map<String, Object> response = new HashMap<>();
        try {
            Programacion guardada = programacionService.guardar(programacion);
            response.put("success", true);
            response.put("programacion", guardada);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }

    // ===== Listar todos los horarios =====
    @GetMapping("/listar")
    public List<Map<String, Object>> listarTodas() {
        List<Programacion> programaciones = programacionService.listarTodas();
        List<Map<String, Object>> respuesta = new ArrayList<>();

        for (Programacion p : programaciones) {
            Map<String, Object> item = new HashMap<>();
            item.put("idProgramacion", p.getIdProgramacion());
            item.put("descripcion", p.getDescripcion());
            item.put("fechaInicio", p.getFechaInicio());
            item.put("fechaFin", p.getFechaFin());

            if (p.getUsuario() != null) {
                item.put("idUsuario", p.getUsuario().getIdusuarios());
                item.put("nombreUsuario", p.getUsuario().getNombre() + " " + p.getUsuario().getApellido());
            } else {
                item.put("idUsuario", null);
                item.put("nombreUsuario", "Desconocido");
            }

            respuesta.add(item);
        }

        return respuesta;
    }


    // ===== Eliminar un horario =====
    @DeleteMapping("/eliminar/{id}")
    public Map<String, Object> eliminar(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            programacionService.eliminar(id);
            response.put("success", true);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return response;
    }
    

}
