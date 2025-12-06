// ================= MÓDULO HOME DASHBOARD ANALÍTICO =================

const HomeModule = {
  empleados: [],
  sucursales: [],
  programaciones: [],
  inicializado: false,
  charts: {}, // Almacenar referencias a los gráficos

  // Inicializar el módulo
  async init() {
    if (this.inicializado) {
      console.log('Home Dashboard ya inicializado');
      return;
    }

    console.log('Iniciando Home Dashboard Analítico...');
    this.inicializado = true;
    
    // Configurar defaults de Chart.js
    this.configurarChartDefaults();
    
    this.actualizarFechaHora();
    setInterval(() => this.actualizarFechaHora(), 60000);
    
    await this.cargarDatos();
  },

  // Configurar defaults de Chart.js
  configurarChartDefaults() {
    if (typeof Chart !== 'undefined') {
      Chart.defaults.font.family = "'Segoe UI', 'Arial', sans-serif";
      Chart.defaults.plugins.legend.labels.usePointStyle = true;
      Chart.defaults.plugins.legend.labels.padding = 15;
    }
  },

  // Actualizar fecha y hora
  actualizarFechaHora() {
    const now = new Date();
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const fechaFormateada = now.toLocaleDateString('es-ES', opciones);
    
    const elementoFecha = document.getElementById('fecha-actual');
    if (elementoFecha) {
      elementoFecha.textContent = fechaFormateada;
    }
  },

  // Cargar todos los datos
  async cargarDatos() {
    try {
      console.log('Cargando datos del dashboard...');
      
      await Promise.all([
        this.cargarEmpleados(),
        this.cargarSucursales(),
        this.cargarProgramaciones()
      ]);

      this.renderizarMetricas();
      this.renderizarGraficos();

      console.log('Dashboard cargado correctamente');
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  },

  // ========== CARGAR DATOS ==========

  async cargarEmpleados() {
    try {
      const response = await fetch('/empleados/filtrar?sucursalId=todas&rolId=todos');
      if (!response.ok) throw new Error('Error al cargar empleados');
      
      this.empleados = await response.json();
      console.log(`Empleados cargados: ${this.empleados.length}`);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      this.empleados = [];
    }
  },

  async cargarSucursales() {
    try {
      const response = await fetch('/sucursales');
      if (!response.ok) throw new Error('Error al cargar sucursales');
      
      this.sucursales = await response.json();
      console.log(`Sucursales cargadas: ${this.sucursales.length}`);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      this.sucursales = [];
    }
  },

  async cargarProgramaciones() {
    try {
      const response = await fetch('/api/programacion/listar');
      if (!response.ok) throw new Error('Error al cargar programaciones');
      
      this.programaciones = await response.json();
      console.log(`Programaciones cargadas: ${this.programaciones.length}`);
    } catch (error) {
      console.error('Error cargando programaciones:', error);
      this.programaciones = [];
    }
  },

  // ========== RENDERIZAR MÉTRICAS ==========

  renderizarMetricas() {
    // Total empleados
    const totalEmpleados = this.empleados.length;
    document.getElementById('total-empleados').textContent = totalEmpleados;

    // Edad media
    const edadMedia = this.calcularEdadMedia();
    document.getElementById('edad-media').textContent = edadMedia.toFixed(1);

    // Antigüedad media
    const antiguedadMedia = this.calcularAntiguedadMedia();
    document.getElementById('antiguedad-media').textContent = antiguedadMedia.toFixed(1);

    // Empleados activos/inactivos
    const activos = this.empleados.filter(u => 
      u.estado && u.estado.trim().toLowerCase() === 'activo'
    ).length;
    const inactivos = totalEmpleados - activos;
    
    const elemActivos = document.getElementById('empleados-activos');
    const elemInactivos = document.getElementById('empleados-inactivos');
    if (elemActivos) elemActivos.textContent = activos;
    if (elemInactivos) elemInactivos.textContent = inactivos;

    // Salario promedio y nómina total
    const salarios = this.empleados
      .filter(u => u.salario && !isNaN(u.salario))
      .map(u => parseFloat(u.salario));
    
    const salarioPromedio = salarios.length > 0 
      ? salarios.reduce((a, b) => a + b, 0) / salarios.length 
      : 0;
    const nominaTotal = salarios.reduce((a, b) => a + b, 0);

    const elemSalarioPromedio = document.getElementById('salario-promedio');
    const elemNominaTotal = document.getElementById('nomina-total');
    if (elemSalarioPromedio) {
      elemSalarioPromedio.textContent = this.formatearMoneda(salarioPromedio);
    }
    if (elemNominaTotal) {
      elemNominaTotal.textContent = this.formatearMoneda(nominaTotal);
    }
  },

  // Calcular edad media
  calcularEdadMedia() {
    const empleadosConEdad = this.empleados.filter(e => e.fecha_nacimiento);
    if (empleadosConEdad.length === 0) return 39.1;

    const edades = empleadosConEdad.map(e => {
      const hoy = new Date();
      const nacimiento = new Date(e.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    });

    return edades.reduce((sum, edad) => sum + edad, 0) / edades.length;
  },

  // Calcular antigüedad media
  calcularAntiguedadMedia() {
    const empleadosConIngreso = this.empleados.filter(e => e.fecha_ingreso);
    if (empleadosConIngreso.length === 0) return 3.8;

    const antiguedades = empleadosConIngreso.map(e => {
      const hoy = new Date();
      const ingreso = new Date(e.fecha_ingreso);
      const años = (hoy - ingreso) / (1000 * 60 * 60 * 24 * 365.25);
      return años;
    });

    return antiguedades.reduce((sum, ant) => sum + ant, 0) / antiguedades.length;
  },

  // ========== RENDERIZAR GRÁFICOS ==========

  renderizarGraficos() {
    // Destruir gráficos anteriores
    this.destruirGraficos();

    // Crear gráficos
    this.crearGraficoRoles();
    this.crearGraficoSucursales();
    this.crearGraficoEdades();
    this.crearGraficoEstadosEmpleados();
    this.crearGraficoSucursalesBarras();
    this.crearGraficoDistribucionDias();
    this.crearGraficoHorasExtra();
  },

  // Destruir todos los gráficos
  destruirGraficos() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  },

  // ========== GRÁFICOS ==========

  // Gráfico: Empleados por Rol (Doughnut)
  crearGraficoRoles() {
    const ctx = document.getElementById('chartRoles');
    if (!ctx) return;

    const roles = {};
    this.empleados.forEach(e => {
      const rol = e.rol?.tipo_rol || 'Sin rol';
      roles[rol] = (roles[rol] || 0) + 1;
    });

    const data = {
      labels: Object.keys(roles),
      datasets: [{
        data: Object.values(roles),
        backgroundColor: [
          'rgba(0, 123, 255, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(108, 117, 125, 0.8)'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    };

    this.charts.roles = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  },

  // Gráfico: Top 5 Sucursales (Barras horizontales)
  crearGraficoSucursales() {
    const ctx = document.getElementById('chartSucursales');
    if (!ctx) return;

    const distribucion = this.sucursales.map(s => {
      const idSucursal = s.idSucursal || s.id_sucursal;
      const empleados = this.empleados.filter(e => {
        const empSucursalId = e.sucursal?.idSucursal || e.sucursal?.id_sucursal;
        return empSucursalId == idSucursal;
      }).length;

      return {
        nombre: s.nombreSucursal || 'Sin nombre',
        empleados: empleados
      };
    });

    distribucion.sort((a, b) => b.empleados - a.empleados);
    const top5 = distribucion.slice(0, 5);

    const data = {
      labels: top5.map(s => s.nombre),
      datasets: [{
        label: 'Empleados',
        data: top5.map(s => s.empleados),
        backgroundColor: 'rgba(32, 201, 151, 0.8)',
        borderColor: 'rgba(23, 166, 137, 1)',
        borderWidth: 1
      }]
    };

    this.charts.sucursales = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.x} usuario${context.parsed.x !== 1 ? 's' : ''}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 }
            }
          },
          y: {
            ticks: {
              font: { size: 11 }
            }
          }
        }
      }
    });
  },

  // Gráfico: Distribución por Edad (Barras)
  crearGraficoEdades() {
    const ctx = document.getElementById('chartEdades');
    if (!ctx) return;

    const rangos = {
      '20-30': 0,
      '30-40': 0,
      '40-50': 0,
      '50-60': 0
    };

    this.empleados.forEach(e => {
      if (!e.fecha_nacimiento) return;
      
      const hoy = new Date();
      const nacimiento = new Date(e.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      
      if (edad >= 20 && edad < 30) rangos['20-30']++;
      else if (edad >= 30 && edad < 40) rangos['30-40']++;
      else if (edad >= 40 && edad < 50) rangos['40-50']++;
      else if (edad >= 50 && edad < 60) rangos['50-60']++;
    });

    const data = {
      labels: Object.keys(rangos),
      datasets: [{
        label: 'Empleados',
        data: Object.values(rangos),
        backgroundColor: 'rgba(32, 201, 151, 0.8)',
        borderColor: 'rgba(23, 166, 137, 1)',
        borderWidth: 1,
        borderRadius: 6
      }]
    };

    this.charts.edades = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 5 }
          }
        }
      }
    });
  },

  // Gráfico: Estado de Usuarios (Pie)
  crearGraficoEstadosEmpleados() {
    const ctx = document.getElementById('chartEstados');
    if (!ctx) return;

    const activos = this.empleados.filter(u => 
      u.estado && u.estado.trim().toLowerCase() === 'activo'
    ).length;
    const inactivos = this.empleados.length - activos;

    this.charts.estados = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [{
          data: [activos, inactivos],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  },

  // Gráfico: Distribución por Sucursal (Barras)
  crearGraficoSucursalesBarras() {
    const ctx = document.getElementById('chartSucursalesBarras');
    if (!ctx) return;

    const sucursalesCounts = {};
    this.empleados.forEach(u => {
      const sucursal = u.sucursal?.nombreSucursal || 'Sin Sucursal';
      sucursalesCounts[sucursal] = (sucursalesCounts[sucursal] || 0) + 1;
    });

    this.charts.sucursalesBarras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(sucursalesCounts),
        datasets: [{
          label: 'Usuarios',
          data: Object.values(sucursalesCounts),
          backgroundColor: 'rgba(32, 201, 151, 0.8)',
          borderColor: 'rgba(23, 166, 137, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.x} usuario${context.parsed.x !== 1 ? 's' : ''}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 }
            }
          },
          y: {
            ticks: {
              font: { size: 11 }
            }
          }
        }
      }
    });
  },

  // Gráfico: Distribución Descansos vs Dominicales
  crearGraficoDistribucionDias() {
    const ctx = document.getElementById('chartDistribucionDias');
    if (!ctx) return;

    let totalDescansos = 0;
    let totalDominicales = 0;

    this.programaciones.forEach(p => {
      if (p.esDescanso) totalDescansos++;
      if (p.esDominical) totalDominicales++;
    });

    this.charts.distribucionDias = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Descansos', 'Dominicales'],
        datasets: [{
          data: [totalDescansos, totalDominicales],
          backgroundColor: [
            'rgba(255, 193, 7, 0.8)',
            'rgba(23, 162, 184, 0.8)'
          ],
          borderColor: [
            'rgba(255, 193, 7, 1)',
            'rgba(23, 162, 184, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  },

  // Gráfico: Horas Extra por Empleado (Top 10)
  crearGraficoHorasExtra() {
    const ctx = document.getElementById('chartHorasExtra');
    if (!ctx) return;

    // Obtener mes y año actual
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    console.log('=== DEBUG INICIAL ===');
    console.log('Fecha actual:', hoy);
    console.log('Mes actual (0-11):', mesActual);
    console.log('Año actual:', añoActual);
    console.log('Total programaciones cargadas:', this.programaciones.length);

    // Primero, veamos todas las programaciones con horas extra
    const programacionesConHoras = this.programaciones.filter(p => p.horasExtra > 0);
    console.log('Programaciones con horas extra (todas):', programacionesConHoras.length);
    console.log('Ejemplos:', programacionesConHoras.slice(0, 5).map(p => ({
      fecha: p.fecha,
      empleado: p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido}` : 'Sin usuario',
      horas: p.horasExtra
    })));

    // Agrupar horas extra por empleado (SOLO DEL MES ACTUAL)
    const horasPorEmpleado = {};
    let programacionesMesActual = 0;
    
    this.programaciones.forEach(p => {
      // Verificar que tenga fecha válida
      if (!p.fecha) {
        console.warn('Programación sin fecha:', p);
        return;
      }
      
      // Convertir fecha a objeto Date
      let fechaProg;
      if (typeof p.fecha === 'string') {
        fechaProg = new Date(p.fecha + 'T00:00:00'); // Añadir hora para evitar problemas de zona horaria
      } else {
        fechaProg = new Date(p.fecha);
      }
      
      const mesProg = fechaProg.getMonth();
      const añoProg = fechaProg.getFullYear();
      
      // Debug: mostrar primeras 5 fechas
      if (programacionesMesActual < 5) {
        console.log('Comparación fecha:', {
          fecha: p.fecha,
          fechaConvertida: fechaProg,
          mes: mesProg,
          año: añoProg,
          esDelMes: mesProg === mesActual && añoProg === añoActual
        });
      }
      
      // Filtrar solo programaciones del mes y año actual
      if (mesProg === mesActual && 
          añoProg === añoActual &&
          p.horasExtra > 0 && 
          p.usuario) {
        
        programacionesMesActual++;
        
        const idUsuario = p.usuario.id || p.idUsuario;
        const nombreCompleto = `${p.usuario.nombre} ${p.usuario.apellido}`;
        
        if (!horasPorEmpleado[idUsuario]) {
          horasPorEmpleado[idUsuario] = {
            nombre: nombreCompleto,
            horas: 0
          };
        }
        
        horasPorEmpleado[idUsuario].horas += p.horasExtra;
      }
    });

    console.log('Programaciones del mes actual con horas extra:', programacionesMesActual);
    console.log('Empleados únicos con horas extra este mes:', Object.keys(horasPorEmpleado).length);
    console.log('Detalle por empleado:', horasPorEmpleado);

    // Convertir a array y ordenar
    const empleadosArray = Object.values(horasPorEmpleado);
    empleadosArray.sort((a, b) => b.horas - a.horas);
    const top10 = empleadosArray.slice(0, 10);

    console.log('=== RESULTADO FINAL ===');
    console.log('Total empleados con horas extra este mes:', empleadosArray.length);
    console.log('Top 10:', top10);
    console.log('========================');

    if (top10.length > 0) {
      this.charts.horasExtra = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top10.map(e => e.nombre),
          datasets: [{
            label: 'Horas Extra',
            data: top10.map(e => e.horas),
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: 'rgba(32, 163, 57, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const nombre = context.label;
                  const horas = context.parsed.y;
                  return `${nombre}: ${horas.toFixed(1)} horas extra este mes`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: { size: 11 }
              },
              title: {
                display: true,
                text: 'Horas Extra',
                font: { size: 12, weight: 'bold' }
              }
            },
            x: {
              ticks: {
                font: { size: 10 },
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
    } else {
      ctx.parentElement.innerHTML = `
        <div class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-1"></i>
          <p class="mt-2">No hay horas extra registradas este mes</p>
          <small>Mes: ${mesActual + 1}/${añoActual}</small>
        </div>
      `;
    }
  },

  // ========== FUNCIONES AUXILIARES ==========

  formatearMoneda(valor) {
    if (!valor || isNaN(valor)) return '0';
    return parseFloat(valor).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  },

  formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return fecha;
      
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return fecha;
    }
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const homeSection = document.getElementById('home-section');
  if (homeSection && !HomeModule.inicializado) {
    HomeModule.init();
  }
});

// Exponer globalmente
window.HomeModule = HomeModule;