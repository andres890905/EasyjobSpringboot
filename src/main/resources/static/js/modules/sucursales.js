// ================= MÓDULO DE SUCURSALES Y ZONAS - DISEÑO HORIZONTAL =================

const SucursalesZonasModule = {
  sucursales: [],
  zonas: [],
  supervisores: [],
  sucursalEditando: null,
  zonaEditando: null,
  inicializado: false,

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
    // ===== SUCURSALES =====
    
    const btnToggleSucursal = document.getElementById('btn-toggle-form-sucursal');
    if (btnToggleSucursal) {
      btnToggleSucursal.addEventListener('click', () => this.toggleFormSucursal());
    }

    const btnGuardarSucursal = document.getElementById('btn-guardar-sucursal');
    if (btnGuardarSucursal) {
      btnGuardarSucursal.addEventListener('click', () => this.guardarSucursal());
    }

    const btnCancelarSucursal = document.getElementById('btn-cancelar-sucursal');
    if (btnCancelarSucursal) {
      btnCancelarSucursal.addEventListener('click', () => this.cancelarFormSucursal());
    }

    // ===== ZONAS =====
    
    const btnToggleZona = document.getElementById('btn-toggle-form-zona');
    if (btnToggleZona) {
      btnToggleZona.addEventListener('click', () => this.toggleFormZona());
    }

    const btnGuardarZona = document.getElementById('btn-guardar-zona');
    if (btnGuardarZona) {
      btnGuardarZona.addEventListener('click', () => this.guardarZona());
    }

    const btnCancelarZona = document.getElementById('btn-cancelar-zona');
    if (btnCancelarZona) {
      btnCancelarZona.addEventListener('click', () => this.cancelarFormZona());
    }
  },

  // Cargar todos los datos en el orden correcto
  async cargarDatos() {
    try {
      // 1. Primero cargar supervisores
      await this.cargarSupervisores();
      
      // 2. Luego cargar zonas (sin renderizar aún)
      await this.cargarZonasData();
      
      // 3. Cargar sucursales
      await this.cargarSucursales();
      
      // 4. Ahora sí renderizar zonas (ya tenemos sucursales para contar)
      this.renderZonas();
      
    } catch (error) {
      console.error('Error en carga de datos:', error);
      this.mostrarMensaje('Error al cargar los datos', 'error');
    }
  },

  // ========== SUCURSALES ==========

  toggleFormSucursal(sucursal = null) {
    const formContainer = document.getElementById('form-sucursal-container');
    const btnText = document.getElementById('text-btn-sucursal');
    const isHidden = formContainer.style.display === 'none';

    if (isHidden) {
      formContainer.style.display = 'block';
      btnText.textContent = 'Ocultar';
      
      const selectZonas = document.getElementById('id_zona_sucursal');
      selectZonas.innerHTML = '<option value="">Seleccione...</option>' +
        this.zonas.map(z => `<option value="${z.idZona}">${z.nombreZona}</option>`).join('');

      if (sucursal) {
        this.sucursalEditando = sucursal.id_sucursal;
        document.getElementById('id_sucursal').value = sucursal.id_sucursal;
        document.getElementById('nombreSucursal').value = sucursal.nombreSucursal || '';
        document.getElementById('id_zona_sucursal').value = sucursal.id_zona || '';
        document.getElementById('ciudad').value = sucursal.ciudad || '';
        document.getElementById('direccion').value = sucursal.direccion || '';
        document.getElementById('telefono').value = sucursal.telefono || '';
        document.getElementById('correo').value = sucursal.correo || '';
      } else {
        this.sucursalEditando = null;
        document.getElementById('formSucursal').reset();
      }

      formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      this.cancelarFormSucursal();
    }
  },

  cancelarFormSucursal() {
    const formContainer = document.getElementById('form-sucursal-container');
    const btnText = document.getElementById('text-btn-sucursal');
    
    formContainer.style.display = 'none';
    btnText.textContent = 'Nueva';
    document.getElementById('formSucursal').reset();
    this.sucursalEditando = null;
  },

  async cargarSucursales() {
    try {
      const response = await fetch('/sucursales');
      if (!response.ok) throw new Error('Error al cargar sucursales');
      
      this.sucursales = await response.json();
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
          <small class="text-muted">Haz clic en "Nueva" para agregar una</small>
        </div>
      `;
      return;
    }

    container.innerHTML = this.sucursales.map(s => `
      <div class="sucursal-card">
        <div class="sucursal-main-info">
          <div class="sucursal-icon">
            <i class="fas fa-building"></i>
          </div>
          
          <div class="sucursal-content">
            <div class="sucursal-header">
              <h6 class="sucursal-title">${s.nombreSucursal || 'Sin nombre'}</h6>
              <span class="badge-zona">
                <i class="fas fa-map-marked-alt"></i>
                ${this.getNombreZona(s.id_zona)}
              </span>
            </div>
            
            <div class="sucursal-details">
              <div class="sucursal-info">
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>${s.ciudad || 'N/A'}</strong></span>
              </div>
              
              <div class="sucursal-info">
                <i class="fas fa-location-dot"></i>
                <span>${s.direccion || 'N/A'}</span>
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
                  onclick="SucursalesZonasModule.editarSucursal(${s.id_sucursal})" 
                  title="Editar sucursal">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="SucursalesZonasModule.eliminarSucursal(${s.id_sucursal})" 
                  title="Eliminar sucursal">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  getNombreZona(idZona) {
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
      id_zona: parseInt(document.getElementById('id_zona_sucursal').value),
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
      await this.cargarSucursales();
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
    if (!confirm('¿Eliminar esta sucursal?\n\nEsta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/sucursales/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');

      this.mostrarMensaje('Sucursal eliminada correctamente', 'success');
      await this.cargarSucursales();
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al eliminar la sucursal', 'error');
    }
  },

  // ========== ZONAS ==========

  toggleFormZona(zona = null) {
    const formContainer = document.getElementById('form-zona-container');
    const btnText = document.getElementById('text-btn-zona');
    const isHidden = formContainer.style.display === 'none';

    if (isHidden) {
      formContainer.style.display = 'block';
      btnText.textContent = 'Ocultar';
      
      const selectSupervisores = document.getElementById('supervisor_zona');
      selectSupervisores.innerHTML = '<option value="">Seleccione un supervisor...</option>' +
        this.supervisores.map(s => 
          `<option value="${s.idusuarios}">${s.nombre} ${s.apellido}</option>`
        ).join('');

      if (zona) {
        this.zonaEditando = zona.idZona;
        document.getElementById('id_zona').value = zona.idZona;
        document.getElementById('nombreZona').value = zona.nombreZona || '';
        document.getElementById('supervisor_zona').value = zona.supervisor?.idusuarios || '';
      } else {
        this.zonaEditando = null;
        document.getElementById('formZona').reset();
      }

      formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      this.cancelarFormZona();
    }
  },

  cancelarFormZona() {
    const formContainer = document.getElementById('form-zona-container');
    const btnText = document.getElementById('text-btn-zona');
    
    formContainer.style.display = 'none';
    btnText.textContent = 'Nueva';
    document.getElementById('formZona').reset();
    this.zonaEditando = null;
  },

  // Cargar solo los datos sin renderizar
  async cargarZonasData() {
    try {
      const response = await fetch('/zonas');
      if (!response.ok) throw new Error('Error al cargar zonas');
      
      this.zonas = await response.json();
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al cargar zonas', 'error');
    }
  },

  // Cargar y renderizar zonas
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
          <small class="text-muted">Haz clic en "Nueva" para agregar una</small>
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
              <h6 class="zona-title">${z.nombreZona || 'Sin nombre'}</h6>
              <span class="badge-supervisor">
                <i class="fas fa-user-tie"></i>
                ${this.getNombreSupervisor(z.supervisor?.idusuarios)}
              </span>
            </div>
            
            <div class="zona-details">
              <div class="zona-info">
                <i class="fas fa-building"></i>
                <span><strong>${this.contarSucursalesPorZona(z.idZona)}</strong> sucursal(es) asignadas</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="btn-actions">
          <button class="btn btn-sm btn-outline-success" 
                  onclick="SucursalesZonasModule.editarZona(${z.idZona})" 
                  title="Editar zona">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="SucursalesZonasModule.eliminarZona(${z.idZona})" 
                  title="Eliminar zona">
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
    const zona = this.zonas.find(z => z.idZona == idZona);
    const sucursales = this.sucursales.filter(s => s.id_zona == idZona);
    
    // Log temporal para debugging
    if (zona && zona.nombreZona.includes('Norte')) {
      console.log('Zona Norte - ID:', idZona);
      console.log('Sucursales en esta zona:', sucursales);
      console.log('Todas las sucursales:', this.sucursales.map(s => ({
        nombre: s.nombreSucursal,
        id_zona: s.id_zona
      })));
    }
    
    return sucursales.length;
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
      const url = this.zonaEditando ? `/zonas/${this.zonaEditando}` : '/zonas';
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
      const response = await fetch(`/zonas/${id}`);
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
      const response = await fetch(`/zonas/${id}`, { method: 'DELETE' });
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
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
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