package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Permite que el JS del dashboard se comunique con este controlador
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private UsuarioRepository usuarioRepository;
    // ===== Buscar usuario por ID =====
    @GetMapping("/buscar/{id}")
    public Map<String, Object> buscarUsuarioPorId(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        usuarioService.obtenerPorId(id).ifPresentOrElse(
            usuario -> {
                response.put("success", true);
                response.put("usuario", usuario);
            },
            () -> {
                response.put("success", false);
                response.put("mensaje", "Usuario no encontrado");
            }
        );

        return response;
    }

    // ===== Listar todos los usuarios =====
    @GetMapping("/listar")
    public Map<String, Object> listarUsuarios() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Usuario> usuarios = usuarioService.listarTodos();
            response.put("success", true);
            response.put("usuarios", usuarios);
        } catch (Exception e) {
            response.put("success", false);
            response.put("mensaje", "Error al listar usuarios: " + e.getMessage());
        }
        return response;
    }
    
    @GetMapping("/empleados/{id}")
    public ResponseEntity<?> obtenerEmpleado(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
 // ✅ NUEVO: Endpoint para listar empleados de la zona del supervisor
    @GetMapping("/zona/{idSupervisor}")
    public ResponseEntity<List<Usuario>> listarEmpleadosPorZonaSupervisor(@PathVariable Long idSupervisor) {
        try {
            List<Usuario> empleados = usuarioService.listarEmpleadosPorZonaSupervisor(idSupervisor);
            return ResponseEntity.ok(empleados);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
    }
}
