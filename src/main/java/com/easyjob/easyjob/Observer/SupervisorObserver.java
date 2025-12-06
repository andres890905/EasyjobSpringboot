package com.easyjob.easyjob.Observer;

import org.springframework.stereotype.Component;
import com.easyjob.easyjob.Model.Usuario;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementación concreta del Observer para Supervisores
 * Recibe y almacena notificaciones cuando se crean nuevos usuarios
 */
@Component
public class SupervisorObserver implements UsuarioObserver {
    
    // Almacenamiento de notificaciones por supervisor (ID supervisor -> lista de notificaciones)
    private Map<Long, List<Notificacion>> notificacionesPorSupervisor = new HashMap<>();
    
    @Override
    public void notificarNuevoUsuario(Usuario nuevoUsuario, Usuario administrador) {
        // Crear notificación
        Notificacion notificacion = new Notificacion(
            "Nuevo empleado creado: " + nuevoUsuario.getNombre() + " " + nuevoUsuario.getApellido(),
            "El administrador " + administrador.getNombre() + " " + administrador.getApellido() + 
            " ha creado un nuevo empleado con cédula " + nuevoUsuario.getIdusuarios() +
            " para el rol de " + nuevoUsuario.getRol().getTipo_rol() +
            (nuevoUsuario.getSucursal() != null ? " en la sucursal " + nuevoUsuario.getSucursal().getNombreSucursal() : ""),
            LocalDateTime.now(),
            false,
            nuevoUsuario.getIdusuarios(),
            administrador.getIdusuarios()
        );
        
        // Obtener todos los supervisores y notificarles
        // Por ahora, guardamos para todos los supervisores (se puede filtrar por zona)
        System.out.println("🔔 NOTIFICACIÓN GENERADA: " + notificacion.getTitulo());
        
        // Agregar a una lista general (ID 0 representa "todos los supervisores")
        agregarNotificacion(0L, notificacion);
    }
    
    /**
     * Agrega una notificación para un supervisor específico
     */
    private void agregarNotificacion(Long supervisorId, Notificacion notificacion) {
        notificacionesPorSupervisor
            .computeIfAbsent(supervisorId, k -> new ArrayList<>())
            .add(notificacion);
    }
    
    /**
     * Obtiene las notificaciones de un supervisor
     */
    public List<Notificacion> obtenerNotificaciones(Long supervisorId) {
        List<Notificacion> notificaciones = new ArrayList<>();
        
        // Agregar notificaciones específicas del supervisor
        if (notificacionesPorSupervisor.containsKey(supervisorId)) {
            notificaciones.addAll(notificacionesPorSupervisor.get(supervisorId));
        }
        
        // Agregar notificaciones generales (para todos)
        if (notificacionesPorSupervisor.containsKey(0L)) {
            notificaciones.addAll(notificacionesPorSupervisor.get(0L));
        }
        
        // Ordenar por fecha (más recientes primero)
        notificaciones.sort((n1, n2) -> n2.getFecha().compareTo(n1.getFecha()));
        
        return notificaciones;
    }
    
    /**
     * Obtiene solo las notificaciones no leídas
     */
    public List<Notificacion> obtenerNotificacionesNoLeidas(Long supervisorId) {
        return obtenerNotificaciones(supervisorId).stream()
            .filter(n -> !n.isLeida())
            .toList();
    }
    
    /**
     * Marca una notificación como leída
     */
    public void marcarComoLeida(Long supervisorId, int indiceNotificacion) {
        List<Notificacion> notificaciones = obtenerNotificaciones(supervisorId);
        if (indiceNotificacion >= 0 && indiceNotificacion < notificaciones.size()) {
            notificaciones.get(indiceNotificacion).setLeida(true);
        }
    }
    
    /**
     * Marca todas las notificaciones como leídas
     */
    public void marcarTodasComoLeidas(Long supervisorId) {
        obtenerNotificaciones(supervisorId).forEach(n -> n.setLeida(true));
    }
    
    /**
     * Obtiene el conteo de notificaciones no leídas
     */
    public int contarNoLeidas(Long supervisorId) {
        return (int) obtenerNotificaciones(supervisorId).stream()
            .filter(n -> !n.isLeida())
            .count();
    }
    
    /**
     * Clase interna para representar una notificación
     */
    public static class Notificacion {
        private String titulo;
        private String mensaje;
        private LocalDateTime fecha;
        private boolean leida;
        private Long empleadoId;
        private Long adminId;
        
        public Notificacion(String titulo, String mensaje, LocalDateTime fecha, 
                          boolean leida, Long empleadoId, Long adminId) {
            this.titulo = titulo;
            this.mensaje = mensaje;
            this.fecha = fecha;
            this.leida = leida;
            this.empleadoId = empleadoId;
            this.adminId = adminId;
        }
        
        // Getters y Setters
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        
        public String getMensaje() { return mensaje; }
        public void setMensaje(String mensaje) { this.mensaje = mensaje; }
        
        public LocalDateTime getFecha() { return fecha; }
        public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
        
        public boolean isLeida() { return leida; }
        public void setLeida(boolean leida) { this.leida = leida; }
        
        public Long getEmpleadoId() { return empleadoId; }
        public void setEmpleadoId(Long empleadoId) { this.empleadoId = empleadoId; }
        
        public Long getAdminId() { return adminId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
        
        public String getFechaFormateada() {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            return fecha.format(formatter);
        }
    }
}