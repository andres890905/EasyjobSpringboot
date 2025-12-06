package com.easyjob.easyjob.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.easyjob.easyjob.Model.Programacion;
import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Service.ProgramacionService;
import com.easyjob.easyjob.Observer.SupervisorObserver;
import com.easyjob.easyjob.Observer.SupervisorObserver.Notificacion;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@Controller
public class SupervisorController {

    @Autowired
    private ProgramacionService programacionService;
    
    // ✅ INYECTAR EL OBSERVER DE SUPERVISORES
    @Autowired
    private SupervisorObserver supervisorObserver;

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
        
        // ✅ AGREGAR CONTEO DE NOTIFICACIONES NO LEÍDAS
        int notificacionesNoLeidas = supervisorObserver.contarNoLeidas(usuario.getIdusuarios());
        model.addAttribute("notificacionesNoLeidas", notificacionesNoLeidas);
        
        return "dashboard_supervisor";
    }

    @GetMapping("/supervisor/horarios")
    public String verHorariosSupervisor(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        
        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return "redirect:/login?error=Debe+iniciar+sesión+como+Supervisor";
        }
        
        List<Programacion> programaciones = programacionService.listarPorSupervisor(usuario.getIdusuarios());
        
        model.addAttribute("programaciones", programaciones);
        model.addAttribute("usuario", usuario);
        model.addAttribute("totalHorarios", programaciones.size());
        
        return "horarios_supervisor";
    }
    
    // ✅ NUEVO: Ver todas las notificaciones
    @GetMapping("/supervisor/notificaciones")
    public String verNotificaciones(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        
        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return "redirect:/login?error=Debe+iniciar+sesión+como+Supervisor";
        }
        
        // Obtener notificaciones del supervisor
        List<Notificacion> notificaciones = supervisorObserver.obtenerNotificaciones(usuario.getIdusuarios());
        int noLeidas = supervisorObserver.contarNoLeidas(usuario.getIdusuarios());
        
        model.addAttribute("notificaciones", notificaciones);
        model.addAttribute("totalNotificaciones", notificaciones.size());
        model.addAttribute("notificacionesNoLeidas", noLeidas);
        model.addAttribute("usuario", usuario);
        
        return "notificaciones_supervisor";
    }
    
    // ✅ NUEVO: API para obtener notificaciones (AJAX)
    @GetMapping("/api/supervisor/notificaciones")
    @ResponseBody
    public ResponseEntity<?> obtenerNotificaciones(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        
        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return ResponseEntity.status(403).body(Map.of("error", "No autorizado"));
        }
        
        List<Notificacion> notificaciones = supervisorObserver.obtenerNotificaciones(usuario.getIdusuarios());
        int noLeidas = supervisorObserver.contarNoLeidas(usuario.getIdusuarios());
        
        return ResponseEntity.ok(Map.of(
            "notificaciones", notificaciones,
            "total", notificaciones.size(),
            "noLeidas", noLeidas
        ));
    }
    
    // ✅ NUEVO: Marcar notificación como leída
    @PostMapping("/api/supervisor/notificaciones/leer")
    @ResponseBody
    public ResponseEntity<?> marcarComoLeida(
            @RequestParam int indice,
            HttpSession session) {
        
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        
        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return ResponseEntity.status(403).body(Map.of("error", "No autorizado"));
        }
        
        supervisorObserver.marcarComoLeida(usuario.getIdusuarios(), indice);
        
        return ResponseEntity.ok(Map.of(
            "mensaje", "Notificación marcada como leída",
            "noLeidas", supervisorObserver.contarNoLeidas(usuario.getIdusuarios())
        ));
    }
    
    // ✅ NUEVO: Marcar todas las notificaciones como leídas
    @PostMapping("/api/supervisor/notificaciones/leer-todas")
    @ResponseBody
    public ResponseEntity<?> marcarTodasComoLeidas(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuarioLogueado");
        
        if (usuario == null || !"Supervisor".equals(usuario.getRol().getTipo_rol())) {
            return ResponseEntity.status(403).body(Map.of("error", "No autorizado"));
        }
        
        supervisorObserver.marcarTodasComoLeidas(usuario.getIdusuarios());
        
        return ResponseEntity.ok(Map.of(
            "mensaje", "Todas las notificaciones marcadas como leídas",
            "noLeidas", 0
        ));
    }
}