package com.easyjob.easyjob.Strategy;

import com.easyjob.easyjob.Model.Usuario;

public class SupervisorLoginStrategy implements LoginStrategy {

    @Override
    public String redirigir(Usuario usuario) {
        return "redirect:/dashboard_supervisor";
    }
}
