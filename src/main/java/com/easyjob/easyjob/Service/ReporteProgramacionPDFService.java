package com.easyjob.easyjob.Service;

import com.easyjob.easyjob.DTO.ReporteProgramacionDTO;
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
import java.util.Comparator;
import java.util.List;

@Service
public class ReporteProgramacionPDFService {

    private static final Font TITULO_FONT = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, new BaseColor(33, 37, 41));
    private static final Font SUBTITULO_FONT = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(52, 58, 64));
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
    private static final int MIN_EMPLEADOS_PARA_GRAFICAS = 3; // Mínimo para mostrar gráficas

    /**
     * Generar PDF con lista de empleados y gráficas (solo si hay suficientes datos)
     */
    public byte[] generarReporteCompleto(List<ReporteProgramacionDTO> datos, 
                                        String periodo) throws Exception {
        validarDatos(datos);
        
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            agregarEncabezado(document, periodo, datos.size());
            document.add(new Paragraph(" "));

            agregarEstadisticas(document, datos);
            document.add(new Paragraph(" "));

            // Solo mostrar gráficas si hay suficientes datos
            if (datos.size() >= MIN_EMPLEADOS_PARA_GRAFICAS) {
                agregarGraficas(document, datos);
                document.add(new Paragraph(" "));
            }

            agregarTabla(document, datos);
            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    /**
     * Generar PDF para un solo empleado con gráficas
     */
    public byte[] generarReporteIndividual(ReporteProgramacionDTO empleado, 
                                          String periodo) throws Exception {
        if (empleado == null) {
            throw new IllegalArgumentException("Los datos del empleado no pueden ser null");
        }

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            agregarEncabezadoIndividual(document, empleado, periodo);
            document.add(new Paragraph(" "));

            agregarMetricasIndividuales(document, empleado);
            document.add(new Paragraph(" "));
            
            // Agregar gráficas individuales
            agregarGraficasIndividuales(document, empleado);
            
            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    /**
     * Agregar gráficas al reporte completo (mejorado)
     */
    private void agregarGraficas(Document document, List<ReporteProgramacionDTO> datos) throws Exception {
        Paragraph titulo = new Paragraph("ANÁLISIS GRÁFICO\n\n", SUBTITULO_FONT);
        document.add(titulo);

        // Tabla para organizar las gráficas lado a lado
        PdfPTable graficasTable = new PdfPTable(2);
        graficasTable.setWidthPercentage(100);
        graficasTable.setSpacingAfter(15f);

        // Gráfica de barras (Top empleados)
        PdfPCell barCell = new PdfPCell();
        barCell.setBorder(Rectangle.NO_BORDER);
        barCell.setPadding(5);
        JFreeChart barChart = crearGraficoBarras(datos);
        Image barImage = convertirChartAImagen(barChart, 280, 220);
        barImage.setAlignment(Element.ALIGN_CENTER);
        barCell.addElement(barImage);
        graficasTable.addCell(barCell);

        // Gráfica de pastel (Distribución)
        PdfPCell pieCell = new PdfPCell();
        pieCell.setBorder(Rectangle.NO_BORDER);
        pieCell.setPadding(5);
        JFreeChart pieChart = crearGraficoPastel(datos);
        Image pieImage = convertirChartAImagen(pieChart, 280, 220);
        pieImage.setAlignment(Element.ALIGN_CENTER);
        pieCell.addElement(pieImage);
        graficasTable.addCell(pieCell);

        document.add(graficasTable);
    }

    /**
     * Crear gráfico de barras comparativo (optimizado)
     */
    private JFreeChart crearGraficoBarras(List<ReporteProgramacionDTO> datos) {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        // Limitar a top 5 para mejor visualización
        int limite = Math.min(5, datos.size());
        datos.stream()
            .sorted(Comparator.comparingDouble(ReporteProgramacionDTO::getTotalHorasExtra).reversed())
            .limit(limite)
            .forEach(dto -> {
                String nombreCorto = dto.getNombre().substring(0, Math.min(8, dto.getNombre().length()));
                dataset.addValue(dto.getTotalHorasExtra(), "H. Extra", nombreCorto);
                dataset.addValue(dto.getTotalDominicales(), "Dominic.", nombreCorto);
                dataset.addValue(dto.getTotalDescansos(), "Descanso", nombreCorto);
            });

        JFreeChart chart = ChartFactory.createBarChart(
            "Top " + limite + " Empleados",
            "Empleados",
            "Cantidad",
            dataset,
            PlotOrientation.VERTICAL,
            true,
            false,
            false
        );

        // Personalizar
        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);
        plot.setOutlineVisible(false);
        
        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, new Color(40, 167, 69));
        renderer.setSeriesPaint(1, new Color(23, 162, 184));
        renderer.setSeriesPaint(2, new Color(255, 193, 7));

        return chart;
    }

    /**
     * Crear gráfico de pastel - Distribución por Horas Extra
     */
    private JFreeChart crearGraficoPastel(List<ReporteProgramacionDTO> datos) {
        DefaultPieDataset dataset = new DefaultPieDataset();

        // Distribución por rangos de horas extra
        long sinHorasExtra = datos.stream().filter(d -> d.getTotalHorasExtra() == 0).count();
        long pocasHorasExtra = datos.stream().filter(d -> d.getTotalHorasExtra() > 0 && d.getTotalHorasExtra() <= 10).count();
        long mediasHorasExtra = datos.stream().filter(d -> d.getTotalHorasExtra() > 10 && d.getTotalHorasExtra() <= 30).count();
        long muchasHorasExtra = datos.stream().filter(d -> d.getTotalHorasExtra() > 30).count();

        if (sinHorasExtra > 0) dataset.setValue("Sin horas extra", sinHorasExtra);
        if (pocasHorasExtra > 0) dataset.setValue("1-10 horas", pocasHorasExtra);
        if (mediasHorasExtra > 0) dataset.setValue("11-30 horas", mediasHorasExtra);
        if (muchasHorasExtra > 0) dataset.setValue("30+ horas", muchasHorasExtra);

        JFreeChart chart = ChartFactory.createPieChart(
            "Distribución por Horas Extra",
            dataset,
            true,
            false,
            false
        );

        PiePlot plot = (PiePlot) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setSectionPaint("Sin horas extra", new Color(108, 117, 125));
        plot.setSectionPaint("1-10 horas", new Color(23, 162, 184));
        plot.setSectionPaint("11-30 horas", new Color(255, 193, 7));
        plot.setSectionPaint("30+ horas", new Color(220, 53, 69));
        
        // Mostrar porcentajes
        plot.setLabelGenerator(new org.jfree.chart.labels.StandardPieSectionLabelGenerator(
            "{0}: {1} ({2})", 
            new java.text.DecimalFormat("0"), 
            new java.text.DecimalFormat("0%")
        ));

        return chart;
    }

    /**
     * Convertir JFreeChart a imagen para iText
     */
    private Image convertirChartAImagen(JFreeChart chart, int width, int height) throws Exception {
        BufferedImage bufferedImage = chart.createBufferedImage(width, height);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(bufferedImage, "png", baos);
        return Image.getInstance(baos.toByteArray());
    }

    /**
     * NUEVO: Agregar gráficas para reporte individual
     */
    private void agregarGraficasIndividuales(Document document, ReporteProgramacionDTO empleado) throws Exception {
        Paragraph titulo = new Paragraph("ANÁLISIS GRÁFICO\n\n", SUBTITULO_FONT);
        document.add(titulo);

        // Tabla para organizar las gráficas lado a lado
        PdfPTable graficasTable = new PdfPTable(2);
        graficasTable.setWidthPercentage(100);
        graficasTable.setSpacingAfter(15f);

        // Gráfica de TORTA - Descansos vs Dominicales
        PdfPCell pieCell = new PdfPCell();
        pieCell.setBorder(Rectangle.NO_BORDER);
        pieCell.setPadding(5);
        JFreeChart pieChart = crearGraficoTortaIndividual(empleado);
        Image pieImage = convertirChartAImagen(pieChart, 280, 220);
        pieImage.setAlignment(Element.ALIGN_CENTER);
        pieCell.addElement(pieImage);
        graficasTable.addCell(pieCell);

        // Gráfica de BARRAS - Todas las métricas
        PdfPCell barCell = new PdfPCell();
        barCell.setBorder(Rectangle.NO_BORDER);
        barCell.setPadding(5);
        JFreeChart barChart = crearGraficoBarrasIndividual(empleado);
        Image barImage = convertirChartAImagen(barChart, 280, 220);
        barImage.setAlignment(Element.ALIGN_CENTER);
        barCell.addElement(barImage);
        graficasTable.addCell(barCell);

        document.add(graficasTable);
    }

    /**
     * NUEVO: Crear gráfico de torta para empleado individual
     */
    private JFreeChart crearGraficoTortaIndividual(ReporteProgramacionDTO empleado) {
        DefaultPieDataset dataset = new DefaultPieDataset();
        
        long descansos = empleado.getTotalDescansos();
        long dominicales = empleado.getTotalDominicales();
        
        if (descansos > 0) dataset.setValue("Descansos", descansos);
        if (dominicales > 0) dataset.setValue("Dominicales", dominicales);
        
        // Si no hay datos, agregar un valor placeholder
        if (descansos == 0 && dominicales == 0) {
            dataset.setValue("Sin datos", 1);
        }

        JFreeChart chart = ChartFactory.createPieChart(
            "Descansos vs Dominicales",
            dataset,
            true,
            false,
            false
        );

        // Aumentar calidad de fuentes
        chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 16));

        PiePlot plot = (PiePlot) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setSectionPaint("Descansos", new Color(255, 193, 7));
        plot.setSectionPaint("Dominicales", new Color(23, 162, 184));
        plot.setSectionPaint("Sin datos", new Color(200, 200, 200));
        
        // Configurar fuente de etiquetas más grande y clara
        plot.setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 14));
        plot.setLabelGenerator(new org.jfree.chart.labels.StandardPieSectionLabelGenerator(
            "{0}: {1} ({2})", 
            new java.text.DecimalFormat("0"), 
            new java.text.DecimalFormat("0%")
        ));
        
        // Configurar fuente de leyenda
        chart.getLegend().setItemFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 13));

        return chart;
    }

    /**
     * NUEVO: Crear gráfico de barras para empleado individual
     */
    private JFreeChart crearGraficoBarrasIndividual(ReporteProgramacionDTO empleado) {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        
        dataset.addValue(empleado.getTotalHorasExtra(), "Cantidad", "Horas Extra");
        dataset.addValue(empleado.getTotalDescansos(), "Cantidad", "Descansos");
        dataset.addValue(empleado.getTotalDominicales(), "Cantidad", "Dominicales");

        JFreeChart chart = ChartFactory.createBarChart(
            "Distribución de Métricas",
            "Tipo",
            "Cantidad",
            dataset,
            PlotOrientation.VERTICAL,
            false,
            false,
            false
        );

        // Aumentar calidad de fuentes
        chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 16));

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);
        plot.setOutlineVisible(false);
        
        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, new Color(0, 123, 255));
        
        // Configurar fuentes de ejes más grandes y claras
        plot.getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 13));
        plot.getDomainAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 14));
        plot.getRangeAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 13));
        plot.getRangeAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 14));

        return chart;
    }

    private void agregarEncabezado(Document document, String periodo, int total) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{3, 1});

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setPadding(10);
        
        Paragraph titleP = new Paragraph();
        titleP.add(new Chunk("EasyJob\n", new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(0, 123, 255))));
        titleP.add(new Chunk("REPORTE DE PROGRAMACIÓN\n", TITULO_FONT));
        titleP.add(new Chunk("Período: " + periodo, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.GRAY)));
        leftCell.addElement(titleP);
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setPadding(10);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        
        Paragraph infoP = new Paragraph();
        infoP.add(new Chunk("Total Empleados\n", NORMAL_FONT));
        infoP.add(new Chunk(String.valueOf(total), new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, new BaseColor(0, 123, 255))));
        infoP.add(new Chunk("\n" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), 
            new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.GRAY)));
        rightCell.addElement(infoP);
        headerTable.addCell(rightCell);

        document.add(headerTable);

        LineSeparator line = new LineSeparator();
        line.setLineColor(new BaseColor(0, 123, 255));
        line.setLineWidth(2);
        document.add(new Chunk(line));
    }

    private void agregarEstadisticas(Document document, List<ReporteProgramacionDTO> datos) throws DocumentException {
        long totalDominicales = datos.stream().mapToLong(ReporteProgramacionDTO::getTotalDominicales).sum();
        long totalDescansos = datos.stream().mapToLong(ReporteProgramacionDTO::getTotalDescansos).sum();
        double totalHorasExtra = datos.stream().mapToDouble(ReporteProgramacionDTO::getTotalHorasExtra).sum();

        PdfPTable statsTable = new PdfPTable(3);
        statsTable.setWidthPercentage(100);
        statsTable.setSpacingAfter(15f);

        agregarMetricaCard(statsTable, "Total Dominicales", String.valueOf(totalDominicales), new BaseColor(23, 162, 184));
        agregarMetricaCard(statsTable, "Total Descansos", String.valueOf(totalDescansos), new BaseColor(255, 193, 7));
        agregarMetricaCard(statsTable, "Total Horas Extra", String.format("%.1f hrs", totalHorasExtra), new BaseColor(40, 167, 69));

        document.add(statsTable);
    }

    private void agregarMetricaCard(PdfPTable table, String label, String value, BaseColor color) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(15);
        cell.setBackgroundColor(new BaseColor(248, 249, 250));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.GRAY)));
        p.add(new Chunk(value, new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, color)));
        
        cell.addElement(p);
        table.addCell(cell);
    }

    private void agregarTabla(Document document, List<ReporteProgramacionDTO> datos) throws DocumentException {
        Paragraph titulo = new Paragraph("DETALLE POR EMPLEADO\n\n", SUBTITULO_FONT);
        document.add(titulo);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 3f, 2f, 2f, 2.5f});

        String[] headers = {"Nombre", "Apellido", "Dominicales", "Descansos", "Horas Extra"};
        
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
            cell.setBackgroundColor(new BaseColor(52, 58, 64));
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        int rowIndex = 0;
        for (ReporteProgramacionDTO dato : datos) {
            BaseColor bgColor = rowIndex % 2 == 0 ? BaseColor.WHITE : new BaseColor(248, 249, 250);
            
            agregarCelda(table, dato.getNombre(), bgColor, Element.ALIGN_LEFT);
            agregarCelda(table, dato.getApellido(), bgColor, Element.ALIGN_LEFT);
            agregarCelda(table, String.valueOf(dato.getTotalDominicales()), bgColor, Element.ALIGN_CENTER);
            agregarCelda(table, String.valueOf(dato.getTotalDescansos()), bgColor, Element.ALIGN_CENTER);
            agregarCelda(table, String.format("%.1f", dato.getTotalHorasExtra()), bgColor, Element.ALIGN_CENTER);
            
            rowIndex++;
        }

        document.add(table);
    }

    private void agregarCelda(PdfPTable table, String texto, BaseColor bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(texto != null ? texto : "N/A", NORMAL_FONT));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void agregarEncabezadoIndividual(Document document, ReporteProgramacionDTO empleado, 
                                            String periodo) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(15);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Paragraph titleP = new Paragraph();
        titleP.add(new Chunk("EasyJob\n", new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(0, 123, 255))));
        titleP.add(new Chunk("REPORTE INDIVIDUAL\n\n", TITULO_FONT));
        titleP.add(new Chunk("Empleado: ", NORMAL_FONT));
        titleP.add(new Chunk(empleado.getNombreCompleto() + "\n", SUBTITULO_FONT));
        titleP.add(new Chunk("Período: " + periodo + "\n", NORMAL_FONT));
        titleP.add(new Chunk(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), 
            new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC, BaseColor.GRAY)));
        cell.addElement(titleP);
        
        headerTable.addCell(cell);
        document.add(headerTable);

        LineSeparator line = new LineSeparator();
        line.setLineColor(new BaseColor(0, 123, 255));
        line.setLineWidth(2);
        document.add(new Chunk(line));
        document.add(new Paragraph(" "));
    }

    private void agregarMetricasIndividuales(Document document, ReporteProgramacionDTO empleado) throws DocumentException {
        PdfPTable metricsTable = new PdfPTable(3);
        metricsTable.setWidthPercentage(100);
        metricsTable.setSpacingAfter(20f);

        agregarMetricaCard(metricsTable, "Días Dominicales", 
            String.valueOf(empleado.getTotalDominicales()), new BaseColor(23, 162, 184));
        agregarMetricaCard(metricsTable, "Días de Descanso", 
            String.valueOf(empleado.getTotalDescansos()), new BaseColor(255, 193, 7));
        agregarMetricaCard(metricsTable, "Total Horas Extra", 
            String.format("%.1f hrs", empleado.getTotalHorasExtra()), new BaseColor(40, 167, 69));

        document.add(metricsTable);
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
        footer.add(new Chunk("Documento generado automáticamente\n",
            new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC, BaseColor.GRAY)));
        footer.add(new Chunk("Información confidencial", 
            new Font(Font.FontFamily.HELVETICA, 7, Font.NORMAL, BaseColor.GRAY)));
        
        document.add(footer);
    }

    private void validarDatos(List<?> datos) {
        if (datos == null || datos.isEmpty()) {
            throw new IllegalArgumentException("No hay datos para generar el reporte");
        }
    }
}