package com.easyjob.easyjob.Controller;

import com.easyjob.easyjob.DTO.ReporteProgramacionDTO;
import com.easyjob.easyjob.Repository.ReporteProgramacionRepository;
import com.easyjob.easyjob.Service.ReporteProgramacionPDFService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reportes-programacion")
@CrossOrigin(origins = "*")
public class ReporteProgramacionController {

    @Autowired
    private ReporteProgramacionRepository repository;

    @Autowired
    private ReporteProgramacionPDFService pdfService;

    // ==================== ENDPOINTS PARA DATOS JSON ====================

    /**
     * Obtener datos de todos los empleados por mes/año
     */
    @GetMapping("/datos")
    public ResponseEntity<List<ReporteProgramacionDTO>> obtenerDatos(
            @RequestParam int mes,
            @RequestParam int anio) {
        try {
            List<ReporteProgramacionDTO> datos = repository.obtenerReporteMensual(mes, anio);
            return ResponseEntity.ok(datos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener datos de un empleado específico
     */
    @GetMapping("/datos/empleado/{idEmpleado}")
    public ResponseEntity<ReporteProgramacionDTO> obtenerDatosEmpleado(
            @PathVariable Long idEmpleado,
            @RequestParam int mes,
            @RequestParam int anio) {
        try {
            Optional<ReporteProgramacionDTO> dato = repository.obtenerReporteEmpleado(idEmpleado, mes, anio);
            return dato.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener datos por rango de fechas
     */
    @GetMapping("/datos/rango")
    public ResponseEntity<List<ReporteProgramacionDTO>> obtenerDatosPorRango(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDate inicio = LocalDate.parse(fechaInicio);
            LocalDate fin = LocalDate.parse(fechaFin);
            List<ReporteProgramacionDTO> datos = repository.obtenerReportePorRango(inicio, fin);
            return ResponseEntity.ok(datos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ==================== ENDPOINTS PARA GENERAR PDF ====================

    /**
     * Generar PDF de todos los empleados por mes/año
     */
    @GetMapping("/pdf")
    public ResponseEntity<byte[]> generarPDF(
            @RequestParam int mes,
            @RequestParam int anio) {
        try {
            List<ReporteProgramacionDTO> datos = repository.obtenerReporteMensual(mes, anio);

            if (datos.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            String periodo = String.format("%02d/%d", mes, anio);
            byte[] pdfBytes = pdfService.generarReporteCompleto(datos, periodo);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                String.format("reporte_programacion_%02d_%d.pdf", mes, anio));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar PDF de un empleado específico
     */
    @GetMapping("/pdf/empleado/{idEmpleado}")
    public ResponseEntity<byte[]> generarPDFEmpleado(
            @PathVariable Long idEmpleado,
            @RequestParam int mes,
            @RequestParam int anio) {
        try {
            Optional<ReporteProgramacionDTO> empleadoOpt = 
                repository.obtenerReporteEmpleado(idEmpleado, mes, anio);

            if (empleadoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String periodo = String.format("%02d/%d", mes, anio);
            byte[] pdfBytes = pdfService.generarReporteIndividual(empleadoOpt.get(), periodo);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                String.format("reporte_empleado_%d_%02d_%d.pdf", idEmpleado, mes, anio));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar PDF por rango de fechas
     */
    @GetMapping("/pdf/rango")
    public ResponseEntity<byte[]> generarPDFPorRango(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDate inicio = LocalDate.parse(fechaInicio);
            LocalDate fin = LocalDate.parse(fechaFin);
            
            List<ReporteProgramacionDTO> datos = repository.obtenerReportePorRango(inicio, fin);

            if (datos.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            String periodo = fechaInicio + " al " + fechaFin;
            byte[] pdfBytes = pdfService.generarReporteCompleto(datos, periodo);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                String.format("reporte_programacion_%s_%s.pdf", 
                    fechaInicio.replace("-", ""), fechaFin.replace("-", "")));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar PDF de un empleado por rango de fechas
     */
    @GetMapping("/pdf/empleado/{idEmpleado}/rango")
    public ResponseEntity<byte[]> generarPDFEmpleadoPorRango(
            @PathVariable Long idEmpleado,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDate inicio = LocalDate.parse(fechaInicio);
            LocalDate fin = LocalDate.parse(fechaFin);
            
            Optional<ReporteProgramacionDTO> empleadoOpt = 
                repository.obtenerReporteEmpleadoPorRango(idEmpleado, inicio, fin);

            if (empleadoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String periodo = fechaInicio + " al " + fechaFin;
            byte[] pdfBytes = pdfService.generarReporteIndividual(empleadoOpt.get(), periodo);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                String.format("reporte_empleado_%d_%s_%s.pdf", idEmpleado,
                    fechaInicio.replace("-", ""), fechaFin.replace("-", "")));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}