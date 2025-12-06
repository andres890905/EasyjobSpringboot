package com.easyjob.easyjob.Repository;

import com.easyjob.easyjob.Model.Vacacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacacionRepository extends JpaRepository<Vacacion, Long> {

    // Obtener vacaciones por id de usuario
    List<Vacacion> findByUsuario_Idusuarios(Long idUsuario);

    // Obtener vacaciones por estado (Pendiente, Aprobado, Rechazado)
    List<Vacacion> findByEstado(String estado);

    // Obtener vacaciones por usuario y estado
    List<Vacacion> findByUsuario_IdusuariosAndEstado(Long idUsuario, String estado);
}
