package com.easyjob.easyjob.DTO;

import java.io.Serializable;

public class ReporteProgramacionDTO implements Serializable {
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private Long totalDominicales;
    private Long totalDescansos;
    private Double totalHorasExtra;

    // Constructor para la query JPQL
    public ReporteProgramacionDTO(Long idUsuario, String nombre, String apellido,
                                  Long totalDominicales, Long totalDescansos, 
                                  Double totalHorasExtra) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.nombreCompleto = nombre + " " + apellido;
        this.totalDominicales = totalDominicales != null ? totalDominicales : 0L;
        this.totalDescansos = totalDescansos != null ? totalDescansos : 0L;
        this.totalHorasExtra = totalHorasExtra != null ? totalHorasExtra : 0.0;
    }

    // Constructor vacío
    public ReporteProgramacionDTO() {}

    // Getters y Setters
    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
        this.nombreCompleto = this.nombre + " " + (this.apellido != null ? this.apellido : "");
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
        this.nombreCompleto = (this.nombre != null ? this.nombre : "") + " " + this.apellido;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public Long getTotalDominicales() {
        return totalDominicales;
    }

    public void setTotalDominicales(Long totalDominicales) {
        this.totalDominicales = totalDominicales;
    }

    public Long getTotalDescansos() {
        return totalDescansos;
    }

    public void setTotalDescansos(Long totalDescansos) {
        this.totalDescansos = totalDescansos;
    }

    public Double getTotalHorasExtra() {
        return totalHorasExtra;
    }

    public void setTotalHorasExtra(Double totalHorasExtra) {
        this.totalHorasExtra = totalHorasExtra;
    }

    @Override
    public String toString() {
        return "ReporteProgramacionDTO{" +
                "idUsuario=" + idUsuario +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", totalDominicales=" + totalDominicales +
                ", totalDescansos=" + totalDescansos +
                ", totalHorasExtra=" + totalHorasExtra +
                '}';
    }
}