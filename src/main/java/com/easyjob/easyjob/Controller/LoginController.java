package com.easyjob.easyjob.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.Strategy.LoginStrategy;
import com.easyjob.easyjob.Strategy.LoginStrategyFactory;

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

        return "login";
    }

    // Procesar login
    @PostMapping("/login")
    public String doLogin(@RequestParam String correo,
                          @RequestParam String password,
                          HttpSession session) {

        // Buscar usuario
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);

        if (usuario == null) {
            return "redirect:/login?error=Correo+no+registrado";
        }

        // Validar contraseña
        if (!usuario.getContrasena().equals(password)) {
            return "redirect:/login?error=Contraseña+incorrecta";
        }

        // Validar estado
        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            return "redirect:/login?error=Usuario+inactivo.+Contacte+al+administrador";
        }

        // Guardar usuario en sesión
        session.setAttribute("usuarioLogueado", usuario);

        // Obtener el rol del usuario
        String tipoRol = usuario.getRol().getTipo_rol();

        // Seleccionar estrategia según el rol
        LoginStrategy strategy = LoginStrategyFactory.getStrategy(tipoRol, session);

        if (strategy == null) {
            return "redirect:/login?error=Rol+no+válido";
        }

        // Ejecutar la estrategia (redirección)
        return strategy.redirigir(usuario);
    }

    // Cerrar sesión
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login?logout=true";
    }
}
