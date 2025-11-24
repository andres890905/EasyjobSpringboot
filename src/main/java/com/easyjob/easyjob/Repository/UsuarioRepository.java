package com.easyjob.easyjob.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.easyjob.easyjob.DTO.UsuarioDTO;
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
    
 // ✅ NUEVO: Buscar empleados de la zona del supervisor
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "JOIN FETCH u.sucursal s " +
           "LEFT JOIN FETCH u.rol " +
           "WHERE s.id_zona IN " +
           "(SELECT z.idZona FROM Zona z WHERE z.supervisor.idusuarios = :idSupervisor) " +
           "AND u.idusuarios != :idSupervisor " + // Excluir al supervisor mismo
           "ORDER BY u.nombre, u.apellido")
    List<Usuario> findByZonaSupervisor(@Param("idSupervisor") Long idSupervisor);
    
 // ================= REPORTES =================
    @Query("SELECT new com.easyjob.easyjob.DTO.UsuarioDTO(" +
           "u.idusuarios, CONCAT(u.nombre, ' ', u.apellido), u.correo, u.telefono, u.direccion, " +
           "u.estado, u.salario, s.nombreSucursal, r.tipo_rol) " +
           "FROM Usuario u " +
           "JOIN u.sucursal s " +
           "JOIN u.rol r " +
           "ORDER BY u.nombre, u.apellido")
    List<UsuarioDTO> findAllUsuariosDTO();


}
