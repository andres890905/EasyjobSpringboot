package com.easyjob.easyjob.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Service.UsuarioService;

import jakarta.servlet.http.HttpSession;

@Controller
public class EmpleadoController {
	
	@Autowired
    private UsuarioService usuarioService; // Inyección del servicio
	

    @GetMapping("/dashboard_empleado")
    public String dashboardEmpleado(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuario == null || !"Empleado".equals(usuario.getRol().getTipo_rol())) {
            return "redirect:/login?error=Debe+iniciar+sesión+como+Empleado";
        }

        // Agregar datos que quieras mostrar en el dashboard del empleado
        model.addAttribute("usuario", usuario);

        return "dashboard_empleado"; // Debe existir dashboard_empleado.html
    }
    
    @GetMapping("/api/empleado/datos") // mostrar datos de usuario
    @ResponseBody
    public Usuario obtenerDatosEmpleado(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        return usuario;
    }
    
    @PutMapping("/api/empleado/actualizar")
    @ResponseBody
    public ResponseEntity<?> actualizarDatosEmpleado(
            HttpSession session, 
            @RequestBody Usuario datosActualizados) {

        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuario == null) {
            return ResponseEntity.status(401).body("No autorizado");
        }

        // Actualizar los campos permitidos
        usuario.setCorreo(datosActualizados.getCorreo());
        usuario.setTelefono(datosActualizados.getTelefono());
        usuario.setDireccion(datosActualizados.getDireccion());
        usuario.setFecha_nacimiento(datosActualizados.getFecha_nacimiento()); 

        // Guardar cambios en la base de datos
        Usuario actualizado = usuarioService.guardar(usuario);

        // Actualizar sesión
        session.setAttribute("usuarioLogueado", actualizado);

        return ResponseEntity.ok(actualizado);
    }

}
