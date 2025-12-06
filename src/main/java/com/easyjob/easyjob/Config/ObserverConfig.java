package com.easyjob.easyjob.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import com.easyjob.easyjob.Observer.SupervisorObserver;
import com.easyjob.easyjob.Observer.UsuarioSubject;
import jakarta.annotation.PostConstruct;

/**
 * Configuración del patrón Observer
 * Registra automáticamente los observadores al iniciar la aplicación
 */
@Configuration
public class ObserverConfig {
    
    @Autowired
    private UsuarioSubject usuarioSubject;
    
    @Autowired
    private SupervisorObserver supervisorObserver;
    
    /**
     * Se ejecuta después de que Spring inicialice los beans
     * Registra los observadores automáticamente
     */
    @PostConstruct
    public void configurarObservers() {
        System.out.println("⚙️ Configurando patrón Observer...");
        
        // Registrar el SupervisorObserver
        usuarioSubject.agregarObservador(supervisorObserver);
        
        System.out.println("✅ Patrón Observer configurado correctamente");
        System.out.println("📊 Observadores activos: " + usuarioSubject.cantidadObservadores());
    }
}