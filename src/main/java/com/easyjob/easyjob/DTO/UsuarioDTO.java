package com.easyjob.easyjob.DTO;

public class UsuarioDTO {
	
	private Long id;
    private String nombreCompleto;
    private String correo;
    private String telefono;
    private String direccion;
    private String estado;
    private Double salario;
    private String sucursal;
    private String rol;
    
 // Constructor sin argumentos (requerido para Jackson)
    public UsuarioDTO() {
    }

    // Constructor
    public UsuarioDTO(Long id, String nombreCompleto, String correo, String telefono,
                      String direccion, String estado, Double salario,
                      String sucursal, String rol) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.telefono = telefono;
        this.direccion = direccion;
        this.estado = estado;
        this.salario = salario;
        this.sucursal = sucursal;
        this.rol = rol;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Double getSalario() { return salario; }
    public void setSalario(Double salario) { this.salario = salario; }

    public String getSucursal() { return sucursal; }
    public void setSucursal(String sucursal) { this.sucursal = sucursal; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

}
