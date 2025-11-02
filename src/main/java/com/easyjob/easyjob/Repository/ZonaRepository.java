package com.easyjob.easyjob.Repository;

import com.easyjob.easyjob.Model.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Integer> {

    // Buscar zona por nombre exacto
    Optional<Zona> findByNombreZona(String nombreZona);

    // Buscar zonas por coincidencia de nombre (LIKE)
    List<Zona> findByNombreZonaContainingIgnoreCase(String nombre);

    // Buscar zonas por supervisor
    @Query("SELECT z FROM Zona z WHERE z.supervisor.idusuarios = :supervisorId")
    List<Zona> findBySupervisorId(Integer supervisorId);

    // Obtener todas las zonas con su supervisor cargado
    @Query("SELECT z FROM Zona z LEFT JOIN FETCH z.supervisor")
    List<Zona> findAllWithSupervisor();
}