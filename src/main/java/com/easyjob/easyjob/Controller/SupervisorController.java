package com.easyjob.easyjob.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.easyjob.easyjob.Model.Programacion;
import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Service.ProgramacionService;
import jakarta.servlet.http.HttpSession;
import java.util.List;

@Controller
public class SupervisorController {

    @Autowired
    private ProgramacionService programacionService;

    @GetMapping("/dashboard_supervisor")
    public String dashboardSupervisor(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        
        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return "redirect:/login?error=Debe+iniciar+sesión+como+Supervisor";
        }
        
        // Agregar datos específicos del supervisor al modelo
        model.addAttribute("usuario", usuario);
        model.addAttribute("usuarioId", usuario.getIdusuarios());
        model.addAttribute("usuarioNombre", usuario.getNombre());
        model.addAttribute("usuarioApellido", usuario.getApellido());
        model.addAttribute("usuarioCorreo", usuario.getCorreo());
        
        return "dashboard_supervisor";
    }

    // ✅ NUEVO: Endpoint para ver horarios solo de la zona del supervisor
    @GetMapping("/supervisor/horarios")
    public String verHorariosSupervisor(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        
        // Validar que sea supervisor
        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return "redirect:/login?error=Debe+iniciar+sesión+como+Supervisor";
        }
        
        // ✅ Obtener solo las programaciones de empleados de la zona del supervisor
        List<Programacion> programaciones = programacionService.listarPorSupervisor(usuario.getIdusuarios());
        
        // Agregar al modelo
        model.addAttribute("programaciones", programaciones);
        model.addAttribute("usuario", usuario);
        model.addAttribute("totalHorarios", programaciones.size());
        
        return "horarios_supervisor"; // Vista con la tabla de horarios
    }
}