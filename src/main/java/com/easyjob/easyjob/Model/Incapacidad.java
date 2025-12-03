package com.easyjob.easyjob.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "incapacidades")
public class Incapacidad {

    @Id
    @Column(name = "id_incapacidad", length = 11, nullable = false)
    private String idIncapacidad;

    @Column(name = "idusuarios", nullable = false)
    private Integer idusuarios;

    @Column(name = "nombre_empleado", length = 255, nullable = false)
    private String nombreEmpleado;

    @Column(name = "nombre_eps", columnDefinition = "TEXT", nullable = false)
    private String nombreEps;

    @Column(name = "motivo", length = 255, nullable = false)
    private String motivo;

    @Column(name = "fecha_inicio", nullable = false)
    private java.sql.Date fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private java.sql.Date fechaFin;

    @Column(name = "archivo_soporte", length = 255)
    private String archivoSoporte;

    @Column(name = "estado")
    private String estado;

    // ====== CONSTRUCTOR VACÍO ======
    public Incapacidad() {}

    // ====== CONSTRUCTOR ======
    public Incapacidad(String idIncapacidad, Integer idusuarios, String nombreEmpleado,
                       String nombreEps, String motivo, java.sql.Date fechaInicio,
                       java.sql.Date fechaFin, String archivoSoporte, String estado) {
        this.idIncapacidad = idIncapacidad;
        this.idusuarios = idusuarios;
        this.nombreEmpleado = nombreEmpleado;
        this.nombreEps = nombreEps;
        this.motivo = motivo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.archivoSoporte = archivoSoporte;
        this.estado = estado;
    }

    // ====== GETTERS & SETTERS ======
    public String getIdIncapacidad() {
        return idIncapacidad;
    }

    public void setIdIncapacidad(String idIncapacidad) {
        this.idIncapacidad = idIncapacidad;
    }

    public Integer getIdusuarios() {
        return idusuarios;
    }

    public void setIdusuarios(Integer idusuarios) {
        this.idusuarios = idusuarios;
    }

    public String getNombreEmpleado() {
        return nombreEmpleado;
    }

    public void setNombreEmpleado(String nombreEmpleado) {
        this.nombreEmpleado = nombreEmpleado;
    }

    public String getNombreEps() {
        return nombreEps;
    }

    public void setNombreEps(String nombreEps) {
        this.nombreEps = nombreEps;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public java.sql.Date getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(java.sql.Date fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public java.sql.Date getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(java.sql.Date fechaFin) {
        this.fechaFin = fechaFin;
    }

    public String getArchivoSoporte() {
        return archivoSoporte;
    }

    public void setArchivoSoporte(String archivoSoporte) {
        this.archivoSoporte = archivoSoporte;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
