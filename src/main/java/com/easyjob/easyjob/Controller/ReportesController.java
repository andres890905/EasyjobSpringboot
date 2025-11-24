package com.easyjob.easyjob.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyjob.easyjob.DTO.UsuarioDTO;
import com.easyjob.easyjob.Repository.UsuarioRepository;
import com.easyjob.easyjob.Service.ReportePDFServiceAvanzado;

/**
 * Controller para reportes de USUARIOS e INCAPACIDADES
 * Los reportes de PROGRAMACIÓN están en ReporteProgramacionController
 */
@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReportesController {
	
    private final UsuarioRepository usuarioRepository;
    private final ReportePDFServiceAvanzado reportePDFService;

    @Autowired
    public ReportesController(
            UsuarioRepository usuarioRepository,
            ReportePDFServiceAvanzado reportePDFService) {
        this.usuarioRepository = usuarioRepository;
        this.reportePDFService = reportePDFService;
    }

    // ==================== ENDPOINTS DE VISTA PREVIA ====================

    /**
     * Endpoint de vista previa para todos los empleados
     * GET /api/reportes/preview/empleados
     */
    @GetMapping("/preview/empleados")
    public ResponseEntity<List<UsuarioDTO>> previewEmpleados() {
        try {
            List<UsuarioDTO> usuarios = usuarioRepository.findAllUsuariosDTO();
            System.out.println("✅ Preview empleados: " + usuarios.size() + " registros");
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            System.err.println("❌ Error en preview empleados: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Endpoint genérico de vista previa por tipo de reporte
     * GET /api/reportes/preview/empleados/{tipo}
     * @param tipo - usuarios, incapacidades
     * NOTA: programacion tiene su propio controller en /api/reportes-programacion
     */
    @GetMapping("/preview/empleados/{tipo}")
    public ResponseEntity<?> previewPorTipo(@PathVariable String tipo) {
        System.out.println("🔍 Solicitando preview para tipo: " + tipo);
        
        try {
            switch (tipo.toLowerCase()) {
                case "usuarios":
                    List<UsuarioDTO> usuarios = usuarioRepository.findAllUsuariosDTO();
                    System.out.println("✅ Usuarios encontrados: " + usuarios.size());
                    return ResponseEntity.ok(usuarios);
                
                case "incapacidades":
                    // TODO: Implementar cuando tengas IncapacidadesRepository
                    System.out.println("⚠️ Incapacidades no implementado, retornando lista vacía");
                    return ResponseEntity.ok(List.of());
                
                case "programacion":
                    // Redirigir al nuevo controller
                    System.out.println("ℹ️ Los reportes de programación están en /api/reportes-programacion");
                    return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                        .body(Map.of(
                            "mensaje", "Los reportes de programación están en un endpoint separado",
                            "nuevoEndpoint", "/api/reportes-programacion/datos",
                            "documentacion", "Usa /api/reportes-programacion/datos?mes=11&anio=2025"
                        ));
                
                default:
                    System.err.println("❌ Tipo de reporte no válido: " + tipo);
                    return ResponseEntity.badRequest()
                        .body(Map.of(
                            "error", "Tipo de reporte no soportado en este endpoint",
                            "tipo", tipo,
                            "tiposValidos", List.of("usuarios", "incapacidades"),
                            "nota", "Para programación usa /api/reportes-programacion"
                        ));
            }
        } catch (Exception e) {
            System.err.println("❌ Error en previewPorTipo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", "Error al cargar datos",
                    "mensaje", e.getMessage(),
                    "tipo", e.getClass().getSimpleName()
                ));
        }
    }

    // ==================== ENDPOINTS DE GENERACIÓN DE PDF ====================

    /**
     * Endpoint para generar y descargar PDF con estadísticas
     * GET /api/reportes/pdf/{tipo}
     * @param tipo - usuarios, incapacidades
     * NOTA: programacion tiene su propio controller en /api/reportes-programacion
     * @return PDF como archivo descargable
     */
    @GetMapping("/pdf/{tipo}")
    public ResponseEntity<byte[]> generarPDF(@PathVariable String tipo) {
        System.out.println("📄 Generando PDF para tipo: " + tipo);
        
        try {
            byte[] pdfBytes;
            String nombreArchivo;
            String timestamp = java.time.LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
            );

            switch (tipo.toLowerCase()) {
                case "usuarios":
                    List<UsuarioDTO> usuarios = usuarioRepository.findAllUsuariosDTO();
                    
                    if (usuarios.isEmpty()) {
                        System.err.println("❌ No hay usuarios para generar el reporte");
                        return ResponseEntity.badRequest()
                            .contentType(MediaType.TEXT_PLAIN)
                            .body("No hay usuarios para generar el reporte".getBytes());
                    }
                    
                    System.out.println("=== GENERANDO PDF DE USUARIOS ===");
                    System.out.println("Total usuarios: " + usuarios.size());
                    
                    long activos = usuarios.stream()
                        .filter(u -> u.getEstado() != null && 
                                   u.getEstado().trim().equalsIgnoreCase("Activo"))
                        .count();
                    System.out.println("Activos: " + activos);
                    System.out.println("Inactivos: " + (usuarios.size() - activos));
                    
                    pdfBytes = reportePDFService.generarReporteUsuarios(usuarios);
                    nombreArchivo = "reporte_usuarios_" + timestamp + ".pdf";
                    
                    System.out.println("✅ PDF generado: " + nombreArchivo);
                    System.out.println("Tamaño: " + pdfBytes.length + " bytes");
                    System.out.println("==================================");
                    break;

                case "incapacidades":
                    System.err.println("❌ Reporte de incapacidades no implementado");
                    return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("El reporte de incapacidades aún no está implementado".getBytes());

                case "programacion":
                    // Redirigir al nuevo controller
                    System.out.println("ℹ️ Los reportes de programación están en /api/reportes-programacion");
                    return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(("{\"mensaje\":\"Los reportes de programación están en un endpoint separado\"," +
                              "\"nuevoEndpoint\":\"/api/reportes-programacion/pdf\"," +
                              "\"ejemplo\":\"GET /api/reportes-programacion/pdf?mes=11&anio=2025\"}").getBytes());

                default:
                    System.err.println("❌ Tipo de reporte no válido: " + tipo);
                    return ResponseEntity.badRequest()
                        .contentType(MediaType.TEXT_PLAIN)
                        .body(("Tipo de reporte no válido: " + tipo + 
                              ". Tipos válidos: usuarios, incapacidades. " +
                              "Para programación usa /api/reportes-programacion").getBytes());
            }

            // Configurar headers para descarga de PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", nombreArchivo);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("❌ Error generando PDF: " + e.getMessage());
            e.printStackTrace();
            
            String mensajeError = "Error generando PDF: " + e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.TEXT_PLAIN)
                .body(mensajeError.getBytes());
        }
    }

    /**
     * Endpoint para obtener estadísticas sin generar PDF
     * GET /api/reportes/estadisticas/{tipo}
     * @param tipo - usuarios, incapacidades
     * NOTA: programacion tiene su propio controller en /api/reportes-programacion
     * @return JSON con estadísticas
     */
    @GetMapping("/estadisticas/{tipo}")
    public ResponseEntity<?> obtenerEstadisticas(@PathVariable String tipo) {
        System.out.println("📊 Obteniendo estadísticas para: " + tipo);
        
        try {
            switch (tipo.toLowerCase()) {
                case "usuarios":
                    List<UsuarioDTO> usuarios = usuarioRepository.findAllUsuariosDTO();
                    
                    long totalUsuarios = usuarios.size();
                    long usuariosActivos = usuarios.stream()
                        .filter(u -> u.getEstado() != null && 
                                    u.getEstado().trim().equalsIgnoreCase("Activo"))
                        .count();
                    long usuariosInactivos = totalUsuarios - usuariosActivos;
                    
                    double salarioPromedio = usuarios.stream()
                        .filter(u -> u.getSalario() != null)
                        .mapToDouble(UsuarioDTO::getSalario)
                        .average()
                        .orElse(0.0);
                    
                    double nominaTotal = usuarios.stream()
                        .filter(u -> u.getSalario() != null)
                        .mapToDouble(UsuarioDTO::getSalario)
                        .sum();
                    
                    Map<String, Long> porEstado = usuarios.stream()
                        .collect(java.util.stream.Collectors.groupingBy(
                            u -> u.getEstado() != null ? u.getEstado() : "Sin Estado",
                            java.util.stream.Collectors.counting()
                        ));
                    
                    System.out.println("✅ Estadísticas calculadas para usuarios");
                    
                    return ResponseEntity.ok(Map.of(
                        "totalUsuarios", totalUsuarios,
                        "usuariosActivos", usuariosActivos,
                        "usuariosInactivos", usuariosInactivos,
                        "salarioPromedio", salarioPromedio,
                        "nominaTotal", nominaTotal,
                        "distribucionPorEstado", porEstado
                    ));
                
                case "incapacidades":
                    System.out.println("⚠️ Estadísticas de incapacidades no implementadas");
                    return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                        .body(Map.of(
                            "error", "Estadísticas de incapacidades no implementadas",
                            "mensaje", "Este módulo está en desarrollo"
                        ));
                
                case "programacion":
                    // Redirigir al nuevo controller
                    System.out.println("ℹ️ Las estadísticas de programación están en /api/reportes-programacion");
                    return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                        .body(Map.of(
                            "mensaje", "Las estadísticas de programación están en un endpoint separado",
                            "nuevoEndpoint", "/api/reportes-programacion/datos",
                            "ejemplo", "GET /api/reportes-programacion/datos?mes=11&anio=2025"
                        ));
                
                default:
                    System.err.println("❌ Tipo no soportado: " + tipo);
                    return ResponseEntity.badRequest()
                        .body(Map.of(
                            "error", "Tipo no soportado: " + tipo,
                            "tiposValidos", List.of("usuarios", "incapacidades"),
                            "nota", "Para programación usa /api/reportes-programacion"
                        ));
            }
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo estadísticas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", e.getMessage(),
                    "tipo", e.getClass().getSimpleName()
                ));
        }
    }

    /**
     * Endpoint de salud para verificar que el servicio está funcionando
     * GET /api/reportes/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "ReportesController",
            "descripcion", "Maneja reportes de Usuarios e Incapacidades",
            "nota", "Los reportes de Programación están en /api/reportes-programacion",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
}