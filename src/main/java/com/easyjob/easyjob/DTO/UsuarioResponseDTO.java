package com.easyjob.easyjob.DTO;

import java.util.List;

public class UsuarioResponseDTO {
    private boolean success;
    private List<UsuarioApiDTO> usuarios;

    
    public UsuarioResponseDTO() {
    }

    // Getters y Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<UsuarioApiDTO> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<UsuarioApiDTO> usuarios) {
        this.usuarios = usuarios;
    }
}