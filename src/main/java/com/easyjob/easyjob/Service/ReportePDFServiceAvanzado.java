package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.DTO.UsuarioDTO;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PiePlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportePDFServiceAvanzado {

    private static final Font TITULO_FONT = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, new BaseColor(33, 37, 41));
    private static final Font SUBTITULO_FONT = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(52, 58, 64));
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
    private static final Font STAT_NUMBER_FONT = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(0, 123, 255));

    public byte[] generarReporteUsuarios(List<UsuarioDTO> usuarios) throws Exception {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Encabezado con logo y título
            agregarEncabezadoAvanzado(document, "REPORTE DE USUARIOS", usuarios.size());

            document.add(new Paragraph(" "));

            // Dashboard de estadísticas visuales
            agregarDashboardEstadisticas(document, usuarios);

            document.add(Chunk.NEWLINE);

            // Gráficos de distribución CON JFREECHART
            agregarGraficosDistribucionJFreeChart(document, usuarios);

            // Nueva página para la tabla
            document.newPage();

            // Tabla de usuarios
            agregarTablaUsuariosAvanzada(document, usuarios);

            // Pie de página
            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    private void agregarEncabezadoAvanzado(Document document, String titulo, int totalRegistros) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{3, 1});

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPadding(10);
        
        Paragraph titleP = new Paragraph();
        titleP.add(new Chunk("EasyJob\n", new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(0, 123, 255))));
        titleP.add(new Chunk(titulo + "\n", TITULO_FONT));
        titleP.add(new Chunk("Sistema de Gestión de Personal", new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.GRAY)));
        leftCell.addElement(titleP);
        
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPadding(10);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        Paragraph infoP = new Paragraph();
        infoP.add(new Chunk("Total Registros\n", NORMAL_FONT));
        infoP.add(new Chunk(String.valueOf(totalRegistros), STAT_NUMBER_FONT));
        infoP.add(new Chunk("\n" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), 
            new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.GRAY)));
        rightCell.addElement(infoP);
        
        headerTable.addCell(rightCell);

        document.add(headerTable);

        LineSeparator line = new LineSeparator();
        line.setLineColor(new BaseColor(0, 123, 255));
        line.setLineWidth(2);
        document.add(new Chunk(line));
        document.add(new Paragraph(" "));
    }

    private void agregarDashboardEstadisticas(Document document, List<UsuarioDTO> usuarios) throws DocumentException {
        long totalUsuarios = usuarios.size();
        
        long usuariosActivos = usuarios.stream()
            .filter(u -> u.getEstado() != null && 
                        u.getEstado().trim().equalsIgnoreCase("Activo"))
            .count();
        
        long usuariosInactivos = totalUsuarios - usuariosActivos;

        PdfPTable metricsTable = new PdfPTable(3);
        metricsTable.setWidthPercentage(100);
        metricsTable.setSpacingAfter(15f);

        agregarMetricaCard(metricsTable, "Total Usuarios", String.valueOf(totalUsuarios), 
            new BaseColor(0, 123, 255));
        agregarMetricaCard(metricsTable, "Activos", String.valueOf(usuariosActivos), 
            new BaseColor(40, 167, 69));
        agregarMetricaCard(metricsTable, "Inactivos", String.valueOf(usuariosInactivos), 
            new BaseColor(220, 53, 69));

        document.add(metricsTable);
    }

    private void agregarMetricaCard(PdfPTable table, String label, String value, BaseColor color) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(15);
        cell.setBackgroundColor(new BaseColor(248, 249, 250));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", 
            new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.GRAY)));
        p.add(new Chunk(value, 
            new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, color)));
        
        cell.addElement(p);
        table.addCell(cell);
    }

    /**
     * NUEVO MÉTODO: Gráficos con JFreeChart
     */
    private void agregarGraficosDistribucionJFreeChart(Document document, List<UsuarioDTO> usuarios) throws Exception {
        Paragraph titulo = new Paragraph("ANÁLISIS GRÁFICO DE DISTRIBUCIÓN\n\n", SUBTITULO_FONT);
        document.add(titulo);

        // Calcular estadísticas
        long activos = usuarios.stream()
            .filter(u -> u.getEstado() != null && u.getEstado().trim().equalsIgnoreCase("Activo"))
            .count();
        long inactivos = usuarios.size() - activos;

        Map<String, Long> porRol = usuarios.stream()
            .collect(Collectors.groupingBy(
                u -> u.getRol() != null ? u.getRol() : "Sin Rol",
                Collectors.counting()
            ));

        Map<String, Long> porSucursal = usuarios.stream()
            .collect(Collectors.groupingBy(
                u -> u.getSucursal() != null ? u.getSucursal() : "Sin Sucursal",
                Collectors.counting()
            ));

        // Crear tabla con 3 columnas para los gráficos
        PdfPTable graficosTable = new PdfPTable(3);
        graficosTable.setWidthPercentage(100);
        graficosTable.setSpacingAfter(10f);

        // 1. Gráfico de Torta - Estados
        JFreeChart pieChartEstados = crearGraficoTortaEstados(activos, inactivos);
        Image pieImageEstados = convertirChartAImagen(pieChartEstados, 250, 250);
        PdfPCell cellPie = new PdfPCell();
        cellPie.setBorder(Rectangle.BOX);
        cellPie.setPadding(10);
        cellPie.addElement(new Paragraph("Estados (Activos/Inactivos)\n", 
            new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellPie.addElement(pieImageEstados);
        graficosTable.addCell(cellPie);

        // 2. Gráfico de Barras - Roles
        JFreeChart barChartRoles = crearGraficoBarras(porRol, "Distribución por Rol", "Rol", new Color(0, 123, 255));
        Image barImageRoles = convertirChartAImagen(barChartRoles, 250, 250);
        PdfPCell cellRoles = new PdfPCell();
        cellRoles.setBorder(Rectangle.BOX);
        cellRoles.setPadding(10);
        cellRoles.addElement(new Paragraph("Distribución por Rol\n", 
            new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellRoles.addElement(barImageRoles);
        graficosTable.addCell(cellRoles);

        // 3. Gráfico de Barras - Sucursales
        JFreeChart barChartSucursales = crearGraficoBarras(porSucursal, "Distribución por Sucursal", "Sucursal", new Color(40, 167, 69));
        Image barImageSucursales = convertirChartAImagen(barChartSucursales, 250, 250);
        PdfPCell cellSucursales = new PdfPCell();
        cellSucursales.setBorder(Rectangle.BOX);
        cellSucursales.setPadding(10);
        cellSucursales.addElement(new Paragraph("Distribución por Sucursal\n", 
            new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        cellSucursales.addElement(barImageSucursales);
        graficosTable.addCell(cellSucursales);

        document.add(graficosTable);
    }

    /**
     * NUEVO: Crear gráfico de torta para estados
     */
    private JFreeChart crearGraficoTortaEstados(long activos, long inactivos) {
        DefaultPieDataset dataset = new DefaultPieDataset();
        dataset.setValue("Activos", activos);
        dataset.setValue("Inactivos", inactivos);

        JFreeChart chart = ChartFactory.createPieChart(
            null, // Sin título (lo ponemos arriba)
            dataset,
            true,  // Mostrar leyenda
            true,
            false
        );

        // Personalizar colores
        PiePlot plot = (PiePlot) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setSectionPaint("Activos", new Color(40, 167, 69));
        plot.setSectionPaint("Inactivos", new Color(220, 53, 69));
        
        // Etiquetas con porcentaje
        plot.setLabelGenerator(new org.jfree.chart.labels.StandardPieSectionLabelGenerator(
            "{0}: {1} ({2})", 
            new java.text.DecimalFormat("0"), 
            new java.text.DecimalFormat("0.0%")
        ));

        return chart;
    }

    /**
     * NUEVO: Crear gráfico de barras genérico
     */
    private JFreeChart crearGraficoBarras(Map<String, Long> datos, String titulo, String categoriaLabel, Color color) {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        // Agregar datos al dataset
        datos.forEach((key, value) -> {
            String label = key.length() > 15 ? key.substring(0, 12) + "..." : key;
            dataset.addValue(value, "Cantidad", label);
        });

        JFreeChart chart = ChartFactory.createBarChart(
            null, // Sin título
            categoriaLabel,
            "Cantidad",
            dataset,
            PlotOrientation.VERTICAL,
            false, // Sin leyenda
            true,
            false
        );

        // Personalizar
        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);
        plot.setOutlineVisible(false);
        
        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, color);

        return chart;
    }

    /**
     * NUEVO: Convertir JFreeChart a imagen para iText
     */
    private Image convertirChartAImagen(JFreeChart chart, int width, int height) throws Exception {
        BufferedImage bufferedImage = chart.createBufferedImage(width, height);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(bufferedImage, "png", baos);
        return Image.getInstance(baos.toByteArray());
    }

    private void agregarTablaUsuariosAvanzada(Document document, List<UsuarioDTO> usuarios) throws DocumentException {
        Paragraph titulo = new Paragraph("LISTADO DETALLADO DE USUARIOS\n\n", SUBTITULO_FONT);
        document.add(titulo);

        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.8f, 2.5f, 2.5f, 1.5f, 2.5f, 1.2f, 1.5f, 1.5f, 1.5f});

        String[] headers = {"Cedula", "Nombre", "Correo", "Teléfono", "Dirección", 
                           "Estado", "Salario", "Sucursal", "Rol"};
        
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
            cell.setBackgroundColor(new BaseColor(52, 58, 64));
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        int rowIndex = 0;
        for (UsuarioDTO usuario : usuarios) {
            BaseColor bgColor = rowIndex % 2 == 0 ? BaseColor.WHITE : new BaseColor(248, 249, 250);
            
            agregarCeldaConColor(table, String.valueOf(usuario.getId()), bgColor);
            agregarCeldaConColor(table, usuario.getNombreCompleto(), bgColor);
            agregarCeldaConColor(table, usuario.getCorreo(), bgColor);
            agregarCeldaConColor(table, usuario.getTelefono(), bgColor);
            agregarCeldaConColor(table, usuario.getDireccion(), bgColor);
            
            String estadoUsuario = usuario.getEstado() != null ? usuario.getEstado().trim() : "N/A";
            boolean esActivo = estadoUsuario.equalsIgnoreCase("Activo");
            
            PdfPCell estadoCell = new PdfPCell(new Phrase(estadoUsuario, 
                new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE)));
            estadoCell.setBackgroundColor(esActivo ? 
                new BaseColor(40, 167, 69) : new BaseColor(220, 53, 69));
            estadoCell.setPadding(5);
            estadoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(estadoCell);
            
            agregarCeldaConColor(table, usuario.getSalario() != null ? 
                String.format("$%,.2f", usuario.getSalario()) : "N/A", bgColor);
            agregarCeldaConColor(table, usuario.getSucursal(), bgColor);
            agregarCeldaConColor(table, usuario.getRol(), bgColor);
            
            rowIndex++;
        }

        document.add(table);
    }

    private void agregarCeldaConColor(PdfPTable table, String texto, BaseColor bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "N/A", NORMAL_FONT));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void agregarPiePagina(Document document) throws DocumentException {
        Paragraph footer = new Paragraph();
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(20f);
        
        LineSeparator line = new LineSeparator();
        line.setLineColor(BaseColor.LIGHT_GRAY);
        line.setLineWidth(1);
        document.add(new Chunk(line));
        
        document.add(new Paragraph(" "));
        
        footer.add(new Chunk("EasyJob © 2025 - Sistema de Gestión de Personal\n", 
            new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, new BaseColor(52, 58, 64))));
        footer.add(new Chunk("Documento generado automáticamente el " + 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) + "\n",
            new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC, BaseColor.GRAY)));
        footer.add(new Chunk("Este documento contiene información confidencial de la empresa", 
            new Font(Font.FontFamily.HELVETICA, 7, Font.NORMAL, BaseColor.GRAY)));
        
        document.add(footer);
    }
    
    private void validarDatos(List<?> datos) throws IllegalArgumentException {
        if (datos == null) {
            throw new IllegalArgumentException("La lista de datos no puede ser null");
        }
        if (datos.isEmpty()) {
            throw new IllegalArgumentException("La lista de datos está vacía");
        }
    }
    
    public byte[] generarReporteUsuariosSeguro(List<UsuarioDTO> usuarios) throws Exception {
        try {
            validarDatos(usuarios);
            return generarReporteUsuarios(usuarios);
        } catch (IllegalArgumentException e) {
            System.err.println("Error de validación: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Error generando reporte de usuarios: " + e.getMessage());
            throw new Exception("No se pudo generar el reporte de usuarios", e);
        }
    }
}