package com.easyjob.easyjob.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    
    private Long idusuarios;

    @ManyToOne
    @JoinColumn(name = "id_sucursal")
    private Sucursal sucursal; 

    @ManyToOne
    @JoinColumn(name = "id_roles")
    private Rol rol; 

    private String nombre;
    private String apellido;
    private String correo;
    private String contrasena;
    private LocalDate fecha_nacimiento;
    private String telefono;
    private String direccion;
    private String estado;
    private Double salario;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private java.sql.Timestamp fechaRegistro;

    // Getters y Setters
    public Long getIdusuarios() { return idusuarios; }
    public void setIdusuarios(Long idusuarios) { this.idusuarios = idusuarios; }

    public Sucursal getSucursal() { return sucursal; }
    public void setSucursal(Sucursal sucursal) { this.sucursal = sucursal; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public LocalDate getFecha_nacimiento() { return fecha_nacimiento; }
    public void setFecha_nacimiento(LocalDate fecha_nacimiento) { this.fecha_nacimiento = fecha_nacimiento; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Double getSalario() { return salario; }
    public void setSalario(Double salario) { this.salario = salario; }

    public java.sql.Timestamp getFechaRegistro() { return fechaRegistro; }
}