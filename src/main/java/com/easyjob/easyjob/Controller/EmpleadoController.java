package com.easyjob.easyjob.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.easyjob.easyjob.Model.Usuario;

import jakarta.servlet.http.HttpSession;

@Controller
public class EmpleadoController {

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

}
