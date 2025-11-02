package com.easyjob.easyjob.Controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.easyjob.easyjob.Model.Rol;
import com.easyjob.easyjob.Model.Sucursal;
import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Repository.RolRepository;
import com.easyjob.easyjob.Repository.SucursalRepository;
import com.easyjob.easyjob.Repository.UsuarioRepository;

import jakarta.servlet.http.HttpSession;

@Controller
public class AdminController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private SucursalRepository sucursalRepository;

    /**
     * Cargar el dashboard del administrador
     */
    @GetMapping("/dashboard_admin")
    public String dashboardAdmin(Model model, HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");

        // Validar que el usuario esté logueado y sea administrador
        if (usuario == null || !"Administrador".equals(usuario.getRol().getTipo_rol())) {
            return "redirect:/login?error=Debe+iniciar+sesión+como+Administrador";
        }

        // Cargar datos iniciales para el dashboard
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<Sucursal> sucursales = sucursalRepository.findAll();
        List<Rol> roles = rolRepository.findAll();

        model.addAttribute("roles", roles);
        model.addAttribute("usuarios", usuarios);
        model.addAttribute("sucursales", sucursales);

        return "dashboard_admin";
    }

    /**
     * Filtrar empleados por sucursal y/o rol
     */
    @GetMapping("/empleados/filtrar")
    @ResponseBody
    public ResponseEntity<?> filtrarEmpleados(
            @RequestParam(required = false, defaultValue = "todas") String sucursalId,
            @RequestParam(required = false, defaultValue = "todos") String rolId) {
        
        try {
            List<Usuario> empleados;

            // Filtrar por sucursal y rol
            if ("todas".equalsIgnoreCase(sucursalId)) {
                if (rolId == null || rolId.isEmpty() || "todos".equalsIgnoreCase(rolId)) {
                    empleados = usuarioRepository.findAll();
                } else {
                    Integer rol = Integer.valueOf(rolId);
                    empleados = usuarioRepository.findByRolId(rol);
                }
            } else {
                Long sucursal = Long.valueOf(sucursalId);
                if (rolId == null || rolId.isEmpty() || "todos".equalsIgnoreCase(rolId)) {
                    empleados = usuarioRepository.findBySucursalId(sucursal);
                } else {
                    Integer rol = Integer.valueOf(rolId);
                    empleados = usuarioRepository.findBySucursalIdAndRolId(sucursal, rol);
                }
            }

            return ResponseEntity.ok(empleados);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al filtrar empleados: " + e.getMessage()));
        }
    }

    /**
     * Obtener un empleado por ID
     */
    @GetMapping("/empleados/{id}")
    @ResponseBody
    public ResponseEntity<?> obtenerEmpleado(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
            
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener empleado: " + e.getMessage()));
        }
    }

    /**
     * Crear un nuevo empleado
     */
    @PostMapping("/empleados")
    @ResponseBody
    public ResponseEntity<?> crearEmpleado(@RequestBody Map<String, Object> empleadoData, HttpSession session) {
        try {
            // Validar que el usuario sea administrador
            Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");
            if (usuarioLogueado == null || !"Administrador".equals(usuarioLogueado.getRol().getTipo_rol())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tiene permisos para crear empleados"));
            }

            // Validar datos requeridos
            if (!empleadoData.containsKey("cedula") || !empleadoData.containsKey("nombre") 
                || !empleadoData.containsKey("apellido") || !empleadoData.containsKey("correo")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Faltan campos obligatorios"));
            }

            // Verificar si ya existe un usuario con esa cédula
            String cedula = empleadoData.get("cedula").toString();
            if (usuarioRepository.existsById(Long.valueOf(cedula))) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Ya existe un empleado con esa cédula"));
            }

            // Crear nuevo usuario
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setIdusuarios(Long.valueOf(cedula));
            nuevoUsuario.setNombre(empleadoData.get("nombre").toString());
            nuevoUsuario.setApellido(empleadoData.get("apellido").toString());
            nuevoUsuario.setCorreo(empleadoData.get("correo").toString());
            nuevoUsuario.setEstado("ACTIVO");

            // Asignar rol
            if (empleadoData.containsKey("rol_id")) {
                Integer rolId = Integer.valueOf(empleadoData.get("rol_id").toString());
                Rol rol = rolRepository.findById(rolId)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
                nuevoUsuario.setRol(rol);
            }

            // Asignar sucursal
            if (empleadoData.containsKey("sucursal_id")) {
                Long sucursalId = Long.valueOf(empleadoData.get("sucursal_id").toString());
                Sucursal sucursal = sucursalRepository.findById(sucursalId)
                        .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
                nuevoUsuario.setSucursal(sucursal);
            }

            // Asignar salario
            if (empleadoData.containsKey("salario")) {
                nuevoUsuario.setSalario(Double.valueOf(empleadoData.get("salario").toString()));
            }

            // Asignar contraseña (temporal o generada)
            if (empleadoData.containsKey("password") && !empleadoData.get("password").toString().isEmpty()) {
                nuevoUsuario.setContrasena(empleadoData.get("password").toString());
            } else {
                // Generar contraseña temporal
                nuevoUsuario.setContrasena("Temporal123!");
            }

            // Guardar en la base de datos
            Usuario empleadoGuardado = usuarioRepository.save(nuevoUsuario);

            return ResponseEntity.status(HttpStatus.CREATED).body(empleadoGuardado);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Formato de datos incorrecto"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear empleado: " + e.getMessage()));
        }
    }

    /**
     * Actualizar un empleado existente
     */
    @PutMapping("/empleados/{id}")
    @ResponseBody
    public ResponseEntity<?> editarEmpleado(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> empleadoData,
            HttpSession session) {
        
        try {
            // Validar que el usuario sea administrador
            Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");
            if (usuarioLogueado == null || !"Administrador".equals(usuarioLogueado.getRol().getTipo_rol())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tiene permisos para editar empleados"));
            }

            // Buscar el usuario existente
            Usuario usuarioExistente = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

            // Actualizar campos
            if (empleadoData.containsKey("nombre")) {
                usuarioExistente.setNombre(empleadoData.get("nombre").toString());
            }
            if (empleadoData.containsKey("apellido")) {
                usuarioExistente.setApellido(empleadoData.get("apellido").toString());
            }
            if (empleadoData.containsKey("correo")) {
                usuarioExistente.setCorreo(empleadoData.get("correo").toString());
            }
            if (empleadoData.containsKey("salario")) {
                usuarioExistente.setSalario(Double.valueOf(empleadoData.get("salario").toString()));
            }

            // Actualizar rol
            if (empleadoData.containsKey("rol_id")) {
                Integer rolId = Integer.valueOf(empleadoData.get("rol_id").toString());
                Rol rol = rolRepository.findById(rolId)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
                usuarioExistente.setRol(rol);
            }

            // Actualizar sucursal
            if (empleadoData.containsKey("sucursal_id")) {
                Long sucursalId = Long.valueOf(empleadoData.get("sucursal_id").toString());
                Sucursal sucursal = sucursalRepository.findById(sucursalId)
                        .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
                usuarioExistente.setSucursal(sucursal);
            }

            // Guardar cambios
            Usuario empleadoActualizado = usuarioRepository.save(usuarioExistente);

            return ResponseEntity.ok(empleadoActualizado);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Formato de datos incorrecto"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar empleado: " + e.getMessage()));
        }
    }

    /**
     * Cambiar el estado de un empleado (Activo/Inactivo)
     */
    @PutMapping("/empleados/{id}/estado")
    @ResponseBody
    public ResponseEntity<?> cambiarEstadoEmpleado(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

            // Cambiar el estado
            if ("ACTIVO".equals(usuario.getEstado())) {
                usuario.setEstado("INACTIVO");
            } else {
                usuario.setEstado("ACTIVO");
            }

            Usuario empleadoActualizado = usuarioRepository.save(usuario);
            
            return ResponseEntity.ok(empleadoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al cambiar estado: " + e.getMessage()));
        }
    }

    /**
     * Eliminar un empleado (opcional - soft delete cambiando estado)
     */
    @DeleteMapping("/empleados/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarEmpleado(@PathVariable Long id, HttpSession session) {
        try {
            // Validar que el usuario sea administrador
            Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");
            if (usuarioLogueado == null || !"Administrador".equals(usuarioLogueado.getRol().getTipo_rol())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No tiene permisos para eliminar empleados"));
            }

            Usuario usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

            // Soft delete: cambiar estado a INACTIVO en lugar de eliminar
            usuario.setEstado("INACTIVO");
            usuarioRepository.save(usuario);

            // Si quieres hacer hard delete (eliminar de la BD):
            // usuarioRepository.deleteById(id);

            return ResponseEntity.ok(Map.of("mensaje", "Empleado eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al eliminar empleado: " + e.getMessage()));
        }
    }
}