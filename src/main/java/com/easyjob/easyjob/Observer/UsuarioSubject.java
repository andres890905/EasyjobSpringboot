package com.easyjob.easyjob.Observer;

import org.springframework.stereotype.Component;
import com.easyjob.easyjob.Model.Usuario;
import java.util.ArrayList;
import java.util.List;

/**
 * Subject (Sujeto Observable) del patrón Observer
 * Mantiene una lista de observadores y los notifica cuando ocurren eventos
 */
@Component
public class UsuarioSubject {
    
    private List<UsuarioObserver> observadores = new ArrayList<>();
    
    /**
     * Registra un nuevo observador
     */
    public void agregarObservador(UsuarioObserver observador) {
        if (!observadores.contains(observador)) {
            observadores.add(observador);
            System.out.println("✅ Observer registrado: " + observador.getClass().getSimpleName());
        }
    }
    
    /**
     * Elimina un observador
     */
    public void eliminarObservador(UsuarioObserver observador) {
        observadores.remove(observador);
        System.out.println("❌ Observer eliminado: " + observador.getClass().getSimpleName());
    }
    
    /**
     * Notifica a todos los observadores sobre la creación de un nuevo usuario
     */
    public void notificarCreacionUsuario(Usuario nuevoUsuario, Usuario administrador) {
        System.out.println("📢 Notificando a " + observadores.size() + " observador(es)...");
        
        for (UsuarioObserver observador : observadores) {
            try {
                observador.notificarNuevoUsuario(nuevoUsuario, administrador);
            } catch (Exception e) {
                System.err.println("❌ Error al notificar a " + observador.getClass().getSimpleName() + ": " + e.getMessage());
            }
        }
    }
    
    /**
     * Obtiene el número de observadores registrados
     */
    public int cantidadObservadores() {
        return observadores.size();
    }
}