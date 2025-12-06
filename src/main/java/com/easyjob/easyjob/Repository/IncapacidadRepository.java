package com.easyjob.easyjob.Repository;

import com.easyjob.easyjob.Model.Incapacidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncapacidadRepository extends JpaRepository<Incapacidad, String> {

    // Buscar incapacidades por id de usuario
    List<Incapacidad> findByIdusuarios(Integer idusuarios);

    // ✅ CORREGIDO: Debe coincidir con el nombre del campo en la entidad
    List<Incapacidad> findByIdusuariosIn(List<Integer> idsUsuarios);

    // Buscar por estado
    List<Incapacidad> findByEstado(String estado);
}