package com.easyjob.easyjob.Repository;

import com.easyjob.easyjob.DTO.ReporteProgramacionDTO;
import com.easyjob.easyjob.Model.Programacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReporteProgramacionRepository extends JpaRepository<Programacion, Long> {

    /**
     * Obtener reporte simplificado de todos los empleados por mes/año
     */
    @Query("SELECT new com.easyjob.easyjob.DTO.ReporteProgramacionDTO(" +
           "u.idusuarios, " +
           "u.nombre, " +
           "u.apellido, " +
           "SUM(CASE WHEN p.esDominical = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.esDescanso = true THEN 1 ELSE 0 END), " +
           "COALESCE(SUM(p.horasExtra), 0.0)) " +
           "FROM Programacion p " +
           "JOIN p.usuario u " +
           "WHERE MONTH(p.fecha) = :mes AND YEAR(p.fecha) = :anio " +
           "GROUP BY u.idusuarios, u.nombre, u.apellido " +
           "ORDER BY u.apellido, u.nombre")
    List<ReporteProgramacionDTO> obtenerReporteMensual(
        @Param("mes") int mes, 
        @Param("anio") int anio
    );

    /**
     * Obtener reporte de un solo empleado por mes/año
     */
    @Query("SELECT new com.easyjob.easyjob.DTO.ReporteProgramacionDTO(" +
           "u.idusuarios, " +
           "u.nombre, " +
           "u.apellido, " +
           "SUM(CASE WHEN p.esDominical = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.esDescanso = true THEN 1 ELSE 0 END), " +
           "COALESCE(SUM(p.horasExtra), 0.0)) " +
           "FROM Programacion p " +
           "JOIN p.usuario u " +
           "WHERE u.idusuarios = :idEmpleado " +
           "AND MONTH(p.fecha) = :mes AND YEAR(p.fecha) = :anio " +
           "GROUP BY u.idusuarios, u.nombre, u.apellido")
    Optional<ReporteProgramacionDTO> obtenerReporteEmpleado(
        @Param("idEmpleado") Long idEmpleado,
        @Param("mes") int mes, 
        @Param("anio") int anio
    );

    /**
     * Obtener reporte por rango de fechas
     */
    @Query("SELECT new com.easyjob.easyjob.DTO.ReporteProgramacionDTO(" +
           "u.idusuarios, " +
           "u.nombre, " +
           "u.apellido, " +
           "SUM(CASE WHEN p.esDominical = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.esDescanso = true THEN 1 ELSE 0 END), " +
           "COALESCE(SUM(p.horasExtra), 0.0)) " +
           "FROM Programacion p " +
           "JOIN p.usuario u " +
           "WHERE p.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY u.idusuarios, u.nombre, u.apellido " +
           "ORDER BY u.apellido, u.nombre")
    List<ReporteProgramacionDTO> obtenerReportePorRango(
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );

    /**
     * Obtener reporte de un empleado por rango de fechas
     */
    @Query("SELECT new com.easyjob.easyjob.DTO.ReporteProgramacionDTO(" +
           "u.idusuarios, " +
           "u.nombre, " +
           "u.apellido, " +
           "SUM(CASE WHEN p.esDominical = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.esDescanso = true THEN 1 ELSE 0 END), " +
           "COALESCE(SUM(p.horasExtra), 0.0)) " +
           "FROM Programacion p " +
           "JOIN p.usuario u " +
           "WHERE u.idusuarios = :idEmpleado " +
           "AND p.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY u.idusuarios, u.nombre, u.apellido")
    Optional<ReporteProgramacionDTO> obtenerReporteEmpleadoPorRango(
        @Param("idEmpleado") Long idEmpleado,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );
}