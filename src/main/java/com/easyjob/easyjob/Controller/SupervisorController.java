package com.easyjob.easyjob.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.easyjob.easyjob.Model.Usuario;

import jakarta.servlet.http.HttpSession;

@Controller
public class SupervisorController {

    @GetMapping("/dashboard_supervisor")
    public String dashboardSupervisor(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return "redirect:/login?error=Debe+iniciar+sesión+como+Supervisor";
        }

        // Agregar datos específicos del supervisor al modelo
        model.addAttribute("usuario", usuario);

        return "dashboard_supervisor"; // Debe existir dashboard_supervisor.html
    }
}

