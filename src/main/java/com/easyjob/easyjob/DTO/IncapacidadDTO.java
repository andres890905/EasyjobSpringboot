package com.easyjob.easyjob.DTO;

public class IncapacidadDTO {

    private String idIncapacidad;
    private Integer idusuarios;
    private String nombreEmpleado;
    private String nombreEps;
    private String motivo;
    private String tipo;
    private String fechaInicio; // En formato YYYY-MM-DD
    private String fechaFin;
    private String archivoSoporte;
    private String estado;

    // ===== CONSTRUCTORES =====
    public IncapacidadDTO() {}

    public IncapacidadDTO(String idIncapacidad, Integer idusuarios, String nombreEmpleado,
                          String nombreEps, String motivo, String fechaInicio,
                          String fechaFin, String archivoSoporte) {
        this.idIncapacidad = idIncapacidad;
        this.idusuarios = idusuarios;
        this.nombreEmpleado = nombreEmpleado;
        this.nombreEps = nombreEps;
        this.motivo = motivo;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.archivoSoporte = archivoSoporte;
    }

    // ===== GETTERS & SETTERS =====
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(String fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public String getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(String fechaFin) {
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
