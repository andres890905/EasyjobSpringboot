package com.easyjob.easyjob.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.easyjob.easyjob.Model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    @Query("SELECT u FROM Usuario u WHERE u.sucursal.id_sucursal = :sucursalId")
    List<Usuario> findBySucursalId(@Param("sucursalId") Long sucursalId);

    @Query("SELECT u FROM Usuario u WHERE u.rol.id_roles = :rolId")
    List<Usuario> findByRolId(@Param("rolId") Integer rolId);

    @Query("SELECT u FROM Usuario u WHERE u.sucursal.id_sucursal = :sucursalId AND u.rol.id_roles = :rolId")
    List<Usuario> findBySucursalIdAndRolId(@Param("sucursalId") Long sucursalId, @Param("rolId") Integer rolId);
    
    // Buscar supervisores activos
    @Query("SELECT u FROM Usuario u WHERE u.rol.tipo_rol = 'SUPERVISOR' AND u.estado = 'ACTIVO'")
    List<Usuario> findSupervisoresActivos();
}
