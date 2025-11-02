package com.easyjob.easyjob.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "sucursal")
public class Sucursal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_sucursal;

    private Long id_zona;

    @Column(name = "nombre_sucursal")
    private String nombreSucursal;

    private String direccion;
    private String ciudad;
    private String correo;
    private String telefono;

    // Getters y Setters
    public Long getId_sucursal() { return id_sucursal; }
    public void setId_sucursal(Long id_sucursal) { this.id_sucursal = id_sucursal; }

    public Long getId_zona() { return id_zona; }
    public void setId_zona(Long id_zona) { this.id_zona = id_zona; }

    public String getNombreSucursal() { return nombreSucursal; }
    public void setNombreSucursal(String nombreSucursal) { this.nombreSucursal = nombreSucursal; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}

