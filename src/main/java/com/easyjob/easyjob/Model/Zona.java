package com.easyjob.easyjob.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "zonas")

public class Zona {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_zona")
    private Integer idZona;

    @Column(name = "nombre_zona", nullable = false, length = 100)
    private String nombreZona;

    // Relación con el supervisor (usuario asignado)
    @ManyToOne
    @JoinColumn(name = "idusuarios", referencedColumnName = "idusuarios")
    private Usuario supervisor;

    // ===== Getters y Setters =====
    public Integer getIdZona() {
        return idZona;
    }

    public void setIdZona(Integer idZona) {
        this.idZona = idZona;
    }

    public String getNombreZona() {
        return nombreZona;
    }

    public void setNombreZona(String nombreZona) {
        this.nombreZona = nombreZona;
    }

    public Usuario getSupervisor() {
        return supervisor;
    }

    public void setSupervisor(Usuario supervisor) {
        this.supervisor = supervisor;
    }

}
