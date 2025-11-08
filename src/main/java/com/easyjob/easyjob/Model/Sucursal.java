package com.easyjob.easyjob.Model;

import jakarta.persistence.*;

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

    // ✅ Constructor vacío obligatorio para JPA
    public Sucursal() {}

    // ✅ Constructor privado usado por el Builder
    private Sucursal(Builder builder) {
        this.id_sucursal = builder.id_sucursal;
        this.id_zona = builder.id_zona;
        this.nombreSucursal = builder.nombreSucursal;
        this.direccion = builder.direccion;
        this.ciudad = builder.ciudad;
        this.correo = builder.correo;
        this.telefono = builder.telefono;
    }

    // ✅ Clase Builder
    public static class Builder {
        private Long id_sucursal;
        private Long id_zona;
        private String nombreSucursal;
        private String direccion;
        private String ciudad;
        private String correo;
        private String telefono;

        public Builder idSucursal(Long id) { this.id_sucursal = id; return this; }
        public Builder idZona(Long idZona) { this.id_zona = idZona; return this; }
        public Builder nombreSucursal(String nombre) { this.nombreSucursal = nombre; return this; }
        public Builder direccion(String dir) { this.direccion = dir; return this; }
        public Builder ciudad(String ciudad) { this.ciudad = ciudad; return this; }
        public Builder correo(String correo) { this.correo = correo; return this; }
        public Builder telefono(String telefono) { this.telefono = telefono; return this; }

        public Sucursal build() { return new Sucursal(this); }
    }

    // ✅ Getters y Setters
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
