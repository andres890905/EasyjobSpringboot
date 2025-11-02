package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Model.Zona;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.Repository.ZonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ZonaService {

    @Autowired
    private ZonaRepository zonaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ✅ 1. Obtener todas las zonas (con supervisor cargado)
    public List<Zona> obtenerTodas() {
        return zonaRepository.findAllWithSupervisor();
    }

    // ✅ 2. Obtener zona por ID
    public Zona obtenerPorId(Integer id) {
        Optional<Zona> zona = zonaRepository.findById(id);
        return zona.orElse(null);
    }

    // ✅ 3. Crear nueva zona
    public Zona guardarZona(Zona zona) {
        // Validar datos obligatorios
        if (zona.getNombreZona() == null || zona.getNombreZona().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la zona es obligatorio");
        }

        // Validar duplicados
        Optional<Zona> existente = zonaRepository.findByNombreZona(zona.getNombreZona());
        if (existente.isPresent() && !existente.get().getIdZona().equals(zona.getIdZona())) {
            throw new RuntimeException("Ya existe una zona con ese nombre");
        }

        return zonaRepository.save(zona);
    }

    // ✅ 4. Actualizar zona existente
    public boolean actualizarZona(Integer id, Zona datosActualizados) {
        Optional<Zona> zonaExistente = zonaRepository.findById(id);

        if (zonaExistente.isPresent()) {
            Zona zona = zonaExistente.get();

            // Actualizar campos solo si vienen no nulos
            if (datosActualizados.getNombreZona() != null) {
                zona.setNombreZona(datosActualizados.getNombreZona());
            }

            if (datosActualizados.getSupervisor() != null) {
                zona.setSupervisor(datosActualizados.getSupervisor());
            }

            zonaRepository.save(zona);
            return true;
        }
        return false;
    }

    // ✅ 5. Eliminar zona
    public boolean eliminarZona(Integer id) {
        Optional<Zona> zona = zonaRepository.findById(id);
        if (zona.isPresent()) {
            zonaRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ✅ 6. Buscar por nombre (opcional)
    public List<Zona> buscarPorNombre(String nombre) {
        return zonaRepository.findByNombreZonaContainingIgnoreCase(nombre);
    }

    // ✅ 7. Buscar por supervisor (opcional)
    public List<Zona> buscarPorSupervisor(Integer supervisorId) {
        return zonaRepository.findBySupervisorId(supervisorId);
    }

    // ✅ 8. Asignar supervisor a zona
    public Zona asignarSupervisor(Integer zonaId, Long supervisorId) {
        Optional<Zona> zonaOpt = zonaRepository.findById(zonaId);
        Optional<Usuario> supervisorOpt = usuarioRepository.findById(supervisorId);

        if (zonaOpt.isEmpty()) {
            throw new RuntimeException("Zona no encontrada");
        }

        if (supervisorOpt.isEmpty()) {
            throw new RuntimeException("Supervisor no encontrado");
        }

        Zona zona = zonaOpt.get();
        Usuario supervisor = supervisorOpt.get();

        // Validar que el usuario sea supervisor
        if (supervisor.getRol() == null || 
            !supervisor.getRol().getTipo_rol().equalsIgnoreCase("SUPERVISOR")) {
            throw new RuntimeException("El usuario seleccionado no es un supervisor");
        }

        zona.setSupervisor(supervisor);
        return zonaRepository.save(zona);
    }
}