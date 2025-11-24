// ================= MÓDULO DE SUCURSALES Y ZONAS - CON TABS Y ESTADÍSTICAS =================

const SucursalesZonasModule = {
  sucursales: [],
  zonas: [],
  supervisores: [],
  empleados: [],
  sucursalEditando: null,
  zonaEditando: null,
  inicializado: false,
  tabActual: 'sucursales',

  // Inicializar el módulo
  async init() {
    if (this.inicializado) {
      console.log('Módulo ya inicializado, omitiendo...');
      return;
    }
    
    console.log('Iniciando módulo de sucursales y zonas...');
    
    this.inicializado = true;
    this.initEventListeners();
    await this.cargarDatos();
    
    console.log('Módulo iniciado correctamente');
  },

  // Event Listeners
  initEventListeners() {
    // ===== TABS =====
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.cambiarTab(tab);
      });
    });

    // Botón "Nueva" dinámico
    const btnNuevo = document.getElementById('btn-nuevo');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => {
        if (this.tabActual === 'sucursales') {
          this.toggleFormSucursal();
        } else {
          this.toggleFormZona();
        }
      });
    }

    // ===== SUCURSALES =====
    const btnGuardarSucursal = document.getElementById('btn-guardar-sucursal');
    if (btnGuardarSucursal) {
      btnGuardarSucursal.addEventListener('click', () => this.guardarSucursal());
    }

    const btnCancelarSucursal = document.getElementById('btn-cancelar-sucursal');
    if (btnCancelarSucursal) {
      btnCancelarSucursal.addEventListener('click', () => this.cancelarFormSucursal());
    }

    // ===== ZONAS =====
    const btnGuardarZona = document.getElementById('btn-guardar-zona');
    if (btnGuardarZona) {
      btnGuardarZona.addEventListener('click', () => this.guardarZona());
    }

    const btnCancelarZona = document.getElementById('btn-cancelar-zona');
    if (btnCancelarZona) {
      btnCancelarZona.addEventListener('click', () => this.cancelarFormZona());
    }
  },

  // Cambiar entre tabs
  cambiarTab(tab) {
    this.tabActual = tab;

    // Actualizar botones de tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tab) {
        btn.classList.add('active');
      }
    });

    // Actualizar contenido de tabs
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Ocultar formularios al cambiar de tab
    this.cancelarFormSucursal();
    this.cancelarFormZona();
  },

  // Cargar todos los datos en el orden correcto
  async cargarDatos() {
    try {
      // 1. Cargar empleados para obtener conteos
      await this.cargarEmpleados();
      
      // 2. Cargar supervisores
      await this.cargarSupervisores();
      
      // 3. Cargar zonas
      await this.cargarZonasData();
      
      // 4. Cargar sucursales
      await this.cargarSucursales();
      
      // 5. Renderizar zonas
      this.renderZonas();
      
      // 6. Actualizar estadísticas
      this.actualizarEstadisticas();
      
      console.log('Datos cargados:', {
        sucursales: this.sucursales.length,
        zonas: this.zonas.length,
        supervisores: this.supervisores.length,
        empleados: this.empleados.length
      });
      
    } catch (error) {
      console.error('Error en carga de datos:', error);
      this.mostrarMensaje('Error al cargar los datos', 'error');
    }
  },

  // Actualizar estadísticas
  actualizarEstadisticas() {
    document.getElementById('total-sucursales').textContent = this.sucursales.length;
    document.getElementById('total-zonas').textContent = this.zonas.length;
    document.getElementById('total-empleados').textContent = this.empleados.length;
    document.getElementById('total-supervisores').textContent = this.supervisores.length;
  },

  // ========== EMPLEADOS ==========

  async cargarEmpleados() {
    try {
      const response = await fetch('/empleados/filtrar?sucursalId=todas&rolId=todos');
      if (!response.ok) throw new Error('Error al cargar empleados');
      
      this.empleados = await response.json();
      console.log('Empleados cargados:', this.empleados.length);
      
      // Log para debugging - ver estructura de datos
      if (this.empleados.length > 0) {
        console.log('Ejemplo de empleado:', this.empleados[0]);
        console.log('Estructura de sucursal en empleado:', this.empleados[0].sucursal);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
      this.empleados = [];
    }
  },

  // Contar empleados por sucursal
  contarEmpleadosPorSucursal(idSucursal) {
    const count = this.empleados.filter(e => {
      // Intentar diferentes formatos de estructura de datos
      const sucursalId = e.sucursal?.idSucursal || 
                        e.sucursal?.id_sucursal || 
                        e.idSucursal || 
                        e.id_sucursal ||
                        e.sucursal_id;
      return sucursalId == idSucursal;
    }).length;
    
    return count;
  },

  // ========== SUCURSALES ==========

  toggleFormSucursal(sucursal = null) {
    const formContainer = document.getElementById('form-sucursal-container');
    const formTitle = document.getElementById('form-sucursal-title');
    const isHidden = formContainer.style.display === 'none';

    if (isHidden) {
      formContainer.style.display = 'block';
      
      const selectZonas = document.getElementById('id_zona_sucursal');
      selectZonas.innerHTML = '<option value="">Seleccione una zona...</option>' +
        this.zonas.map(z => `<option value="${z.idZona}">${z.nombreZona}</option>`).join('');

      if (sucursal) {
        this.sucursalEditando = sucursal.idSucursal || sucursal.id_sucursal;
        formTitle.textContent = 'Editar Sucursal';
        document.getElementById('id_sucursal').value = sucursal.idSucursal || sucursal.id_sucursal || '';
        document.getElementById('nombreSucursal').value = sucursal.nombreSucursal || '';
        document.getElementById('id_zona_sucursal').value = sucursal.idZona || sucursal.id_zona || '';
        document.getElementById('ciudad').value = sucursal.ciudad || '';
        document.getElementById('direccion').value = sucursal.direccion || '';
        document.getElementById('telefono').value = sucursal.telefono || '';
        document.getElementById('correo').value = sucursal.correo || '';
      } else {
        this.sucursalEditando = null;
        formTitle.textContent = 'Nueva Sucursal';
        document.getElementById('formSucursal').reset();
      }

      formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      this.cancelarFormSucursal();
    }
  },

  cancelarFormSucursal() {
    const formContainer = document.getElementById('form-sucursal-container');
    formContainer.style.display = 'none';
    document.getElementById('formSucursal').reset();
    this.sucursalEditando = null;
  },

  async cargarSucursales() {
    try {
      const response = await fetch('/sucursales');
      if (!response.ok) throw new Error('Error al cargar sucursales');
      
      const data = await response.json();
      
      // Normalizar los datos
      this.sucursales = data.map(s => ({
        idSucursal: s.idSucursal || s.id_sucursal,
        nombreSucursal: s.nombreSucursal || s.nombre_sucursal || 'Sin nombre',
        idZona: s.idZona || s.id_zona,
        ciudad: s.ciudad || 'N/A',
        direccion: s.direccion || 'N/A',
        telefono: s.telefono || '',
        correo: s.correo || ''
      }));
      
      console.log('Sucursales cargadas:', this.sucursales.length);
      this.renderSucursales();
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al cargar sucursales', 'error');
    }
  },

  renderSucursales() {
    const container = document.getElementById('lista-sucursales');
    if (!container) return;

    if (this.sucursales.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-building"></i>
          <p>No hay sucursales registradas</p>
          <small>Haz clic en "Nueva" para agregar una sucursal</small>
        </div>
      `;
      return;
    }

    container.innerHTML = this.sucursales.map(s => {
      const empleadosCount = this.contarEmpleadosPorSucursal(s.idSucursal);
      
      // Log para debugging
      console.log(`Sucursal "${s.nombreSucursal}" (ID: ${s.idSucursal}): ${empleadosCount} empleados`);
      
      return `
        <div class="sucursal-card">
          <div class="sucursal-main-info">
            <div class="sucursal-icon">
              <i class="fas fa-building"></i>
            </div>
            
            <div class="sucursal-content">
              <div class="sucursal-header">
                <h6 class="sucursal-title">${s.nombreSucursal}</h6>
                <span class="badge-zona">
                  <i class="fas fa-map-marked-alt"></i>
                  ${this.getNombreZona(s.idZona)}
                </span>
                <span class="badge-empleados">
                  <i class="fas fa-users"></i>
                  ${empleadosCount} empleado${empleadosCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div class="sucursal-details">
                <div class="sucursal-info">
                  <i class="fas fa-city"></i>
                  <span><strong>${s.ciudad}</strong></span>
                </div>
                
                <div class="sucursal-info">
                  <i class="fas fa-location-dot"></i>
                  <span>${s.direccion}</span>
                </div>
                
                ${s.telefono ? `
                  <div class="sucursal-info">
                    <i class="fas fa-phone"></i>
                    <span>${s.telefono}</span>
                  </div>
                ` : ''}
                
                ${s.correo ? `
                  <div class="sucursal-info">
                    <i class="fas fa-envelope"></i>
                    <span>${s.correo}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <div class="btn-actions">
            <button class="btn btn-sm btn-outline-primary" 
                    onclick="SucursalesZonasModule.editarSucursal(${s.idSucursal})" 
                    title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" 
                    onclick="SucursalesZonasModule.eliminarSucursal(${s.idSucursal})" 
                    title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  getNombreZona(idZona) {
    if (!idZona) return 'Sin zona';
    const zona = this.zonas.find(z => z.idZona == idZona);
    return zona ? zona.nombreZona : 'Sin zona';
  },

  async guardarSucursal() {
    const form = document.getElementById('formSucursal');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      nombreSucursal: document.getElementById('nombreSucursal').value.trim(),
      idZona: parseInt(document.getElementById('id_zona_sucursal').value),
      ciudad: document.getElementById('ciudad').value.trim(),
      direccion: document.getElementById('direccion').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      correo: document.getElementById('correo').value.trim()
    };

    try {
      const url = this.sucursalEditando ? `/sucursales/${this.sucursalEditando}` : '/sucursales';
      const method = this.sucursalEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al guardar');

      this.cancelarFormSucursal();
      this.mostrarMensaje(
        this.sucursalEditando ? 'Sucursal actualizada correctamente' : 'Sucursal creada correctamente',
        'success'
      );
      await this.cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al guardar la sucursal', 'error');
    }
  },

  async editarSucursal(id) {
    try {
      const response = await fetch(`/sucursales/${id}`);
      if (!response.ok) throw new Error('Error al obtener sucursal');
      
      const sucursal = await response.json();
      this.toggleFormSucursal(sucursal);
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al cargar la sucursal', 'error');
    }
  },

  async eliminarSucursal(id) {
    const empleadosCount = this.contarEmpleadosPorSucursal(id);
    
    if (empleadosCount > 0) {
      this.mostrarMensaje(
        `No se puede eliminar. Hay ${empleadosCount} empleado(s) en esta sucursal`,
        'warning'
      );
      return;
    }

    if (!confirm('¿Eliminar esta sucursal?\n\nEsta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/sucursales/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');

      this.mostrarMensaje('Sucursal eliminada correctamente', 'success');
      await this.cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al eliminar la sucursal', 'error');
    }
  },

  // ========== ZONAS ==========

  toggleFormZona(zona = null) {
    const formContainer = document.getElementById('form-zona-container');
    const formTitle = document.getElementById('form-zona-title');
    const isHidden = formContainer.style.display === 'none';

    if (isHidden) {
      formContainer.style.display = 'block';
      
      const selectSupervisores = document.getElementById('supervisor_zona');
      selectSupervisores.innerHTML = '<option value="">Seleccione un supervisor...</option>' +
        this.supervisores.map(s => 
          `<option value="${s.idusuarios}">${s.nombre} ${s.apellido}</option>`
        ).join('');

      if (zona) {
        this.zonaEditando = zona.idZona;
        formTitle.textContent = 'Editar Zona';
        document.getElementById('id_zona').value = zona.idZona;
        document.getElementById('nombreZona').value = zona.nombreZona || '';
        document.getElementById('supervisor_zona').value = zona.supervisor?.idusuarios || zona.idusuarios || '';
      } else {
        this.zonaEditando = null;
        formTitle.textContent = 'Nueva Zona';
        document.getElementById('formZona').reset();
      }

      formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      this.cancelarFormZona();
    }
  },

  cancelarFormZona() {
    const formContainer = document.getElementById('form-zona-container');
    formContainer.style.display = 'none';
    document.getElementById('formZona').reset();
    this.zonaEditando = null;
  },

  async cargarZonasData() {
    try {
      const response = await fetch('/api/zonas');
      if (!response.ok) throw new Error('Error al cargar zonas');
      
      const data = await response.json();
      
      // Normalizar los datos
      this.zonas = data.map(z => ({
        idZona: z.idZona || z.id_zona,
        nombreZona: z.nombreZona || z.nombre_zona || 'Sin nombre',
        supervisor: z.supervisor || null,
        idusuarios: z.idusuarios || (z.supervisor ? z.supervisor.idusuarios : null)
      }));
      
      console.log('Zonas cargadas:', this.zonas.length);
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al cargar zonas', 'error');
    }
  },

  async cargarZonas() {
    await this.cargarZonasData();
    this.renderZonas();
  },

  renderZonas() {
    const container = document.getElementById('lista-zonas');
    if (!container) return;

    if (this.zonas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-map-marked-alt"></i>
          <p>No hay zonas registradas</p>
          <small>Haz clic en "Nueva" para agregar una zona</small>
        </div>
      `;
      return;
    }

    container.innerHTML = this.zonas.map(z => `
      <div class="zona-card">
        <div class="zona-main-info">
          <div class="zona-icon">
            <i class="fas fa-map-marked-alt"></i>
          </div>
          
          <div class="zona-content">
            <div class="zona-header">
              <h6 class="zona-title">${z.nombreZona}</h6>
              <span class="badge-supervisor">
                <i class="fas fa-user-tie"></i>
                ${this.getNombreSupervisor(z.idusuarios)}
              </span>
            </div>
            
            <div class="zona-details">
              <div class="zona-info">
                <i class="fas fa-building"></i>
                <span><strong>${this.contarSucursalesPorZona(z.idZona)}</strong> sucursal(es)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="btn-actions">
          <button class="btn btn-sm btn-outline-success" 
                  onclick="SucursalesZonasModule.editarZona(${z.idZona})" 
                  title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="SucursalesZonasModule.eliminarZona(${z.idZona})" 
                  title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  getNombreSupervisor(idSupervisor) {
    if (!idSupervisor) return 'Sin asignar';
    
    const supervisor = this.supervisores.find(s => s.idusuarios == idSupervisor);
    return supervisor ? `${supervisor.nombre} ${supervisor.apellido}` : 'Sin asignar';
  },

  contarSucursalesPorZona(idZona) {
    return this.sucursales.filter(s => s.idZona == idZona).length;
  },

  async guardarZona() {
    const form = document.getElementById('formZona');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      nombreZona: document.getElementById('nombreZona').value.trim(),
      idusuarios: parseInt(document.getElementById('supervisor_zona').value)
    };

    try {
      const url = this.zonaEditando ? `/api/zonas/${this.zonaEditando}` : '/zonas';
      const method = this.zonaEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al guardar');

      this.cancelarFormZona();
      this.mostrarMensaje(
        this.zonaEditando ? 'Zona actualizada correctamente' : 'Zona creada correctamente',
        'success'
      );
      await this.cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al guardar la zona', 'error');
    }
  },

  async editarZona(id) {
    try {
      const response = await fetch(`/api/zonas/${id}`);
      if (!response.ok) throw new Error('Error al obtener zona');
      
      const zona = await response.json();
      this.toggleFormZona(zona);
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al cargar la zona', 'error');
    }
  },

  async eliminarZona(id) {
    const sucursalesEnZona = this.contarSucursalesPorZona(id);
    
    if (sucursalesEnZona > 0) {
      this.mostrarMensaje(
        `No se puede eliminar. Hay ${sucursalesEnZona} sucursal(es) en esta zona`,
        'warning'
      );
      return;
    }

    if (!confirm('¿Eliminar esta zona?\n\nEsta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/zonas/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');

      this.mostrarMensaje('Zona eliminada correctamente', 'success');
      await this.cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al eliminar la zona', 'error');
    }
  },

  // ========== SUPERVISORES ==========

  async cargarSupervisores() {
    try {
      const response = await fetch('/empleados/filtrar?sucursalId=todas&rolId=todos');
      if (!response.ok) throw new Error('Error al cargar supervisores');
      
      const todos = await response.json();
      this.supervisores = todos.filter(u => 
        u.rol?.tipo_rol === 'SUPERVISOR' || u.rol?.tipo_rol === 'Supervisor'
      );
      
      console.log('Supervisores cargados:', this.supervisores.length);
    } catch (error) {
      console.error('Error cargando supervisores:', error);
      this.supervisores = [];
    }
  },

  // ========== UTILIDADES ==========

  mostrarMensaje(mensaje, tipo = 'success') {
    const colores = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    const iconos = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      color: #1e293b;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      z-index: 9999;
      font-weight: 500;
      min-width: 320px;
      border-left: 4px solid ${colores[tipo]};
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    
    notification.innerHTML = `
      <i class="fas fa-${iconos[tipo]}" style="color: ${colores[tipo]}; font-size: 1.2rem;"></i>
      <span>${mensaje}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3500);
  }
};

// CSS para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  const seccion = document.getElementById('sucursales-section');
  if (seccion && !SucursalesZonasModule.inicializado) {
    SucursalesZonasModule.init();
  }
});

// Exponer globalmente
window.SucursalesZonasModule = SucursalesZonasModule;