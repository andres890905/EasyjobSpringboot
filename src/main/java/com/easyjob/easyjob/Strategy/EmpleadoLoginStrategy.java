package com.easyjob.easyjob.Strategy;

import com.easyjob.easyjob.Model.Usuario;

public class EmpleadoLoginStrategy implements LoginStrategy {

    @Override
    public String redirigir(Usuario usuario) {
        return "redirect:/dashboard_empleado";
    }
}
