package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.DTO.SucursalDTO;
import com.easyjob.easyjob.Model.Sucursal;
import com.easyjob.easyjob.Repository.SucursalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SucursalService {

    @Autowired
    private SucursalRepository sucursalRepository;

    // ✅ Obtener todas las sucursales
    public List<SucursalDTO> obtenerTodas() {
        return sucursalRepository.findAll().stream()
                .map(s -> {
                    SucursalDTO dto = new SucursalDTO();
                    dto.setIdSucursal(s.getId_sucursal());
                    dto.setIdZona(s.getId_zona());
                    dto.setNombreSucursal(s.getNombreSucursal());
                    dto.setDireccion(s.getDireccion());
                    dto.setCiudad(s.getCiudad());
                    dto.setCorreo(s.getCorreo());
                    dto.setTelefono(s.getTelefono());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ✅ Obtener sucursal por ID
    public SucursalDTO obtenerPorId(Long id) {
        return sucursalRepository.findById(id)
                .map(s -> {
                    SucursalDTO dto = new SucursalDTO();
                    dto.setIdSucursal(s.getId_sucursal());
                    dto.setIdZona(s.getId_zona());
                    dto.setNombreSucursal(s.getNombreSucursal());
                    dto.setDireccion(s.getDireccion());
                    dto.setCiudad(s.getCiudad());
                    dto.setCorreo(s.getCorreo());
                    dto.setTelefono(s.getTelefono());
                    return dto;
                })
                .orElse(null);
    }

    // ✅ Guardar nueva sucursal (Builder)
    public SucursalDTO guardarSucursal(SucursalDTO dto) {
        Sucursal nueva = new Sucursal.Builder()
                .idZona(dto.getIdZona())
                .nombreSucursal(dto.getNombreSucursal())
                .direccion(dto.getDireccion())
                .ciudad(dto.getCiudad())
                .correo(dto.getCorreo())
                .telefono(dto.getTelefono())
                .build();

        Sucursal guardada = sucursalRepository.save(nueva);

        // Convertir a DTO para devolver
        SucursalDTO guardadaDTO = new SucursalDTO();
        guardadaDTO.setIdSucursal(guardada.getId_sucursal());
        guardadaDTO.setIdZona(guardada.getId_zona());
        guardadaDTO.setNombreSucursal(guardada.getNombreSucursal());
        guardadaDTO.setDireccion(guardada.getDireccion());
        guardadaDTO.setCiudad(guardada.getCiudad());
        guardadaDTO.setCorreo(guardada.getCorreo());
        guardadaDTO.setTelefono(guardada.getTelefono());

        return guardadaDTO;
    }

    // ✅ Actualizar sucursal existente (sin Builder)
    public boolean actualizarSucursal(Long id, SucursalDTO dto) {
        Optional<Sucursal> sucursalOpt = sucursalRepository.findById(id);
        if (sucursalOpt.isEmpty()) {
            return false;
        }

        Sucursal existente = sucursalOpt.get();

        if (dto.getIdZona() != null) existente.setId_zona(dto.getIdZona());
        if (dto.getNombreSucursal() != null) existente.setNombreSucursal(dto.getNombreSucursal());
        if (dto.getDireccion() != null) existente.setDireccion(dto.getDireccion());
        if (dto.getCiudad() != null) existente.setCiudad(dto.getCiudad());
        if (dto.getCorreo() != null) existente.setCorreo(dto.getCorreo());
        if (dto.getTelefono() != null) existente.setTelefono(dto.getTelefono());

        sucursalRepository.save(existente);
        return true;
    }

    // ✅ Eliminar sucursal
    public boolean eliminarSucursal(Long id) {
        if (sucursalRepository.existsById(id)) {
            sucursalRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
