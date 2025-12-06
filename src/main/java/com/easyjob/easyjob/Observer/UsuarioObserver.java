package com.easyjob.easyjob.Observer;

import com.easyjob.easyjob.Model.Usuario;

/**
 * Interface Observer para el patrón Observer
 * Define el contrato para los observadores que serán notificados
 * cuando se cree un nuevo usuario
 */
public interface UsuarioObserver {
    
    /**
     * Método que será llamado cuando se cree un nuevo usuario
     * @param nuevoUsuario El usuario que acaba de ser creado
     * @param administrador El administrador que creó el usuario
     */
    void notificarNuevoUsuario(Usuario nuevoUsuario, Usuario administrador);
}