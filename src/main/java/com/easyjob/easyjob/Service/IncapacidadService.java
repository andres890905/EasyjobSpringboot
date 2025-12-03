package com.easyjob.easyjob.Service;


import com.easyjob.easyjob.Repository.IncapacidadRepository;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.DTO.IncapacidadDTO;
import com.easyjob.easyjob.Model.Incapacidad;
import com.easyjob.easyjob.Model.Usuario;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncapacidadService {

    private final IncapacidadRepository incapacidadRepository;
    private final UsuarioRepository usuarioRepository;

    public IncapacidadService(
            IncapacidadRepository incapacidadRepository,
            UsuarioRepository usuarioRepository) {
        this.incapacidadRepository = incapacidadRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<IncapacidadDTO> listarIncapacidades() {
        return incapacidadRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public IncapacidadDTO obtenerPorId(String idIncapacidad) {
        return incapacidadRepository.findById(idIncapacidad)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<IncapacidadDTO> buscarPorUsuario(Integer idusuarios) {
        return incapacidadRepository.findByIdusuarios(idusuarios)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public IncapacidadDTO guardarIncapacidad(IncapacidadDTO dto) {
        Incapacidad incapacidad = convertToEntity(dto);

        // Generar ID automáticamente si no existe
        if (incapacidad.getIdIncapacidad() == null || incapacidad.getIdIncapacidad().isEmpty()) {
            String nuevoId = generarIdIncapacidad();
            incapacidad.setIdIncapacidad(nuevoId);
        }

        if (incapacidad.getEstado() == null) {
            incapacidad.setEstado("PENDIENTE");
        }

        return convertToDTO(incapacidadRepository.save(incapacidad));
    }

    // Generar ID único para incapacidad
    private String generarIdIncapacidad() {
        // Obtener el último ID y generar uno nuevo
        List<Incapacidad> todas = incapacidadRepository.findAll();
        if (todas.isEmpty()) {
            return "Incap001";
        }
        
        // Encontrar el número máximo
        int maxNum = 0;
        for (Incapacidad inc : todas) {
            String id = inc.getIdIncapacidad();
            if (id != null && id.startsWith("Incap")) {
                try {
                    int num = Integer.parseInt(id.substring(5));
                    if (num > maxNum) {
                        maxNum = num;
                    }
                } catch (NumberFormatException e) {
                    // Ignorar si no se puede parsear
                }
            }
        }
        
        return String.format("Incap%03d", maxNum + 1);
    }

    public IncapacidadDTO actualizarIncapacidad(String idIncapacidad, IncapacidadDTO dto) {
        return incapacidadRepository.findById(idIncapacidad)
                .map(incapacidad -> {

                    if (dto.getNombreEmpleado() != null)
                        incapacidad.setNombreEmpleado(dto.getNombreEmpleado());

                    if (dto.getNombreEps() != null)
                        incapacidad.setNombreEps(dto.getNombreEps());

                    if (dto.getMotivo() != null)
                        incapacidad.setMotivo(dto.getMotivo());

                    if (dto.getFechaInicio() != null)
                        incapacidad.setFechaInicio(Date.valueOf(dto.getFechaInicio()));

                    if (dto.getFechaFin() != null)
                        incapacidad.setFechaFin(Date.valueOf(dto.getFechaFin()));

                    if (dto.getArchivoSoporte() != null)
                        incapacidad.setArchivoSoporte(dto.getArchivoSoporte());

                    if (dto.getIdusuarios() != null)
                        incapacidad.setIdusuarios(dto.getIdusuarios());

                    if (dto.getEstado() != null)
                        incapacidad.setEstado(dto.getEstado());

                    return convertToDTO(incapacidadRepository.save(incapacidad));
                })
                .orElse(null);
    }

    public void eliminarIncapacidad(String idIncapacidad) {
        incapacidadRepository.deleteById(idIncapacidad);
    }

    // ✅ MÉTODO CORREGIDO: Listar incapacidades por zona del supervisor
    public List<IncapacidadDTO> listarPorZonaSupervisor(Integer idSupervisor) {
        try {
            // ✅ Convertir Integer a Long
            Long idSupervisorLong = idSupervisor.longValue();
            
            // ✅ Usar el método optimizado que ya tienes
            List<Usuario> empleados = usuarioRepository.findByZonaSupervisor(idSupervisorLong);
            
            if (empleados.isEmpty()) {
                System.out.println("⚠️ No se encontraron empleados para el supervisor: " + idSupervisor);
                return new ArrayList<>();
            }
            
            System.out.println("✅ Empleados encontrados: " + empleados.size());
            
            // Obtener IDs de los empleados (convertir Long a Integer)
            List<Integer> idsEmpleados = empleados.stream()
                .map(u -> u.getIdusuarios().intValue()) // ✅ Convertir Long a Integer
                .collect(Collectors.toList());
            
            System.out.println("📋 IDs de empleados: " + idsEmpleados);
            
            // Buscar incapacidades de esos empleados
            List<Incapacidad> incapacidades = incapacidadRepository.findByIdusuariosIn(idsEmpleados);
            
            System.out.println("📄 Incapacidades encontradas: " + incapacidades.size());
            
            // Convertir a DTO
            return incapacidades.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            System.err.println("❌ Error al listar incapacidades por supervisor: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private IncapacidadDTO convertToDTO(Incapacidad incapacidad) {
        IncapacidadDTO dto = new IncapacidadDTO();
        dto.setIdIncapacidad(incapacidad.getIdIncapacidad());
        dto.setIdusuarios(incapacidad.getIdusuarios());
        dto.setNombreEmpleado(incapacidad.getNombreEmpleado());
        dto.setNombreEps(incapacidad.getNombreEps());
        dto.setMotivo(incapacidad.getMotivo());
        dto.setFechaInicio(incapacidad.getFechaInicio().toString());
        dto.setFechaFin(incapacidad.getFechaFin().toString());
        dto.setArchivoSoporte(incapacidad.getArchivoSoporte());
        dto.setEstado(incapacidad.getEstado());
        return dto;
    }

    private Incapacidad convertToEntity(IncapacidadDTO dto) {
        Incapacidad incapacidad = new Incapacidad();
        incapacidad.setIdIncapacidad(dto.getIdIncapacidad());
        incapacidad.setIdusuarios(dto.getIdusuarios());
        incapacidad.setNombreEmpleado(dto.getNombreEmpleado());
        incapacidad.setNombreEps(dto.getNombreEps());
        incapacidad.setMotivo(dto.getMotivo());

        if (dto.getFechaInicio() != null)
            incapacidad.setFechaInicio(Date.valueOf(dto.getFechaInicio()));

        if (dto.getFechaFin() != null)
            incapacidad.setFechaFin(Date.valueOf(dto.getFechaFin()));

        incapacidad.setArchivoSoporte(dto.getArchivoSoporte());
        incapacidad.setEstado(dto.getEstado());

        return incapacidad;
    }

    public String guardarArchivo(MultipartFile archivo) throws IOException {
        // Crear directorio de uploads si no existe
        String uploadDir = "uploads/incapacidades";
        Path uploadPath = Paths.get(uploadDir);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String originalFilename = archivo.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Guardar archivo en el disco
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.write(filePath, archivo.getBytes());
        
        // Retornar el nombre del archivo guardado
        return uniqueFilename;
    }

    public byte[] obtenerArchivo(String nombreArchivo) throws IOException {
        Path filePath = Paths.get("uploads/incapacidades").resolve(nombreArchivo);
        
        if (!Files.exists(filePath)) {
            throw new IOException("Archivo no encontrado: " + nombreArchivo);
        }
        
        return Files.readAllBytes(filePath);
    }
}