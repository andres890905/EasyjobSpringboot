package com.easyjob.easyjob.Repository;

import com.easyjob.easyjob.Model.Programacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProgramacionRepository extends JpaRepository<Programacion, Long> {

    List<Programacion> findByUsuario_Idusuarios(Long idusuarios);

    List<Programacion> findBySupervisor_Idusuarios(Long idSupervisor);

    List<Programacion> findByUsuario_IdusuariosAndFechaBetween(Long idusuarios, LocalDate fechaInicio, LocalDate fechaFin);


    // ✅ VERSIÓN COMPLETAMENTE OPTIMIZADA: Con todos los JOINs necesarios
    @Query("SELECT DISTINCT p FROM Programacion p " +
           "JOIN FETCH p.usuario u " +
           "JOIN FETCH u.sucursal s " +
           "JOIN FETCH u.rol " +
           "JOIN FETCH p.supervisor sup " +
           "JOIN FETCH sup.rol " +
           "JOIN FETCH sup.sucursal " +
           "WHERE s.id_zona IN " +
           "(SELECT z.idZona FROM Zona z WHERE z.supervisor.idusuarios = :idSupervisor)")
    List<Programacion> findByZonaSupervisor(@Param("idSupervisor") Long idSupervisor);

    // ✅ BONUS: También optimiza el método de listar todas
    @Query("SELECT DISTINCT p FROM Programacion p " +
           "JOIN FETCH p.usuario u " +
           "JOIN FETCH u.sucursal " +
           "JOIN FETCH u.rol " +
           "JOIN FETCH p.supervisor sup " +
           "JOIN FETCH sup.rol " +
           "JOIN FETCH sup.sucursal")
    List<Programacion> findAllWithRelations();
}