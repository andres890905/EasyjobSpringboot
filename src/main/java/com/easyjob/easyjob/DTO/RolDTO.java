package com.easyjob.easyjob.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RolDTO {
    
    @JsonProperty("id_roles")
    private Long idRoles;
    
    @JsonProperty("tipo_rol")
    private String tipoRol;

    public RolDTO() {
    }

    // Getters y Setters
    public Long getIdRoles() { return idRoles; }
    public void setIdRoles(Long idRoles) { this.idRoles = idRoles; }

    public String getTipoRol() { return tipoRol; }
    public void setTipoRol(String tipoRol) { this.tipoRol = tipoRol; }
}