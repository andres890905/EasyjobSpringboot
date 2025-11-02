package com.easyjob.easyjob.Model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_roles;

    private String tipo_rol;

    // Getters y setters
    public Integer getId_roles() { return id_roles; }
    public void setId_roles(Integer id_roles) { this.id_roles = id_roles; }

    public String getTipo_rol() { return tipo_rol; }
    public void setTipo_rol(String tipo_rol) { this.tipo_rol = tipo_rol; }
}
