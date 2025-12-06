package com.easyjob.easyjob.Strategy;

import jakarta.servlet.http.HttpSession;

public class LoginStrategyFactory {

    public static LoginStrategy getStrategy(String rol, HttpSession session) {

        return switch (rol) {
            case "Administrador" -> new AdminLoginStrategy(session);
            case "Supervisor"    -> new SupervisorLoginStrategy();
            case "Empleado"      -> new EmpleadoLoginStrategy();
            default              -> null;
        };
    }
}
