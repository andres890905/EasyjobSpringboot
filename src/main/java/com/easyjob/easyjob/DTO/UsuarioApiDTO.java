package com.easyjob.easyjob.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UsuarioApiDTO {
    
    @JsonProperty("idusuarios")
    private Long idusuarios;
    
    private String nombre;
    private String apellido;
    private String correo;
    private String contrasena;
    
    @JsonProperty("fecha_nacimiento")
    private String fechaNacimiento;
    
    private String telefono;
    private String direccion;
    private String estado;
    private Double salario;
    
    @JsonProperty("fechaRegistro")
    private String fechaRegistro;
    
    private SucursalDTO sucursal;
    private RolDTO rol;

    // Constructor sin argumentos (REQUERIDO para Jackson)
    public UsuarioApiDTO() {
    }

    // Getters y Setters
    public Long getIdusuarios() { return idusuarios; }
    public void setIdusuarios(Long idusuarios) { this.idusuarios = idusuarios; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(String fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Double getSalario() { return salario; }
    public void setSalario(Double salario) { this.salario = salario; }

    public String getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public SucursalDTO getSucursal() { return sucursal; }
    public void setSucursal(SucursalDTO sucursal) { this.sucursal = sucursal; }

    public RolDTO getRol() { return rol; }
    public void setRol(RolDTO rol) { this.rol = rol; }
}