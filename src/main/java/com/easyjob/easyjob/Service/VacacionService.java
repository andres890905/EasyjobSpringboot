package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.DTO.VacacionDTO;
import com.easyjob.easyjob.Model.Usuario;
import com.easyjob.easyjob.Model.Vacacion;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.Repository.VacacionRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VacacionService {

    private final VacacionRepository vacacionRepository;
    private final UsuarioRepository usuarioRepository;

    public VacacionService(VacacionRepository vacacionRepository, UsuarioRepository usuarioRepository) {
        this.vacacionRepository = vacacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ====================================================
    // Crear una solicitud de vacaciones
    // ====================================================
    public VacacionDTO crearVacacion(VacacionDTO dto) {

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Vacacion vac = new Vacacion();
        vac.setUsuario(usuario);
        vac.setFechaInicio(dto.getFechaInicio());
        vac.setFechaFin(dto.getFechaFin());
        vac.setComentarios(dto.getComentarios());
        vac.setEstado("Pendiente"); // por defecto

        Vacacion guardada = vacacionRepository.save(vac);
        return mapToDTO(guardada);
    }

    // ====================================================
    // Buscar por ID
    // ====================================================
    public VacacionDTO obtenerPorId(Long id) {
        Vacacion vac = vacacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacación no encontrada"));
        return mapToDTO(vac);
    }

    // ====================================================
    // Buscar por Usuario
    // ====================================================
    public List<VacacionDTO> obtenerPorUsuario(Long idUsuario) {
        return vacacionRepository.findByUsuario_Idusuarios(idUsuario)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ====================================================
    // Buscar por estado
    // ====================================================
    public List<VacacionDTO> obtenerPorEstado(String estado) {
        return vacacionRepository.findByEstado(estado)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ====================================================
    // Obtener todas las vacaciones
    // ====================================================
    public List<VacacionDTO> obtenerTodas() {
        return vacacionRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ====================================================
    // Actualizar solicitud
    // ====================================================
    public VacacionDTO actualizarVacacion(Long id, VacacionDTO dto) {
        Vacacion vac = vacacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacación no encontrada"));

        vac.setFechaInicio(dto.getFechaInicio());
        vac.setFechaFin(dto.getFechaFin());
        vac.setComentarios(dto.getComentarios());

        Vacacion actualizada = vacacionRepository.save(vac);
        return mapToDTO(actualizada);
    }

    // ====================================================
    // Cambiar estado (Aprobado, Rechazado, Pendiente)
    // ====================================================
    public VacacionDTO cambiarEstado(Long id, String nuevoEstado) {
        Vacacion vac = vacacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vacación no encontrada"));

        vac.setEstado(nuevoEstado);

        return mapToDTO(vacacionRepository.save(vac));
    }

    // ====================================================
    // Obtener vacaciones por zona del supervisor
    // ====================================================
    public List<VacacionDTO> obtenerPorZonaSupervisor(Integer idSupervisor) {
        try {
            // Convertir Integer a Long
            Long idSupervisorLong = idSupervisor.longValue();
            
            // Usar el método optimizado que ya existe en el repositorio
            List<Usuario> empleados = usuarioRepository.findByZonaSupervisor(idSupervisorLong);
            
            if (empleados.isEmpty()) {
                return new ArrayList<>();
            }
            
            // Obtener todas las vacaciones de esos empleados
            return empleados.stream()
                    .flatMap(emp -> vacacionRepository.findByUsuario_Idusuarios(emp.getIdusuarios()).stream())
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener vacaciones por zona: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // ====================================================
    // Eliminar una solicitud
    // ====================================================
    public void eliminarVacacion(Long id) {
        vacacionRepository.deleteById(id);
    }

    // ====================================================
    // MAPEO ENTITY → DTO
    // ====================================================
    private VacacionDTO mapToDTO(Vacacion vac) {
        VacacionDTO dto = new VacacionDTO();

        dto.setIdVacacion(vac.getIdVacacion());
        dto.setIdUsuario(vac.getUsuario().getIdusuarios());
        dto.setNombreEmpleado(vac.getUsuario().getNombre() + " " + vac.getUsuario().getApellido());
        dto.setFechaInicio(vac.getFechaInicio());
        dto.setFechaFin(vac.getFechaFin());
        dto.setFechaSolicitud(vac.getFechaSolicitud());
        dto.setEstado(vac.getEstado());
        dto.setComentarios(vac.getComentarios());

        return dto;
    }
}
