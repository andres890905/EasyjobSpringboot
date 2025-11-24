package com.easyjob.easyjob.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "programacion")
public class Programacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_programacion")
    private Long idProgramacion;

    // 🔗 Empleado asignado al turno
    @ManyToOne
    @JoinColumn(name = "idusuarios", nullable = false)
    private Usuario usuario;

    // 🔗 Supervisor que asigna el turno
    @ManyToOne
    @JoinColumn(name = "id_supervisor", nullable = false)
    private Usuario supervisor;

    // 📅 Fecha específica del turno
    @Column(nullable = true)
    private LocalDate fecha;

    // ⏰ Horas de entrada y salida
    @Column(name = "hora_entrada")
    private LocalTime horaEntrada;

    @Column(name = "hora_salida")
    private LocalTime horaSalida;

    // 🕒 Horas extra trabajadas
    @Column(name = "horas_extra", columnDefinition = "DECIMAL(5,2) DEFAULT 0")
    private Double horasExtra;

    // 🚫 Día de descanso
    @Column(name = "es_descanso", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean esDescanso;

    // 🌞 Día dominical o festivo
    @Column(name = "es_dominical", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean esDominical;

    // 📝 Observaciones o tipo de turno
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // 📆 Control de creación y actualización
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ====================== CONSTRUCTORES ======================
    public Programacion() {}

    // ====================== GETTERS Y SETTERS ======================

    public Long getIdProgramacion() {
        return idProgramacion;
    }

    public void setIdProgramacion(Long idProgramacion) {
        this.idProgramacion = idProgramacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Usuario getSupervisor() {
        return supervisor;
    }

    public void setSupervisor(Usuario supervisor) {
        this.supervisor = supervisor;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // ====================== MÉTODOS AUXILIARES ======================

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
