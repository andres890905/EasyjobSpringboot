package com.easyjob.easyjob.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

public class ProgramacionDTO {

    private Long idProgramacion;
    private Long idUsuario;      // Empleado
    private Long idSupervisor;   // Supervisor
    private LocalDate fecha;
    private LocalTime horaEntrada;
    private LocalTime horaSalida;
    private Double horasExtra;
    private Boolean esDescanso;
    private Boolean esDominical; 
    private String descripcion;

    // =================== CONSTRUCTORES ===================

    public ProgramacionDTO() {
    }

    // Constructor simple (7 parámetros)
    public ProgramacionDTO(Long idProgramacion, Long idUsuario, Long idSupervisor,
                           LocalDate fecha, LocalTime horaEntrada, LocalTime horaSalida,
                           String descripcion) {
        this.idProgramacion = idProgramacion;
        this.idUsuario = idUsuario;
        this.idSupervisor = idSupervisor;
        this.fecha = fecha;
        this.horaEntrada = horaEntrada;
        this.horaSalida = horaSalida;
        this.descripcion = descripcion;
    }

    // ✅ Constructor completo (10 parámetros) - NUEVO para Query
    public ProgramacionDTO(Long idProgramacion, Long idUsuario, Long idSupervisor,
                           LocalDate fecha, LocalTime horaEntrada, LocalTime horaSalida,
                           Double horasExtra, Boolean esDescanso, Boolean esDominical,
                           String descripcion) {
        this.idProgramacion = idProgramacion;
        this.idUsuario = idUsuario;
        this.idSupervisor = idSupervisor;
        this.fecha = fecha;
        this.horaEntrada = horaEntrada;
        this.horaSalida = horaSalida;
        this.horasExtra = horasExtra;
        this.esDescanso = esDescanso;
        this.esDominical = esDominical;
        this.descripcion = descripcion;
    }

    // =================== GETTERS & SETTERS ===================

    public Long getIdProgramacion() {
        return idProgramacion;
    }

    public void setIdProgramacion(Long idProgramacion) {
        this.idProgramacion = idProgramacion;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Long getIdSupervisor() {
        return idSupervisor;
    }

    public void setIdSupervisor(Long idSupervisor) {
        this.idSupervisor = idSupervisor;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraEntrada() {
        return horaEntrada;
    }

    public void setHoraEntrada(LocalTime horaEntrada) {
        this.horaEntrada = horaEntrada;
    }

    public LocalTime getHoraSalida() {
        return horaSalida;
    }

    public void setHoraSalida(LocalTime horaSalida) {
        this.horaSalida = horaSalida;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getHorasExtra() {
        return horasExtra;
    }

    public void setHorasExtra(Double horasExtra) {
        this.horasExtra = horasExtra;
    }

    public Boolean getEsDescanso() {
        return esDescanso;
    }

    public void setEsDescanso(Boolean esDescanso) {
        this.esDescanso = esDescanso;
    }

    public Boolean getEsDominical() {
        return esDominical;
    }

    public void setEsDominical(Boolean esDominical) {
        this.esDominical = esDominical;
    }
}