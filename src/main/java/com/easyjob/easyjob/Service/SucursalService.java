package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.Model.Sucursal;
import com.easyjob.easyjob.Repository.SucursalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SucursalService {

    @Autowired
    private SucursalRepository sucursalRepository;

    // ✅ 1. Obtener todas las sucursales
    public List<Sucursal> obtenerTodas() {
        return sucursalRepository.findAll();
    }

    // ✅ 2. Obtener sucursal por ID
    public Sucursal obtenerPorId(Long id) {
        Optional<Sucursal> sucursal = sucursalRepository.findById(id);
        return sucursal.orElse(null);
    }

    // ✅ 3. Crear nueva sucursal
    public Sucursal guardarSucursal(Sucursal sucursal) {
        // Validar datos obligatorios
        if (sucursal.getNombreSucursal() == null || sucursal.getNombreSucursal().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la sucursal es obligatorio");
        }

        // Validar duplicados
        Optional<Sucursal> existente = sucursalRepository.findByNombreSucursal(sucursal.getNombreSucursal());
        if (existente.isPresent()) {
            throw new RuntimeException("Ya existe una sucursal con ese nombre");
        }

        return sucursalRepository.save(sucursal);
    }

    // ✅ 4. Actualizar sucursal existente
    public boolean actualizarSucursal(Long id, Sucursal datosActualizados) {
        Optional<Sucursal> sucursalExistente = sucursalRepository.findById(id);

        if (sucursalExistente.isPresent()) {
            Sucursal sucursal = sucursalExistente.get();

            // Actualizar campos solo si vienen no nulos
            if (datosActualizados.getNombreSucursal() != null)
                sucursal.setNombreSucursal(datosActualizados.getNombreSucursal());
            if (datosActualizados.getDireccion() != null)
                sucursal.setDireccion(datosActualizados.getDireccion());
            if (datosActualizados.getCiudad() != null)
                sucursal.setCiudad(datosActualizados.getCiudad());
            if (datosActualizados.getCorreo() != null)
                sucursal.setCorreo(datosActualizados.getCorreo());
            if (datosActualizados.getTelefono() != null)
                sucursal.setTelefono(datosActualizados.getTelefono());
            if (datosActualizados.getId_zona() != null)
                sucursal.setId_zona(datosActualizados.getId_zona());

            sucursalRepository.save(sucursal);
            return true;
        }
        return false;
    }

    // ✅ 5. Eliminar sucursal
    public boolean eliminarSucursal(Long id) {
        Optional<Sucursal> sucursal = sucursalRepository.findById(id);
        if (sucursal.isPresent()) {
            sucursalRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ✅ 6. Buscar por nombre (opcional)
    public List<Sucursal> buscarPorNombre(String nombre) {
        return sucursalRepository.findByNombreSucursalContainingIgnoreCase(nombre);
    }

    // ✅ 7. Buscar por zona (ACTUALIZADO: ahora usa findByIdZona)
    public List<Sucursal> buscarPorZona(Long idZona) {
        return sucursalRepository.findByIdZona(idZona);
    }
}