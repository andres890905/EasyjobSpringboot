package com.easyjob.easyjob.Repository;

import com.easyjob.easyjob.Model.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SucursalRepository extends JpaRepository<Sucursal, Long> {

    Optional<Sucursal> findByNombreSucursal(String nombreSucursal);

    List<Sucursal> findByNombreSucursalContainingIgnoreCase(String nombre);

    @Query("SELECT s FROM Sucursal s WHERE s.id_zona = :idZona")
    List<Sucursal> findByIdZona(@Param("idZona") Long idZona);
}
