// ================= DASHBOARD SUPERVISOR - OPTIMIZADO Y CORREGIDO ==================
const API_BASE_URL = 'http://localhost:9090/api';
const ENDPOINTS = {
  empleados: '/usuarios/empleados',
  buscarUsuario: '/usuarios/buscar',
  empleadosZona: '/usuarios/zona',
  programacion: '/programacion',

  // INCAPACIDADES
  incapacidades: '/incapacidades',              // listar / crear
  incapacidadPorUsuario: '/incapacidades/usuario',  
  aprobarIncapacidad: (id) => `/incapacidades/${id}/aprobar`,
  rechazarIncapacidad: (id) => `/incapacidades/${id}/rechazar`,

  // VACACIONES
  vacaciones: '/vacaciones',
  vacacionesTodas: '/vacaciones/todas',
  vacacionesPorZona: (id) => `/vacaciones/zona/${id}`,
  cambiarEstadoVacacion: (id) => `/vacaciones/${id}/estado`,

  traslados: '/traslados/registrar',
  reportes: '/reportes/generar',
  zonasSupervisor: ''
};


// ====== VARIABLES GLOBALES ======
let empleadoSeleccionado = null;
let supervisorActual = null; // Se obtendrá dinámicamente del usuario logueado

// ====== OBTENER DATOS DEL SUPERVISOR LOGUEADO ======
function obtenerSupervisorLogueado() {
  // Opción 1: Desde sessionStorage (si guardas el ID al hacer login)
  const idSupervisor = sessionStorage.getItem('idUsuario');
  
  // Opción 2: Desde localStorage
  // const idSupervisor = localStorage.getItem('idUsuario');
  
  // Opción 3: Desde una cookie
  // const idSupervisor = document.cookie.split('; ').find(row => row.startsWith('idUsuario='))?.split('=')[1];
  
  if (idSupervisor) {
    supervisorActual = parseInt(idSupervisor);
    console.log('✅ Supervisor logueado:', supervisorActual);
  } else {
    console.warn('⚠️ No se encontró ID de supervisor. Usando valor por defecto: 1');
    supervisorActual = 1; // Valor por defecto para desarrollo
  }
  
  return supervisorActual;
}

// ====== UTILIDADES GENERALES ======
const Utils = {
  formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  formatearFechaCorta(fecha) {
    if (!fecha) return 'N/A';
    const f = new Date(fecha + 'T00:00:00');
    return f.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  },

  formatearMoneda(valor) {
    return valor ? `$${valor.toLocaleString('es-CO')}` : 'N/A';
  },

  validarFechas(inicio, fin) {
    return new Date(inicio) <= new Date(fin);
  },

  obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
  },

  mostrarAlerta(mensaje, tipo = 'info') {
    const contenedor = document.getElementById('alertContainer');
    
    // Si no existe contenedor, crear alerta flotante
    if (!contenedor) {
      this.mostrarAlertaFlotante(mensaje, tipo);
      return;
    }

    const iconos = {
      success: 'fa-check-circle',
      danger: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = 'alert';
    alerta.innerHTML = `
      <i class="fas ${iconos[tipo]} me-2"></i>${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    contenedor.appendChild(alerta);

    setTimeout(() => {
      alerta.classList.remove('show');
      setTimeout(() => alerta.remove(), 150);
    }, 4000);
  },

  mostrarAlertaFlotante(mensaje, tipo = 'info') {
    const iconos = {
      success: 'check-circle',
      danger: 'exclamation-triangle',
      warning: 'exclamation-circle',
      info: 'info-circle'
    };

    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alertaDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    alertaDiv.role = 'alert';
    alertaDiv.innerHTML = `
      <i class="fas fa-${iconos[tipo]} me-2"></i>${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertaDiv);
    setTimeout(() => alertaDiv.remove(), 5000);
  }
};

// ====== GESTIÓN DE API ======
const API = {
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Si la respuesta es blob (para PDFs), retornarla directamente
      if (options.responseType === 'blob') {
        return await response.blob();
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('Error en petición API:', error);
      throw error;
    }
  },

  async get(endpoint) {
    return this.request(`${API_BASE_URL}${endpoint}`);
  },

  async post(endpoint, data) {
    return this.request(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async put(endpoint, data) {
    return this.request(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(endpoint) {
    return this.request(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });
  },

  async getBlob(endpoint, data) {
    return this.request(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      responseType: 'blob'
    });
  }
};

// ====== NAVEGACIÓN ======
const Navegacion = {
  secciones: {},
  botones: {},

  init() {
    // Obtener referencias a secciones
    this.secciones = {
      dashboard: document.getElementById('seccionDashboard'),
      empleados: document.getElementById('seccionEmpleados'),
      horarios: document.getElementById('seccionHorarios'),
      incapacidades: document.getElementById('seccionIncapacidades'),
      vacaciones: document.getElementById('seccionVacaciones'),
      traslados: document.getElementById('seccionTraslados'),
      reportes: document.getElementById('seccionReportes')
    };

    // Obtener referencias a botones
    this.botones = {
      dashboard: document.getElementById('btnDashboard'),
      empleados: document.getElementById('btnEmpleados'),
      horarios: document.getElementById('btnHorarios'),
      incapacidades: document.getElementById('btnIncapacidades'),
      vacaciones: document.getElementById('btnVacaciones'),
      traslados: document.getElementById('btnTraslados'),
      reportes: document.getElementById('btnReportes'),
      cerrarSesion: document.getElementById('btnCerrarSesion')
    };

    this.vincularEventos();
  },

  vincularEventos() {
    Object.keys(this.secciones).forEach(seccion => {
      const boton = this.botones[seccion];
      if (boton) {
        boton.addEventListener('click', (e) => {
          e.preventDefault();
          this.mostrarSeccion(seccion);
        });
      }
    });

    // Cerrar sesión
    this.botones.cerrarSesion?.addEventListener('click', (e) => {
      e.preventDefault();
      this.cerrarSesion();
    });
  },

  mostrarSeccion(nombre) {
    // Ocultar todas las secciones
    Object.values(this.secciones).forEach(seccion => {
      if (seccion) seccion.style.display = 'none';
    });

    // Remover clase active de todos los botones
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const seccion = this.secciones[nombre];
    const boton = this.botones[nombre];

    if (seccion) {
      seccion.style.display = 'block';
      this.animarEntrada(seccion);
    }

    if (boton) {
      boton.classList.add('active');
    }

    // Cargar datos específicos según la sección
    if (nombre === 'horarios') {
      Horarios.cargar();
    }
  },

  animarEntrada(elemento) {
    elemento.style.opacity = '0';
    elemento.style.transform = 'translateY(20px)';
    setTimeout(() => {
      elemento.style.transition = 'all 0.5s ease';
      elemento.style.opacity = '1';
      elemento.style.transform = 'translateY(0)';
    }, 10);
  },

  cerrarSesion() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      Utils.mostrarAlerta('Cerrando sesión...', 'info');
      // Limpiar datos de sesión
      sessionStorage.clear();
      localStorage.removeItem('idUsuario');
      setTimeout(() => window.location.href = '/logout', 1500);
    }
  }
};

// ===== DASHBOARD STATISTICS =====
const Dashboard = {
  async init() {
    if (!supervisorActual) {
      console.warn('No se ha identificado el supervisor');
      return;
    }

    await this.cargarEstadisticas();
    await this.cargarZona();
    await this.cargarActividadReciente();
    await this.cargarAlertas();
  },

  async cargarEstadisticas() {
    try {
      // Cargar empleados de la zona
      const empleados = await API.get(`/usuarios/zona/${supervisorActual}`);
      document.getElementById('totalEmpleados').textContent = empleados?.length || 0;

      // Cargar otras estadísticas (puedes crear estos endpoints)
      // Por ahora, valores de ejemplo
      document.getElementById('totalVacaciones').textContent = '5';
      document.getElementById('totalIncapacidades').textContent = '2';
      document.getElementById('totalSucursales').textContent = '3';

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      document.getElementById('totalEmpleados').textContent = '-';
      document.getElementById('totalVacaciones').textContent = '-';
      document.getElementById('totalIncapacidades').textContent = '-';
      document.getElementById('totalSucursales').textContent = '-';
    }
  },

  async cargarZona() {
    try {
      const zonas = await API.get(`${ENDPOINTS.zonasSupervisor}/zonas/supervisor/${supervisorActual}`);

      const zonaEl = document.getElementById('dashboardZone');

	  
      // Si viene una lista, toma la primera zona
      if (zonaEl && zonas && zonas.length > 0) {
        zonaEl.textContent = zonas[0].nombreZona;
      } else {
        zonaEl.textContent = 'Sin zona asignada';
      }

    } catch (error) {
      console.error('Error al cargar zona:', error);
      const zonaEl = document.getElementById('dashboardZone');
      if (zonaEl) zonaEl.textContent = 'Sin zona asignada';
    }
  },


  async cargarActividadReciente() {
    const container = document.getElementById('actividadReciente');
    
    try {
      // Aquí puedes hacer una llamada real a tu API
      // Por ahora, mostramos datos de ejemplo
      container.innerHTML = `
        <div class="activity-item">
          <small class="text-muted">Hace 2 horas</small>
          <p class="mb-0"><strong>Horario asignado</strong> a Fernanda Valencia</p>
        </div>
        <div class="activity-item">
          <small class="text-muted">Hace 5 horas</small>
          <p class="mb-0"><strong>Vacaciones aprobadas</strong> para Cristian Miranda</p>
        </div>
        <div class="activity-item">
          <small class="text-muted">Ayer</small>
          <p class="mb-0"><strong>Nuevo empleado</strong> Daniel Pulido agregado</p>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="alert alert-warning mb-0">
          <i class="fas fa-info-circle me-2"></i>
          No hay actividad reciente
        </div>
      `;
    }
  },

  async cargarAlertas() {
    const container = document.getElementById('alertasPendientes');
    
    try {
      container.innerHTML = `
        <div class="alert-item">
          <i class="fas fa-exclamation-circle text-warning me-2"></i>
          <strong>3 solicitudes de vacaciones</strong> pendientes de aprobación
        </div>
        <div class="alert-item">
          <i class="fas fa-clock text-info me-2"></i>
          <strong>5 horarios</strong> por asignar esta semana
        </div>
        <div class="alert-item">
          <i class="fas fa-calendar-times text-danger me-2"></i>
          <strong>2 incapacidades</strong> finalizan mañana
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="alert alert-success mb-0">
          <i class="fas fa-check-circle me-2"></i>
          No hay alertas pendientes
        </div>
      `;
    }
  }
};

// ====== GESTIÓN DE EMPLEADOS ======
const Empleados = {
  init() {
    const form = document.getElementById('form-busqueda');
    if (form) {
      form.addEventListener('submit', (e) => this.buscar(e));
    }
    
    // ✅ Cargar listado automáticamente al iniciar
    this.cargarListado();
  },

  async buscar(e) {
    e.preventDefault();

    const idEmpleado = document.getElementById('idEmpleado').value.trim();
    const nombreEmpleado = document.getElementById('nombreEmpleado').value.trim();
    const resultado = document.getElementById('resultadoEmpleado');

    if (!idEmpleado && !nombreEmpleado) {
      Utils.mostrarAlerta('Por favor ingrese al menos un criterio de búsqueda', 'warning');
      return;
    }

    if (!idEmpleado) {
      Utils.mostrarAlerta('Por favor ingrese el ID/Cédula del empleado', 'warning');
      return;
    }

    this.mostrarLoading(resultado);

    try {
      const empleado = await API.get(`${ENDPOINTS.empleados}/${idEmpleado}`);

      if (empleado && empleado.idusuarios) {
        this.mostrarResultado(empleado);
      } else {
        throw new Error('Empleado no encontrado');
      }
    } catch (error) {
      resultado.style.display = 'none';
      Utils.mostrarAlerta('Empleado no encontrado. Verifique el ID ingresado.', 'warning');
      console.error('Error:', error);
    }
  },

  // ✅ NUEVO: Cargar listado de empleados de la zona
  async cargarListado() {
    const listadoContainer = document.getElementById('listadoEmpleados');
    
    if (!listadoContainer) {
      console.warn('No se encontró el contenedor de listado de empleados');
      return;
    }

    // Mostrar loading
    listadoContainer.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando empleados de tu zona...</p>
      </div>
    `;

    try {
      // ✅ Endpoint que filtra empleados por zona del supervisor
      const empleados = await API.get(`/usuarios/zona/${supervisorActual}`);
      
      if (!empleados || empleados.length === 0) {
        listadoContainer.innerHTML = `
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            No se encontraron empleados en tu zona
          </div>
        `;
        return;
      }

      this.renderizarListado(empleados);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      listadoContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Error al cargar el listado de empleados: ${error.message}
        </div>
      `;
    }
  },

  // ✅ NUEVO: Renderizar listado en tabla
  renderizarListado(empleados) {
    const listadoContainer = document.getElementById('listadoEmpleados');
    
    let html = `
      <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-white" >
            <i class="fas fa-users me-2 text-white"></i>Empleados de mi Zona
          </h5>
          <span class="badge bg-light text-primary">${empleados.length} empleado${empleados.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Cédula</th>
                  <th>Nombre Completo</th>
                  <th>Teléfono</th>
                  <th>Sucursal</th>
                  <th>Cargo</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
    `;

    empleados.forEach(emp => {
      const estadoBadge = emp.estado === 'ACTIVO' 
        ? '<span class="badge bg-success">Activo</span>' 
        : '<span class="badge bg-danger">Inactivo</span>';
      
      html += `
        <tr>
          <td><strong>${emp.idusuarios}</strong></td>
          <td>
            <div class="d-flex align-items-center">
              
              <div>
                <strong>${emp.nombre || ''} ${emp.apellido || ''}</strong>
              </div>
            </div>
          </td>
          <td><small>${emp.telefono || 'N/A'}</small></td>
          <td>
            <small class="text-muted">
              <i class="fas fa-map-marker-alt me-1"></i>
              ${emp.sucursal?.nombreSucursal || 'N/A'}
            </small>
          </td>
          <td><span class="badge bg-info">${emp.rol?.tipo_rol || 'N/A'}</span></td>
          <td>${estadoBadge}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-primary" onclick="Empleados.verDetalle(${emp.idusuarios})" title="Ver detalles">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning" onclick="Empleados.asignarHorario(${emp.idusuarios})" title="Asignar horario">
              <i class="fas fa-clock"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    listadoContainer.innerHTML = html;
  },

  // ✅ NUEVO: Ver detalle de empleado
  async verDetalle(idEmpleado) {
    const resultado = document.getElementById('resultadoEmpleado');
    this.mostrarLoading(resultado);

    try {
      const empleado = await API.get(`${ENDPOINTS.empleados}/${idEmpleado}`);
      if (empleado && empleado.idusuarios) {
        this.mostrarResultado(empleado);
        resultado.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error('Empleado no encontrado');
      }
    } catch (error) {
      Utils.mostrarAlerta('Error al cargar el empleado: ' + error.message, 'danger');
      console.error('Error:', error);
    }
  },

  // ✅ NUEVO: Atajo para asignar horario
  asignarHorario(idEmpleado) {
    // Cambiar a la sección de horarios
    Navegacion.mostrarSeccion('horarios');
    
    // Pre-llenar el campo de búsqueda
    setTimeout(() => {
      const inputId = document.getElementById('idHorarioEmpleado');
      if (inputId) {
        inputId.value = idEmpleado;
        inputId.focus();
        
        // Opcional: buscar automáticamente
        const btnBuscar = document.querySelector('#formBuscarHorario button[type="submit"]');
        if (btnBuscar) {
          btnBuscar.click();
        }
      }
    }, 300);
  },

  mostrarLoading(elemento) {
    elemento.style.display = 'block';
    elemento.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Buscando empleado...</p>
      </div>
    `;
  },

  mostrarResultado(empleado) {
    const resultado = document.getElementById('resultadoEmpleado');
    resultado.style.display = 'block';
    resultado.innerHTML = `
      <h4 class="mb-4">
        <i class="fas fa-user-circle text-primary me-2"></i>Información del Empleado
      </h4>
      <div class="row">
        <div class="col-md-6">
          <p><strong><i class="fas fa-id-card me-2 text-primary"></i>ID/Cédula:</strong> ${empleado.idusuarios}</p>
          <p><strong><i class="fas fa-user me-2 text-primary"></i>Nombre:</strong> ${empleado.nombre} ${empleado.apellido}</p>
          <p><strong><i class="fas fa-envelope me-2 text-primary"></i>Email:</strong> ${empleado.correo || empleado.email || 'N/A'}</p>
        </div>
        <div class="col-md-6">
          <p><strong><i class="fas fa-phone me-2 text-primary"></i>Teléfono:</strong> ${empleado.telefono || 'N/A'}</p>
          <p><strong><i class="fas fa-birthday-cake me-2 text-primary"></i>Fecha de Nacimiento:</strong> 
            ${empleado.fecha_nacimiento ? Utils.formatearFecha(empleado.fecha_nacimiento) : 'N/A'}
          </p>
          <p><strong><i class="fas fa-building me-2 text-primary"></i>Sucursal:</strong> 
            ${empleado.sucursal ? empleado.sucursal.nombreSucursal : 'N/A'}
          </p>
        </div>
      </div>
      <div class="mt-3">
        <p><strong><i class="fas fa-briefcase me-2 text-primary"></i>Cargo:</strong> ${empleado.rol?.tipo_rol || 'N/A'}</p>
        <p><strong><i class="fas fa-toggle-on me-2 text-primary"></i>Estado:</strong> 
          <span class="badge ${empleado.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">
            ${empleado.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
          </span>
        </p>
        <p><strong><i class="fas fa-dollar-sign me-2 text-primary"></i>Salario:</strong> 
          ${Utils.formatearMoneda(empleado.salario)}
        </p>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary" onclick="Empleados.asignarHorario(${empleado.idusuarios})">
          <i class="fas fa-clock me-2"></i>Asignar Horario
        </button>
      </div>
    `;
    Navegacion.animarEntrada(resultado);
  }
};

// ====== GESTIÓN DE HORARIOS ======
const Horarios = {
  init() {
    const formBuscar = document.getElementById('formBuscarHorario');
    if (formBuscar) {
      formBuscar.addEventListener('submit', (e) => this.buscarEmpleado(e));
    }

    // Establecer mes actual
    const mesActual = new Date().getMonth() + 1;
    const filtroMonth = document.getElementById('filtroMonth');
    if (filtroMonth) {
      filtroMonth.value = mesActual;
    }
  },

  async buscarEmpleado(e) {
    e.preventDefault();

    const idHorarioEmpleado = document.getElementById('idHorarioEmpleado').value.trim();
    const resultado = document.getElementById('resultadoHorario');

    if (!idHorarioEmpleado) {
      Utils.mostrarAlerta('Por favor ingrese la cédula del empleado', 'warning');
      return;
    }

    this.mostrarLoading(resultado);

    try {
      const data = await API.get(`${ENDPOINTS.buscarUsuario}/${idHorarioEmpleado}`);
      
      if (!data.success || !data.usuario) {
        throw new Error('Empleado no encontrado');
      }

      empleadoSeleccionado = data.usuario;
      this.mostrarFormularioAsignacion(empleadoSeleccionado);
    } catch (error) {
      resultado.style.display = 'none';
      Utils.mostrarAlerta('Empleado no encontrado. Verifique la cédula ingresada.', 'danger');
      console.error('Error:', error);
    }
  },

  mostrarLoading(elemento) {
    elemento.style.display = 'block';
    elemento.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Buscando...</span>
        </div>
        <p class="mt-3 text-muted">Buscando empleado...</p>
      </div>
    `;
  },

  mostrarFormularioAsignacion(usuario) {
    const resultado = document.getElementById('resultadoHorario');
    const hoy = Utils.obtenerFechaHoy();

    resultado.style.display = 'block';
    resultado.innerHTML = `
      <h4 class="mb-3 text-primary">
        <i class="fas fa-user me-2"></i>Empleado seleccionado
      </h4>
      <div class="row mb-3">
        <div class="col-md-4"><strong>Cédula:</strong> ${usuario.idusuarios}</div>
        <div class="col-md-4"><strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellido}</div>
        <div class="col-md-4"><strong>Email:</strong> ${usuario.correo || 'N/A'}</div>
      </div>
      <hr/>
      
      <!-- Selector de tipo de asignación -->
      <div class="mb-3">
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" name="tipoAsignacion" id="radioIndividual" value="individual" checked>
          <label class="btn btn-outline-primary" for="radioIndividual">
            <i class="fas fa-calendar-day me-2"></i>Asignación Individual
          </label>
          
          <input type="radio" class="btn-check" name="tipoAsignacion" id="radioMensual" value="mensual">
          <label class="btn btn-outline-primary" for="radioMensual">
            <i class="fas fa-calendar-alt me-2"></i>Asignación Mensual
          </label>
        </div>
      </div>

      <!-- Formulario Individual -->
      <div id="formIndividual">
        <h5><i class="fas fa-clock me-2"></i>Configurar horario</h5>
        <form id="formAsignarHorario">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label"><i class="fas fa-calendar-day me-1"></i>Fecha *</label>
              <input type="date" id="fechaHorario" class="form-control" value="${hoy}" required/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-sign-in-alt me-1"></i>Hora entrada *</label>
              <input type="time" id="horaEntrada" class="form-control" value="08:00" required/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-sign-out-alt me-1"></i>Hora salida *</label>
              <input type="time" id="horaSalida" class="form-control" value="17:00" required/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-stopwatch me-1"></i>Horas extra</label>
              <input type="number" id="horasExtra" class="form-control" min="0" step="0.5" value="0"/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-bed me-1"></i>¿Es descanso?</label>
              <select id="esDescanso" class="form-select">
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-church me-1"></i>¿Es dominical?</label>
              <select id="esDominical" class="form-select">
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div class="col-md-12">
              <label class="form-label"><i class="fas fa-comment me-1"></i>Descripción</label>
              <textarea id="descripcionHorario" class="form-control" rows="2" 
                placeholder="Ej: Turno diurno, incluye almuerzo de 1 hora"></textarea>
            </div>
          </div>
          <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-success">
              <i class="fas fa-check me-2"></i>Guardar Horario
            </button>
            <button type="button" class="btn btn-secondary" onclick="Horarios.cancelarAsignacion()">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Formulario Mensual -->
      <div id="formMensual" style="display: none;">
        <h5><i class="fas fa-calendar-alt me-2"></i>Asignación Mensual</h5>
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label"><i class="fas fa-calendar me-1"></i>Mes *</label>
            <select id="mesAsignacion" class="form-select" required>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11" selected>Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label"><i class="fas fa-calendar-year me-1"></i>Año *</label>
            <input type="number" id="anioAsignacion" class="form-control" value="${new Date().getFullYear()}" min="2024" max="2030" required/>
          </div>
          <div class="col-md-4">
            <button type="button" class="btn btn-primary w-100" style="margin-top: 32px;" onclick="Horarios.generarCalendarioMensual()">
              <i class="fas fa-calendar-plus me-2"></i>Generar Calendario
            </button>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-3">
            <label class="form-label">Hora entrada por defecto</label>
            <input type="time" id="horaEntradaDefecto" class="form-control" value="08:00"/>
          </div>
          <div class="col-md-3">
            <label class="form-label">Hora salida por defecto</label>
            <input type="time" id="horaSalidaDefecto" class="form-control" value="17:00"/>
          </div>
          <div class="col-md-6">
            <label class="form-label">Descripción por defecto</label>
            <input type="text" id="descripcionDefecto" class="form-control" placeholder="Turno normal"/>
          </div>
        </div>

        <div id="calendarioMensual"></div>

        <div class="mt-3 d-flex gap-2">
          <button type="button" class="btn btn-success" onclick="Horarios.guardarMensual()">
            <i class="fas fa-check me-2"></i>Guardar Mes Completo
          </button>
          <button type="button" class="btn btn-secondary" onclick="Horarios.cancelarAsignacion()">
            <i class="fas fa-times me-2"></i>Cancelar
          </button>
        </div>
      </div>
    `;

    // Event listeners para cambiar entre formularios
    document.getElementById('radioIndividual').addEventListener('change', () => {
      document.getElementById('formIndividual').style.display = 'block';
      document.getElementById('formMensual').style.display = 'none';
    });

    document.getElementById('radioMensual').addEventListener('change', () => {
      document.getElementById('formIndividual').style.display = 'none';
      document.getElementById('formMensual').style.display = 'block';
    });

    document.getElementById('formAsignarHorario').addEventListener('submit', (e) => this.guardar(e));
    
    // Establecer mes actual
    const mesActual = new Date().getMonth() + 1;
    document.getElementById('mesAsignacion').value = mesActual;
  },

  generarCalendarioMensual() {
    const mes = parseInt(document.getElementById('mesAsignacion').value);
    const anio = parseInt(document.getElementById('anioAsignacion').value);
    const horaEntradaDefecto = document.getElementById('horaEntradaDefecto').value;
    const horaSalidaDefecto = document.getElementById('horaSalidaDefecto').value;
    const descripcionDefecto = document.getElementById('descripcionDefecto').value;

    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const calendarioDiv = document.getElementById('calendarioMensual');

    // Calcular número de semana
    function getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    let html = `
      <style>
        .calendar-grid {
          display: grid;
          grid-template-columns: 80px repeat(7, 1fr);
          gap: 8px;
          margin-top: 20px;
        }
        
        .calendar-header {
          background: #f0f0f0;
          padding: 12px;
          text-align: center;
          font-weight: bold;
          border-radius: 8px;
          font-size: 13px;
        }
        
        .week-number {
          background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
          color: white;
          padding: 15px 10px;
          text-align: center;
          border-radius: 8px;
          font-weight: bold;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .calendar-day {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px;
          min-height: 120px;
          position: relative;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .calendar-day:hover:not(.empty) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #667eea;
        }
        
        .calendar-day.selected {
          background: #e8f5e9;
          border-color: #4caf50;
        }
        
        .calendar-day.descanso {
          background: #fff3e0;
          border-color: #ff9800;
        }
        
        .calendar-day.dominical {
          background: #e3f2fd;
          border-color: #2196F3;
        }
        
        .calendar-day.empty {
          background: #fafafa;
          border: none;
          cursor: default;
        }
        
        .day-number {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        
        .day-inputs {
          display: none;
          flex-direction: column;
          gap: 5px;
          margin-top: 8px;
        }
        
        .calendar-day.selected .day-inputs {
          display: flex;
        }
        
        .calendar-day.selected .day-summary {
          display: none;
        }
        
        .mini-input, .mini-select {
          font-size: 11px;
          padding: 4px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .day-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          color: white;
          margin-top: 5px;
        }
        
        .badge-normal { background: #4caf50; }
        .badge-descanso { background: #ff9800; }
        .badge-dominical { background: #2196F3; }
      </style>

      <div class="card">
        <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h6 class="mb-0 text-white">
            <i class="fas fa-calendar me-2"></i>
            Calendario Visual - ${new Date(anio, mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h6>
        </div>
        <div class="card-body">
          <p class="text-muted mb-3">
            <i class="fas fa-info-circle me-2"></i>
            Haz clic en cada día para configurar el horario. Los cambios se guardarán al hacer clic en "Guardar Mes Completo".
          </p>
          
          <div class="calendar-grid">
            <div class="week-number" style="background: #6c757d;">N°</div>
            <div class="calendar-header">Lunes</div>
            <div class="calendar-header">Martes</div>
            <div class="calendar-header">Miércoles</div>
            <div class="calendar-header">Jueves</div>
            <div class="calendar-header">Viernes</div>
            <div class="calendar-header">Sábado</div>
            <div class="calendar-header">Domingo</div>
    `;

    let diaActual = 1;
    let semanaActual = getWeekNumber(primerDia);
    const primerDiaAjustado = primerDiaSemana === 0 ? 7 : primerDiaSemana;

    for (let semana = 0; semana < 6; semana++) {
      if (diaActual > diasEnMes) break;

      html += `<div class="week-number">${semanaActual}</div>`;
      semanaActual++;

      for (let dia = 1; dia <= 7; dia++) {
        if (semana === 0 && dia < primerDiaAjustado) {
          html += `<div class="calendar-day empty"></div>`;
          continue;
        }

        if (diaActual > diasEnMes) {
          html += `<div class="calendar-day empty"></div>`;
          continue;
        }

        const fechaActual = new Date(anio, mes - 1, diaActual);
        const esDomingo = fechaActual.getDay() === 0;
        const fechaISO = `${anio}-${String(mes).padStart(2, '0')}-${String(diaActual).padStart(2, '0')}`;

		html += `
		  <div class="calendar-day ${esDomingo ? 'dominical' : ''}" 
		       data-dia="${diaActual}" 
		       data-fecha="${fechaISO}">
		    
		    <div class="day-number">${diaActual}</div>
		    
		    <div class="day-inputs">
		      <input type="time" class="mini-input hora-entrada" value="${horaEntradaDefecto}" title="Hora entrada" />
		      <input type="time" class="mini-input hora-salida" value="${horaSalidaDefecto}" title="Hora salida" />
		      <input type="number" class="mini-input horas-extra" min="0" step="0.5" value="0" placeholder="H. Extra" />
		      <select class="mini-select tipo-dia">
		        <option value="normal" ${!esDomingo ? 'selected' : ''}>Turno Normal</option>
		        <option value="descanso">Descanso</option>
		        <option value="dominical" ${esDomingo ? 'selected' : ''}>Dominical</option>
		      </select>
		      <input type="text" class="mini-input descripcion" value="${descripcionDefecto}" placeholder="Descripción" />
		    </div>
		    
		    <div class="day-summary">
		      <span class="day-badge badge-${esDomingo ? 'dominical' : 'normal'}">
		        ${horaEntradaDefecto} - ${horaSalidaDefecto}
		      </span>
		    </div>
		  </div>
		`;

        diaActual++;
      }
    }

    html += `
          </div>
        </div>
      </div>
    `;

    calendarioDiv.innerHTML = html;

    // ✅ Agregar event listeners después de insertar HTML
    setTimeout(() => {
      // Click en días para expandir/contraer
      document.querySelectorAll('.calendar-day:not(.empty)').forEach(dayElement => {
        dayElement.addEventListener('click', function(e) {
          if (e.target.classList.contains('mini-input') || 
              e.target.classList.contains('mini-select')) {
            return;
          }
          this.classList.toggle('selected');
          if (this.classList.contains('selected')) {
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      });

      // Cambio de tipo de día
      document.querySelectorAll('.tipo-dia').forEach(select => {
        select.addEventListener('change', function() {
          const dayElement = this.closest('.calendar-day');
          const tipo = this.value;
          
          dayElement.classList.remove('descanso', 'dominical');
          if (tipo === 'descanso') {
            dayElement.classList.add('descanso');
          } else if (tipo === 'dominical') {
            dayElement.classList.add('dominical');
          }
          
          const badge = dayElement.querySelector('.day-badge');
          badge.className = 'day-badge badge-' + tipo;
          
          const horaEntrada = dayElement.querySelector('.hora-entrada').value;
          const horaSalida = dayElement.querySelector('.hora-salida').value;
          badge.textContent = horaEntrada + ' - ' + horaSalida;
        });
      });

      // Actualizar badges cuando cambien las horas
      document.querySelectorAll('.hora-entrada, .hora-salida').forEach(input => {
        input.addEventListener('change', function() {
          const dayElement = this.closest('.calendar-day');
          const horaEntrada = dayElement.querySelector('.hora-entrada').value;
          const horaSalida = dayElement.querySelector('.hora-salida').value;
          const badge = dayElement.querySelector('.day-badge');
          badge.textContent = horaEntrada + ' - ' + horaSalida;
        });
      });

      // Prevenir que clicks en inputs cierren el día
      document.querySelectorAll('.mini-input, .mini-select').forEach(input => {
        input.addEventListener('click', function(e) {
          e.stopPropagation();
        });
      });

    }, 100);

    Utils.mostrarAlerta(`✅ Calendario generado: ${diasEnMes} días`, 'success');
  },

  async guardarMensual() {
    const calendarioDays = document.querySelectorAll('.calendar-day:not(.empty)');

    if (calendarioDays.length === 0) {
      Utils.mostrarAlerta('Primero genera el calendario', 'warning');
      return;
    }

    const programaciones = [];

    calendarioDays.forEach(dayElement => {
      const fecha = dayElement.dataset.fecha;

      // ✅ Obtener valores correctamente
      const horaEntradaInput = dayElement.querySelector('.hora-entrada');
      const horaSalidaInput = dayElement.querySelector('.hora-salida');
      const horasExtraInput = dayElement.querySelector('.horas-extra');
      const tipoDiaSelect = dayElement.querySelector('.tipo-dia');
      const descripcionInput = dayElement.querySelector('.descripcion');

      // Validar que los elementos existan
      if (!horaEntradaInput || !horaSalidaInput) {
        console.warn('Elementos no encontrados para fecha:', fecha);
        return;
      }

      const horaEntrada = horaEntradaInput.value + ':00';
      const horaSalida = horaSalidaInput.value + ':00';
      const horasExtra = parseFloat(horasExtraInput?.value || 0); // ✅ Convertir a número
      const tipoDia = tipoDiaSelect?.value || 'normal';
      const descripcion = descripcionInput?.value || '';

      programaciones.push({
        idUsuario: empleadoSeleccionado.idusuarios,
        idSupervisor: supervisorActual,
        fecha,
        horaEntrada,
        horaSalida,
        horasExtra,
        esDescanso: tipoDia === 'descanso',
        esDominical: tipoDia === 'dominical',
        descripcion: descripcion.trim() || null
      });
    });

    console.log(`📅 Guardando ${programaciones.length} días...`); // ✅ Corregido
    console.log('📦 Datos a guardar:', programaciones);

    const errores = [];
    let guardados = 0;

    Utils.mostrarAlerta(`Guardando ${programaciones.length} días...`, 'info'); // ✅ Corregido

    for (const prog of programaciones) {
      try {
        await API.post(`${ENDPOINTS.programacion}/guardar`, prog); // ✅ Corregido
        guardados++;
        console.log(`✅ Guardado día ${prog.fecha} con ${prog.horasExtra} horas extra`); // ✅ Corregido
      } catch (error) {
        errores.push(`Error en fecha ${prog.fecha}: ${error.message}`); // ✅ Corregido
        console.error('❌ Error:', error);
      }
    }

    if (errores.length === 0) {
      Utils.mostrarAlerta(`✅ ${guardados} días guardados correctamente`, 'success'); // ✅ Corregido
    } else {
      Utils.mostrarAlerta(`⚠️ Guardados: ${guardados}, Errores: ${errores.length}`, 'warning'); // ✅ Corregido
      console.error('❌ Errores:', errores);
    }

    this.cancelarAsignacion();
    this.cargar();
  },

  async guardar(e) {
    e.preventDefault();

    const fecha = document.getElementById('fechaHorario').value;
    const horaEntrada = document.getElementById('horaEntrada').value;
    const horaSalida = document.getElementById('horaSalida').value;
    const horasExtra = parseFloat(document.getElementById('horasExtra').value) || 0;
    const esDescanso = document.getElementById('esDescanso').value === 'true';
    const esDominical = document.getElementById('esDominical').value === 'true';
    const descripcion = document.getElementById('descripcionHorario').value;

    // Validar campos obligatorios
    if (!fecha || !horaEntrada || !horaSalida) {
      Utils.mostrarAlerta('Complete todos los campos obligatorios (*)', 'warning');
      return;
    }

    // Validar que el supervisor esté identificado
    if (!supervisorActual) {
      Utils.mostrarAlerta('Error: No se ha identificado el supervisor. Por favor, inicie sesión nuevamente.', 'danger');
      console.error('supervisorActual es null o undefined');
      return;
    }

    // ✅ CORRECCIÓN: Agregar segundos a las horas para formato LocalTime (HH:mm:ss)
    const horaEntradaCompleta = horaEntrada.includes(':') && horaEntrada.split(':').length === 2 
      ? `${horaEntrada}:00` 
      : horaEntrada;
    
    const horaSalidaCompleta = horaSalida.includes(':') && horaSalida.split(':').length === 2 
      ? `${horaSalida}:00` 
      : horaSalida;

    const datos = {
      idUsuario: empleadoSeleccionado.idusuarios,
      idSupervisor: supervisorActual,
      fecha,
      horaEntrada: horaEntradaCompleta,  // ✅ Formato HH:mm:ss
      horaSalida: horaSalidaCompleta,    // ✅ Formato HH:mm:ss
      horasExtra,
      esDescanso,
      esDominical,
      descripcion: descripcion?.trim() || null
    };

    // 🔍 Debug - Ver datos antes de enviar
    console.log('📤 Datos a enviar:', JSON.stringify(datos, null, 2));

    try {
      const response = await API.post(`${ENDPOINTS.programacion}/guardar`, datos);
      console.log('✅ Respuesta del servidor:', response);
      Utils.mostrarAlerta('Horario guardado correctamente', 'success');
      this.cancelarAsignacion();
      this.cargar();
    } catch (error) {
      console.error('❌ Error completo:', error);
      const mensajeError = error.message || 'Error desconocido al guardar';
      Utils.mostrarAlerta('Error al guardar: ' + mensajeError, 'danger');
    }
  },

  async editar(id) {
    try {
      const horario = await API.get(`${ENDPOINTS.programacion}/${id}`);
      empleadoSeleccionado = horario.usuario;
      
      const resultado = document.getElementById('resultadoHorario');
      resultado.style.display = 'block';
      resultado.innerHTML = `
        <h4 class="mb-3 text-warning">
          <i class="fas fa-edit me-2"></i>Editar Horario #${horario.idProgramacion}
        </h4>
        <div class="row mb-3">
          <div class="col-md-4"><strong>Cédula:</strong> ${horario.usuario.idusuarios}</div>
          <div class="col-md-4"><strong>Nombre:</strong> ${horario.usuario.nombre} ${horario.usuario.apellido}</div>
          <div class="col-md-4"><strong>Email:</strong> ${horario.usuario.correo || 'N/A'}</div>
        </div>
        <hr/>
        <h5><i class="fas fa-clock me-2"></i>Modificar horario</h5>
        <form id="formEditarHorario">
          <input type="hidden" id="idProgramacionEditar" value="${horario.idProgramacion}"/>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label"><i class="fas fa-calendar-day me-1"></i>Fecha *</label>
              <input type="date" id="fechaHorarioEditar" class="form-control" value="${horario.fecha}" required/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-sign-in-alt me-1"></i>Hora entrada *</label>
              <input type="time" id="horaEntradaEditar" class="form-control" value="${horario.horaEntrada}" required/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-sign-out-alt me-1"></i>Hora salida *</label>
              <input type="time" id="horaSalidaEditar" class="form-control" value="${horario.horaSalida}" required/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-stopwatch me-1"></i>Horas extra</label>
              <input type="number" id="horasExtraEditar" class="form-control" min="0" step="0.5" value="${horario.horasExtra || 0}"/>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-bed me-1"></i>¿Es descanso?</label>
              <select id="esDescansoEditar" class="form-select">
                <option value="false" ${!horario.esDescanso ? 'selected' : ''}>No</option>
                <option value="true" ${horario.esDescanso ? 'selected' : ''}>Sí</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label"><i class="fas fa-church me-1"></i>¿Es dominical?</label>
              <select id="esDominicalEditar" class="form-select">
                <option value="false" ${!horario.esDominical ? 'selected' : ''}>No</option>
                <option value="true" ${horario.esDominical ? 'selected' : ''}>Sí</option>
              </select>
            </div>
            <div class="col-md-12">
              <label class="form-label"><i class="fas fa-comment me-1"></i>Descripción</label>
              <textarea id="descripcionHorarioEditar" class="form-control" rows="2">${horario.descripcion || ''}</textarea>
            </div>
          </div>
          <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-warning">
              <i class="fas fa-save me-2"></i>Actualizar Horario
            </button>
            <button type="button" class="btn btn-secondary" onclick="Horarios.cancelarAsignacion()">
              <i class="fas fa-times me-2"></i>Cancelar
            </button>
          </div>
        </form>
      `;

      document.getElementById('formEditarHorario').addEventListener('submit', (e) => this.actualizar(e));
      resultado.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      Utils.mostrarAlerta('Error al cargar horario: ' + error.message, 'danger');
      console.error('Error:', error);
    }
  },

  async actualizar(e) {
    e.preventDefault();

    const id = document.getElementById('idProgramacionEditar').value;
    const fecha = document.getElementById('fechaHorarioEditar').value;
    const horaEntrada = document.getElementById('horaEntradaEditar').value;
    const horaSalida = document.getElementById('horaSalidaEditar').value;
    const horasExtra = parseFloat(document.getElementById('horasExtraEditar').value) || 0;
    const esDescanso = document.getElementById('esDescansoEditar').value === 'true';
    const esDominical = document.getElementById('esDominicalEditar').value === 'true';
    const descripcion = document.getElementById('descripcionHorarioEditar').value;

    // ✅ CORRECCIÓN: Agregar segundos a las horas
    const horaEntradaCompleta = horaEntrada.includes(':') && horaEntrada.split(':').length === 2 
      ? `${horaEntrada}:00` 
      : horaEntrada;
    
    const horaSalidaCompleta = horaSalida.includes(':') && horaSalida.split(':').length === 2 
      ? `${horaSalida}:00` 
      : horaSalida;

    const datos = {
      idProgramacion: id,
      idUsuario: empleadoSeleccionado.idusuarios,
      idSupervisor: supervisorActual,
      fecha,
      horaEntrada: horaEntradaCompleta,
      horaSalida: horaSalidaCompleta,
      horasExtra,
      esDescanso,
      esDominical,
      descripcion: descripcion?.trim() || null
    };

    console.log('📤 Datos de actualización:', JSON.stringify(datos, null, 2));

    try {
      await API.put(`${ENDPOINTS.programacion}/actualizar/${id}`, datos);
      Utils.mostrarAlerta('Horario actualizado correctamente', 'success');
      this.cancelarAsignacion();
      this.cargar();
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      Utils.mostrarAlerta('Error al actualizar: ' + error.message, 'danger');
    }
  },

  async eliminar(id) {
    if (!confirm('¿Está seguro de eliminar este horario?')) return;

    try {
      await API.delete(`${ENDPOINTS.programacion}/eliminar/${id}`);
      Utils.mostrarAlerta('Horario eliminado correctamente', 'success');
      this.cargar();
    } catch (error) {
      Utils.mostrarAlerta('Error al eliminar: ' + error.message, 'danger');
      console.error('Error:', error);
    }
  },

  cancelarAsignacion() {
    const resultado = document.getElementById('resultadoHorario');
    if (resultado) {
      resultado.style.display = 'none';
      resultado.innerHTML = '';
    }
    empleadoSeleccionado = null;
    
    const form = document.getElementById('formBuscarHorario');
    if (form) form.reset();
  },

  async cargar() {
    // ✅ Verificar si el usuario logueado es supervisor
    const rolUsuario = document.body.dataset.userRole; // o como tengas el rol guardado
    const idUsuario = supervisorActual; // ID del usuario logueado
    
    let url = `${API_BASE_URL}${ENDPOINTS.programacion}/`;
    
    // ✅ Si es supervisor, usar el endpoint que filtra por zona
    if (rolUsuario === 'Supervisor' && idUsuario) {
      url += `supervisor/${idUsuario}`;
      console.log('🔍 Cargando horarios de la zona del supervisor:', idUsuario);
    } else {
      // Si es admin o empleado, cargar todos
      url += 'listar';
    }
    
    await this.cargarDesdeURL(url);
    
    const infoFiltros = document.getElementById('infoFiltros');
    if (infoFiltros) infoFiltros.style.display = 'none';
  },

  async cargarDesdeURL(url) {
    const tbody = document.querySelector('#tablaHorarios tbody');
    const contadorHorarios = document.getElementById('contadorHorarios');
    const mensajeVacio = document.getElementById('mensajeVacio');
    
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando horarios...</p>
        </td>
      </tr>
    `;

    try {
      const data = await fetch(url).then(res => res.json());
      tbody.innerHTML = '';
      
      if (!data || data.length === 0) {
        if (mensajeVacio) mensajeVacio.style.display = 'block';
        if (contadorHorarios) contadorHorarios.textContent = '0 horarios';
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center text-muted py-4">
              <i class="fas fa-inbox fa-3x mb-3"></i>
              <p>No se encontraron horarios con los filtros aplicados</p>
            </td>
          </tr>
        `;
        return;
      }

      if (mensajeVacio) mensajeVacio.style.display = 'none';
      if (contadorHorarios) {
        contadorHorarios.textContent = `${data.length} horario${data.length !== 1 ? 's' : ''}`;
      }

      data.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>
            <div class="d-flex align-items-center">
              <div>
                <strong>${p.usuario?.nombre || 'N/A'} ${p.usuario?.apellido || ''}</strong>
                <br>
                <small class="text-muted">ID: ${p.usuario?.idusuarios || 'N/A'}</small>
              </div>
            </div>
          </td>
          <td>
            
            ${Utils.formatearFechaCorta(p.fecha)}
          </td>
          <td>
            <span class="badge bg-success">
              <i class="fas fa-clock me-1"></i>${p.horaEntrada || 'N/A'}
            </span>
          </td>
          <td>
            <span class="badge bg-danger">
              <i class="fas fa-clock me-1"></i>${p.horaSalida || 'N/A'}
            </span>
          </td>
          <td>
            <small class="text-muted">
              ${p.descripcion || '<em>Sin descripción</em>'}
            </small>
          </td>
          <td class="text-center">
            <button 
              class="btn btn-warning btn-sm me-1" 
              onclick="Horarios.editar(${p.idProgramacion})"
              title="Editar">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    } catch (error) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <p>Error al cargar horarios: ${error.message}</p>
          </td>
        </tr>
      `;
      console.error('Error:', error);
      if (contadorHorarios) contadorHorarios.textContent = '0 horarios';
    }
  },

  cambiarVista() {
    const vista = document.getElementById('filtroVista')?.value;
    const idContainer = document.getElementById('filtroIdContainer');
    const yearContainer = document.getElementById('filtroYearContainer');
    const monthContainer = document.getElementById('filtroMonthContainer');
    const tipoIdLabel = document.getElementById('tipoIdLabel');

    if (!vista) return;

    // Ocultar todos los contenedores
    [idContainer, yearContainer, monthContainer].forEach(el => {
      if (el) el.style.display = 'none';
    });

    switch(vista) {
      case 'empleado':
        if (idContainer) idContainer.style.display = 'block';
        if (tipoIdLabel) tipoIdLabel.textContent = 'Empleado';
        break;
      case 'supervisor':
        if (idContainer) idContainer.style.display = 'block';
        if (tipoIdLabel) tipoIdLabel.textContent = 'Supervisor';
        break;
      case 'mes':
        if (idContainer) idContainer.style.display = 'block';
        if (yearContainer) yearContainer.style.display = 'block';
        if (monthContainer) monthContainer.style.display = 'block';
        if (tipoIdLabel) tipoIdLabel.textContent = 'Empleado';
        break;
    }
  },

  aplicarFiltros() {
    const vista = document.getElementById('filtroVista')?.value;
    const idUsuario = document.getElementById('filtroIdUsuario')?.value;
    const year = document.getElementById('filtroYear')?.value;
    const month = document.getElementById('filtroMonth')?.value;
    const infoFiltros = document.getElementById('infoFiltros');
    const textoFiltros = document.getElementById('textoFiltros');

    let url = `${API_BASE_URL}${ENDPOINTS.programacion}/`;
    let infoTexto = '';

    switch(vista) {
      case 'todos':
        // ✅ Si es supervisor, aplicar filtro automáticamente
        if (supervisorActual) {
          url += `supervisor/${supervisorActual}`;
          infoTexto = 'Mostrando horarios de tu zona';
        } else {
          url += 'listar';
          infoTexto = 'Mostrando todos los horarios';
        }
        if (infoFiltros) infoFiltros.style.display = infoTexto ? 'block' : 'none';
        break;
      case 'empleado':
        if (!idUsuario) {
          Utils.mostrarAlerta('Ingrese el ID del empleado', 'warning');
          return;
        }
        url += `empleado/${idUsuario}`;
        infoTexto = `Mostrando horarios del empleado ID: ${idUsuario}`;
        break;
      case 'supervisor':
        // ✅ Para supervisores, siempre usar su propio ID
        const idSupervisorFiltro = supervisorActual || idUsuario;
        if (!idSupervisorFiltro) {
          Utils.mostrarAlerta('Ingrese el ID del supervisor', 'warning');
          return;
        }
        url += `supervisor/${idSupervisorFiltro}`;
        infoTexto = `Mostrando horarios del supervisor ID: ${idSupervisorFiltro}`;
        break;
      case 'mes':
        if (!idUsuario || !year || !month) {
          Utils.mostrarAlerta('Complete todos los campos para buscar por mes', 'warning');
          return;
        }
        url += `empleado/${idUsuario}/mes?year=${year}&month=${month}`;
        const nombreMes = document.querySelector(`#filtroMonth option[value="${month}"]`)?.textContent;
        infoTexto = `Mostrando horarios del empleado ID: ${idUsuario} - ${nombreMes} ${year}`;
        break;
    }

    if (infoTexto && textoFiltros && infoFiltros) {
      textoFiltros.textContent = infoTexto;
      infoFiltros.style.display = 'block';
    }

    this.cargarDesdeURL(url);
  }
  }
 // ====== GESTIÓN DE INCAPACIDADES ======
  const Incapacidades = {
    init() {
      this.cargarIncapacidades();
      
      // Vincular botón de refrescar si existe
      const btnRefresh = document.getElementById('btnRefreshIncapacidades');
      if (btnRefresh) {
        btnRefresh.addEventListener('click', () => this.cargarIncapacidades());
      }
    },

    async cargarIncapacidades() {
      const tabla = document.getElementById('tablaIncapacidades');
      const tbody = tabla?.querySelector('tbody') || tabla;
      
      if (!tbody) {
        console.error('❌ No se encontró la tabla de incapacidades');
        return;
      }

      // Mostrar loading
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando incapacidades...</p>
          </td>
        </tr>
      `;

      try {
        // ✅ Cargar incapacidades de la zona del supervisor
        let url = ENDPOINTS.incapacidades;
        
        if (supervisorActual) {
          console.log('🔍 Cargando incapacidades del supervisor:', supervisorActual);
          url = `${ENDPOINTS.incapacidades}/zona/${supervisorActual}`;
        }
        
        console.log('📋 URL de incapacidades:', url);
        const data = await API.get(url);
        
        tbody.innerHTML = '';

        if (!data || data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No hay incapacidades registradas</p>
              </td>
            </tr>
          `;
          return;
        }

        // Renderizar incapacidades
        data.forEach(inc => {
          const fila = document.createElement('tr');
          
          // Determinar si se pueden mostrar botones (solo PENDIENTES)
          const esPendiente = inc.estado && inc.estado.toUpperCase() === 'PENDIENTE';
          const botonesAccion = esPendiente ? `
            <button 
              class="btn btn-success btn-sm me-1" 
              onclick="Incapacidades.aprobar('${inc.idIncapacidad}')"
              title="Aprobar">
              <i class="fas fa-check"></i> Aprobar
            </button>
            <button 
              class="btn btn-danger btn-sm" 
              onclick="Incapacidades.rechazar('${inc.idIncapacidad}')"
              title="Rechazar">
              <i class="fas fa-times"></i> Rechazar
            </button>
          ` : `
            <span class="text-muted"><i class="fas fa-check-circle"></i> Procesada</span>
          `;

          // Botón para descargar archivo si existe
          const botonArchivo = inc.archivoSoporte ? `
            <a 
              href="http://localhost:9090/api/incapacidades/archivo/${inc.archivoSoporte}"
              class="btn btn-info btn-sm"
              title="Descargar soporte"
              download>
              <i class="fas fa-download"></i> Archivo
            </a>
          ` : `
            <span class="text-muted text-sm"><i class="fas fa-times-circle"></i> Sin archivo</span>
          `;

          fila.innerHTML = `
            <td>
              <div>
                <strong>${inc.nombreEmpleado || 'N/A'}</strong>
                <br>
                <small class="text-muted">ID: ${inc.idusuarios}</small>
              </div>
            </td>
            <td>
              <span class="badge bg-info">
                ${inc.tipo || 'General'}
              </span>
            </td>
            <td>
              <small>
                <i class="fas fa-calendar-day me-1"></i>
                ${Utils.formatearFechaCorta(inc.fechaInicio)}
              </small>
            </td>
            <td>
              <small>
                <i class="fas fa-calendar-day me-1"></i>
                ${Utils.formatearFechaCorta(inc.fechaFin)}
              </small>
            </td>
            <td>
              <small class="text-muted">
                ${inc.motivo || '<em>Sin motivo</em>'}
              </small>
            </td>
            <td class="text-center">
              <span class="badge bg-${this.colorEstado(inc.estado)}">
                ${inc.estado}
              </span>
            </td>
            <td class="text-center">
              ${botonArchivo}
            </td>
            <td class="text-center">
              ${botonesAccion}
            </td>
          `;
          
          tbody.appendChild(fila);
        });

        Utils.mostrarAlerta(`✅ ${data.length} incapacidad(es) cargada(s)`, 'success');

      } catch (error) {
        console.error('❌ Error al cargar incapacidades:', error);
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="text-center text-danger py-4">
              <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
              <p>Error al cargar incapacidades: ${error.message}</p>
              <button class="btn btn-primary btn-sm" onclick="Incapacidades.cargarIncapacidades()">
                <i class="fas fa-redo me-2"></i>Reintentar
              </button>
            </td>
          </tr>
        `;
      }
    },

    async aprobar(id) {
      if (!confirm('¿Está seguro de aprobar esta incapacidad?')) return;

      try {
        // ✅ Usar el endpoint correcto de ENDPOINTS
        await API.put(ENDPOINTS.aprobarIncapacidad(id), {});
        Utils.mostrarAlerta('✅ Incapacidad aprobada correctamente', 'success');
        this.cargarIncapacidades();
      } catch (error) {
        console.error('❌ Error al aprobar:', error);
        Utils.mostrarAlerta('❌ Error al aprobar: ' + error.message, 'danger');
      }
    },

    async rechazar(id) {
      const motivo = prompt('Ingrese el motivo del rechazo (opcional):');
      
      if (motivo === null) return; // Usuario canceló

      try {
        // ✅ Usar el endpoint correcto de ENDPOINTS
        await API.put(ENDPOINTS.rechazarIncapacidad(id), { 
          motivo: motivo.trim() || 'Sin motivo especificado' 
        });
        Utils.mostrarAlerta('✅ Incapacidad rechazada correctamente', 'success');
        this.cargarIncapacidades();
      } catch (error) {
        console.error('❌ Error al rechazar:', error);
        Utils.mostrarAlerta('❌ Error al rechazar: ' + error.message, 'danger');
      }
    },

    colorEstado(estado) {
      const colores = {
        'PENDIENTE': 'warning',
        'APROBADA': 'success',
        'APROBADO': 'success',
        'RECHAZADA': 'danger',
        'RECHAZADO': 'danger',
        'CANCELADA': 'secondary',
        'CANCELADO': 'secondary'
      };
      return colores[estado?.toUpperCase()] || 'secondary';
    }
  };


// ====== GESTIÓN DE VACACIONES ======
const Vacaciones = {
  init() {
    this.cargarVacaciones();
    
    // Vincular botón de refrescar si existe
    const btnRefresh = document.getElementById('btnRefreshVacaciones');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.cargarVacaciones());
    }
  },

  async cargarVacaciones() {
    const tabla = document.getElementById('tablaVacaciones');
    const tbody = tabla?.querySelector('tbody') || tabla;
    
    if (!tbody) {
      console.error('❌ No se encontró la tabla de vacaciones');
      return;
    }

    // Mostrar loading
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3 text-muted">Cargando vacaciones...</p>
        </td>
      </tr>
    `;

    try {
      // ✅ Cargar vacaciones de la zona del supervisor
      let url = ENDPOINTS.vacacionesTodas;
      
      if (supervisorActual) {
        console.log('🔍 Cargando vacaciones del supervisor:', supervisorActual);
        url = ENDPOINTS.vacacionesPorZona(supervisorActual);
      }
      
      console.log('📋 URL de vacaciones:', url);
      let data = [];
      
      try {
        data = await API.get(url);
        console.log('✅ Vacaciones obtenidas:', data);
      } catch (error) {
        console.warn('⚠️ Error al cargar vacaciones por zona, intentando sin filtro:', error.message);
        
        // Fallback: intentar cargar todas las vacaciones
        try {
          data = await API.get(ENDPOINTS.vacacionesTodas);
          console.log('✅ Vacaciones (sin filtro) obtenidas:', data);
        } catch (error2) {
          console.error('❌ Error al cargar vacaciones:', error2.message);
          throw error2;
        }
      }
      
      tbody.innerHTML = '';      if (!data || data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center text-muted py-4">
              <i class="fas fa-inbox fa-3x mb-3"></i>
              <p>No hay solicitudes de vacaciones registradas</p>
            </td>
          </tr>
        `;
        return;
      }

      // Renderizar vacaciones
      data.forEach(vac => {
        const fila = document.createElement('tr');
        
        // Determinar si se pueden mostrar botones (solo PENDIENTE)
        const esPendiente = vac.estado && vac.estado.toUpperCase() === 'PENDIENTE';
        const botonesAccion = esPendiente ? `
          <button 
            class="btn btn-success btn-sm me-1" 
            onclick="Vacaciones.aprobar('${vac.idVacacion}')"
            title="Aprobar">
            <i class="fas fa-check"></i> Aprobar
          </button>
          <button 
            class="btn btn-danger btn-sm" 
            onclick="Vacaciones.rechazar('${vac.idVacacion}')"
            title="Rechazar">
            <i class="fas fa-times"></i> Rechazar
          </button>
        ` : `
          <span class="text-muted"><i class="fas fa-check-circle"></i> Procesada</span>
        `;

        fila.innerHTML = `
          <td>
            <div>
              <strong>${vac.nombreEmpleado || 'N/A'}</strong>
              <br>
              <small class="text-muted">ID: ${vac.idUsuario}</small>
            </div>
          </td>
          <td>
            <small>
              <i class="fas fa-calendar-day me-1"></i>
              ${Utils.formatearFechaCorta(vac.fechaInicio)}
            </small>
          </td>
          <td>
            <small>
              <i class="fas fa-calendar-day me-1"></i>
              ${Utils.formatearFechaCorta(vac.fechaFin)}
            </small>
          </td>
          <td class="text-center">
            <span class="badge bg-info">
              ${this.calcularDias(vac.fechaInicio, vac.fechaFin)} días
            </span>
          </td>
          <td>
            <small class="text-muted">
              ${vac.comentarios || '<em>Sin comentarios</em>'}
            </small>
          </td>
          <td class="text-center">
            <span class="badge bg-${this.colorEstado(vac.estado)}">
              ${vac.estado}
            </span>
          </td>
          <td class="text-center">
            ${botonesAccion}
          </td>
        `;
        
        tbody.appendChild(fila);
      });

      Utils.mostrarAlerta(`✅ ${data.length} solicitud(es) de vacaciones cargada(s)`, 'success');

    } catch (error) {
      console.error('❌ Error al cargar vacaciones:', error);
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-danger py-4">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <p><strong>Error al cargar las vacaciones</strong></p>
            <p class="small">${error.message || 'Intente nuevamente'}</p>
          </td>
        </tr>
      `;
    }
  },

  async aprobar(idVacacion) {
    if (!confirm('¿Estás seguro de que deseas APROBAR esta solicitud de vacaciones?')) {
      return;
    }

    try {
      console.log('📤 Aprobando vacación:', idVacacion);
      const url = `${ENDPOINTS.cambiarEstadoVacacion(idVacacion)}?estado=Aprobado`;
      console.log('🔗 URL:', url);
      
      const response = await API.put(url, {});
      console.log('✅ Respuesta del servidor:', response);
      
      Utils.mostrarAlerta('✅ Solicitud de vacaciones aprobada correctamente', 'success');
      
      // Pequeño delay para asegurar que la BD actualizó
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.cargarVacaciones();
    } catch (error) {
      console.error('❌ Error:', error);
      Utils.mostrarAlerta('❌ Error al aprobar la solicitud: ' + error.message, 'danger');
    }
  },

  async rechazar(idVacacion) {
    if (!confirm('¿Estás seguro de que deseas RECHAZAR esta solicitud de vacaciones?')) {
      return;
    }

    try {
      console.log('📤 Rechazando vacación:', idVacacion);
      const url = `${ENDPOINTS.cambiarEstadoVacacion(idVacacion)}?estado=Rechazado`;
      console.log('🔗 URL:', url);
      
      const response = await API.put(url, {});
      console.log('✅ Respuesta del servidor:', response);
      
      Utils.mostrarAlerta('✅ Solicitud de vacaciones rechazada correctamente', 'success');
      
      // Pequeño delay para asegurar que la BD actualizó
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.cargarVacaciones();
    } catch (error) {
      console.error('❌ Error:', error);
      Utils.mostrarAlerta('❌ Error al rechazar la solicitud: ' + error.message, 'danger');
    }
  },

  calcularDias(inicio, fin) {
    if (!inicio || !fin) return 0;
    const start = new Date(inicio);
    const end = new Date(fin);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  },

  colorEstado(estado) {
    const colores = {
      'PENDIENTE': 'warning',
      'Pendiente': 'warning',
      'APROBADO': 'success',
      'Aprobado': 'success',
      'APROBADA': 'success',
      'Aprobada': 'success',
      'RECHAZADO': 'danger',
      'Rechazado': 'danger',
      'RECHAZADA': 'danger',
      'Rechazada': 'danger',
      'CANCELADO': 'secondary',
      'Cancelado': 'secondary',
      'CANCELADA': 'secondary',
      'Cancelada': 'secondary'
    };
    return colores[estado] || 'secondary';
  }
};

// ====== GESTIÓN DE TRASLADOS ======
const Traslados = {
  init() {
    const form = document.getElementById('formTraslados');
    if (form) {
      form.addEventListener('submit', (e) => this.registrar(e));
    }
  },

  async registrar(e) {
    e.preventDefault();

    const empleado = document.getElementById('empleadoTraslado').value;
    const sucursalActual = document.getElementById('sucursalActual').value;
    const sucursalDestino = document.getElementById('sucursalDestino').value;
    const fechaTraslado = document.getElementById('fechaTraslado').value;
    const motivo = document.getElementById('motivoTraslado').value;

    if (!empleado || !sucursalActual || !sucursalDestino || !fechaTraslado) {
      Utils.mostrarAlerta('Complete todos los campos requeridos', 'warning');
      return;
    }

    if (sucursalActual === sucursalDestino) {
      Utils.mostrarAlerta('La sucursal destino debe ser diferente a la actual', 'warning');
      return;
    }

    const datos = {
      empleado,
      sucursalActual,
      sucursalDestino,
      fechaTraslado,
      motivo
    };

    try {
      const data = await API.post(ENDPOINTS.traslados, datos);
      
      if (data.success) {
        Utils.mostrarAlerta('Traslado registrado correctamente', 'success');
        e.target.reset();
      } else {
        Utils.mostrarAlerta('Error al registrar traslado', 'danger');
      }
    } catch (error) {
      Utils.mostrarAlerta('Error de conexión con el servidor', 'danger');
      console.error('Error:', error);
    }
  }
};

// ====== GESTIÓN DE REPORTES ======
const Reportes = {
  init() {
    const form = document.getElementById('formReportes');
    if (form) {
      form.addEventListener('submit', (e) => this.generar(e));
    }
  },

  async generar(e) {
    e.preventDefault();

    const tipoReporte = document.getElementById('tipoReporte').value;
    const periodo = document.getElementById('periodoReporte').value;
    const fechaInicio = document.getElementById('fechaInicioReporte').value;
    const fechaFin = document.getElementById('fechaFinReporte').value;

    if (!tipoReporte || !periodo) {
      Utils.mostrarAlerta('Por favor seleccione el tipo de reporte y período', 'warning');
      return;
    }

    if (!fechaInicio || !fechaFin) {
      Utils.mostrarAlerta('Por favor ingrese las fechas de inicio y fin', 'warning');
      return;
    }

    if (!Utils.validarFechas(fechaInicio, fechaFin)) {
      Utils.mostrarAlerta('La fecha de inicio debe ser anterior a la fecha fin', 'warning');
      return;
    }

    const datos = {
      tipo: tipoReporte,
      periodo,
      fechaInicio,
      fechaFin
    };

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando reporte...';

    try {
      const blob = await API.getBlob(ENDPOINTS.reportes, datos);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipoReporte}_${periodo}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      Utils.mostrarAlerta('Reporte generado y descargado correctamente', 'success');
      e.target.reset();
    } catch (error) {
      Utils.mostrarAlerta('Error al generar el reporte: ' + error.message, 'danger');
      console.error('Error:', error);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = textoOriginal;
    }
  }
};

// ====== FUNCIONES GLOBALES (para compatibilidad con HTML inline) ======
window.toggleSidebar = function() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
};

window.cambiarVista = function() {
  Horarios.cambiarVista();
};

window.aplicarFiltros = function() {
  Horarios.aplicarFiltros();
};

window.cargarHorarios = function() {
  Horarios.cargar();
};

window.editarHorario = function(id) {
  Horarios.editar(id);
};

window.eliminarHorario = function(id) {
  Horarios.eliminar(id);
};

// ====== INICIALIZACIÓN PRINCIPAL ======
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando Dashboard Supervisor...');
  
  // ✅ IMPORTANTE: Obtener ID del supervisor logueado
  obtenerSupervisorLogueado();
  
  // Inicializar módulos
  Dashboard.init();
  Navegacion.init();
  Empleados.init();
  Horarios.init();
  Incapacidades.init();
  Vacaciones.init();
  Traslados.init();
  Reportes.init();
  
  // Cargar horarios inicialmente
  Horarios.cargar();
  
  console.log('✅ Dashboard Supervisor inicializado correctamente');
  console.log('👤 Supervisor ID:', supervisorActual);
});