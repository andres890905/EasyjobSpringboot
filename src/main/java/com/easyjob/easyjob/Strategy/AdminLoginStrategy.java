package com.easyjob.easyjob.Strategy;

import com.easyjob.easyjob.Model.Usuario;

import jakarta.servlet.http.HttpSession;

public class AdminLoginStrategy implements LoginStrategy {

    private HttpSession session;

    public AdminLoginStrategy(HttpSession session) {
        this.session = session;
    }

    @Override
    public String redirigir(Usuario usuario) {

        // Mensaje personalizado
        String mensaje = "El administrador " + usuario.getNombre() + " ha iniciado sesión.";

        // Guardar mensaje en la sesión
        session.setAttribute("mensajeAdminLogin", mensaje);

        return "redirect:/dashboard_admin";
    }
}
