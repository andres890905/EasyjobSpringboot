package com.easyjob.easyjob.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Repository.UsuarioRepository;

import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Mostrar página de login
    @GetMapping("/login")
    public String mostrarLogin(@RequestParam(required = false) String error, 
                               @RequestParam(required = false) String logout,
                               Model model) {
        if (error != null) {
            model.addAttribute("errorMensaje", error);
        }
        if (logout != null) {
            model.addAttribute("mensaje", "Sesión cerrada correctamente");
        }
        return "login"; // devuelve login.html
    }

    // Procesar login
    @PostMapping("/login")
    public String doLogin(@RequestParam String correo, 
                          @RequestParam String password, 
                          HttpSession session) {

        Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);

        if (usuario == null) {
            return "redirect:/login?error=Correo+no+registrado";
        }

        if (!usuario.getContrasena().equals(password)) {
            return "redirect:/login?error=Contraseña+incorrecta";
        }
        
     // ===== VALIDACIÓN DE ESTADO ACTIVO =====
        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            return "redirect:/login?error=Usuario+inactivo.+Contacte+al+administrador";
        }

        // Guardar usuario en sesión
        session.setAttribute("usuarioLogueado", usuario);

        // Redirigir según rol
        String tipoRol = usuario.getRol().getTipo_rol();
        return switch (tipoRol) {
            case "Administrador" -> "redirect:/dashboard_admin";
            case "Supervisor"    -> "redirect:/dashboard_supervisor";
            case "Empleado"      -> "redirect:/dashboard_empleado";
            default              -> "redirect:/login?error=Rol+no+válido";
        };
    }

    // Logout
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate(); // elimina la sesión
        return "redirect:/login?logout=true";
    }
}
