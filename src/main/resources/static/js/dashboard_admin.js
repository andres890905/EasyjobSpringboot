// ================= CONFIGURACIÓN GLOBAL =================
const CONFIG = {
  endpoints: {
    filtrar: '/empleados/filtrar',
    toggleEstado: '/empleados/{id}/estado',
    crear: '/empleados',
    editar: '/empleados/{id}',
    obtener: '/empleados/{id}',
    eliminar: '/empleados/{id}'
  }
};

// ================= ESTADO DE LA APLICACIÓN =================
const AppState = {
  empleados: [],
  filtros: {
    sucursal: 'todas',
    rol: 'todos'
  },
  empleadoEditando: null
};

// ================= UTILIDADES =================
const Utils = {
  toggleModal(modalId, show = true) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = show ? 'flex' : 'none';
      modal.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
  },

  showNotification(message, type = 'success') {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8',
      warning: '#ffc107'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidCedula(cedula) {
    return /^\d{7,10}$/.test(cedula);
  },

  formatEndpoint(endpoint, params = {}) {
    let url = endpoint;
    Object.keys(params).forEach(key => {
      url = url.replace(`{${key}}`, params[key]);
    });
    return url;
  },

  // Nueva función: Convertir datos del formulario a tipos correctos
  parseFormData(formData) {
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Convertir campos numéricos
    if (data.cedula) data.cedula = parseInt(data.cedula, 10);
    if (data.rol) data.rol = parseInt(data.rol, 10);
    if (data.sucursal) data.sucursal = parseInt(data.sucursal, 10);
    if (data.salario) data.salario = parseFloat(data.salario);

    return data;
  },

  // Nueva función: Confirmar acción
  async confirmar(mensaje) {
    return confirm(mensaje);
  }
};

// ================= API SERVICE =================
const EmpleadosAPI = {
  async filtrar(sucursalId = 'todas', rolId = 'todos') {
    try {
      const url = `${CONFIG.endpoints.filtrar}?sucursalId=${sucursalId}&rolId=${rolId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al filtrar empleados:', error);
      throw error;
    }
  },

  async toggleEstado(usuarioId) {
    try {
      const url = Utils.formatEndpoint(CONFIG.endpoints.toggleEstado, { id: usuarioId });
      const response = await fetch(url, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  },

  async crear(empleadoData) {
    try {
      console.log('Enviando datos al crear:', empleadoData);
      
      const response = await fetch(CONFIG.endpoints.crear, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleadoData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = 'No se pudo crear el empleado';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error || errorJson.message || errorMsg;
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        
        throw new Error(errorMsg);
      }
      
      // Manejar respuestas sin cuerpo
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al crear empleado:', error);
      throw error;
    }
  },

  async editar(usuarioId, empleadoData) {
    try {
      const url = Utils.formatEndpoint(CONFIG.endpoints.editar, { id: usuarioId });
      console.log('Editando empleado:', url, empleadoData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleadoData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = 'No se pudo editar el empleado';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error || errorJson.message || errorMsg;
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        
        throw new Error(errorMsg);
      }
      
      // Manejar respuestas sin cuerpo
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al editar empleado:', error);
      throw error;
    }
  },

  async eliminar(usuarioId) {
    try {
      const url = Utils.formatEndpoint(CONFIG.endpoints.eliminar, { id: usuarioId });
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = 'No se pudo eliminar el empleado';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error || errorJson.message || errorMsg;
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        
        throw new Error(errorMsg);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      throw error;
    }
  }
};

// ================= MÓDULO SIDEBAR =================
const SidebarModule = {
  init() {
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const dynamicSection = document.getElementById('dynamic-section');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.id === 'btn-logout') return;
        
        e.preventDefault();
        this.activateSection(link, links, sections, dynamicSection);
      });
    });
  },

  activateSection(activeLink, allLinks, allSections, dynamicSection) {
    allLinks.forEach(l => l.classList.remove('active'));
    allSections.forEach(s => s.classList.remove('active'));
    if (dynamicSection) dynamicSection.style.display = 'none';

    activeLink.classList.add('active');
    const targetId = activeLink.id.replace('btn-', '') + '-section';
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      targetSection.classList.add('active');
      
      // Cargar datos según la sección activada
      if (targetId === 'empleados-section') {
        EmpleadosModule.cargarEmpleados();
      } else if (targetId === 'sucursales-section' && typeof SucursalesModule !== 'undefined') {
        console.log('Cargando sucursales...');
        SucursalesModule.cargarSucursales();
      }
    }
  }
};

// ================= MÓDULO EMPLEADOS =================
const EmpleadosModule = {
  elements: {},

  init() {
    this.elements = {
      empleadosList: document.getElementById('empleados-list'),
      sucursalSelect: document.getElementById('sucursal'),
      rolSelect: document.getElementById('rol'),
      btnNuevo: document.getElementById('btn-nuevo-empleado')
    };

    if (!this.elements.empleadosList) {
      console.warn('No se encontró el contenedor de empleados');
      return;
    }

    this.initEventListeners();
    this.cargarEmpleados();
  },

  initEventListeners() {
    if (this.elements.sucursalSelect) {
      this.elements.sucursalSelect.addEventListener('change', () => {
        AppState.filtros.sucursal = this.elements.sucursalSelect.value;
        this.cargarEmpleados();
      });
    }

    if (this.elements.rolSelect) {
      this.elements.rolSelect.addEventListener('change', () => {
        AppState.filtros.rol = this.elements.rolSelect.value;
        this.cargarEmpleados();
      });
    }

    this.elements.empleadosList.addEventListener('click', (e) => {
      this.handleTableClick(e);
    });

    if (this.elements.btnNuevo) {
      this.elements.btnNuevo.addEventListener('click', () => {
        ModalNuevoModule.abrir();
      });
    }
  },

  handleTableClick(e) {
    const btnEstado = e.target.closest('.btn-accion:not(.editar-empleado):not(.eliminar-empleado)');
    if (btnEstado) {
      this.toggleEstado(btnEstado);
      return;
    }

    const btnEditar = e.target.closest('.editar-empleado');
    if (btnEditar) {
      const usuarioId = btnEditar.dataset.id;
      ModalEditarModule.abrir(usuarioId);
      return;
    }

    const btnEliminar = e.target.closest('.eliminar-empleado');
    if (btnEliminar) {
      const usuarioId = btnEliminar.dataset.id;
      this.eliminarEmpleado(usuarioId);
      return;
    }
  },

  async cargarEmpleados() {
    if (!this.elements.empleadosList) return;

    try {
      this.elements.empleadosList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #666;">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p style="margin-top: 1rem;">Cargando empleados...</p>
        </div>
      `;

      const empleados = await EmpleadosAPI.filtrar(
        AppState.filtros.sucursal,
        AppState.filtros.rol
      );

      AppState.empleados = empleados;
      this.renderTabla(empleados);

    } catch (error) {
      console.error('Error cargando empleados:', error);
      this.elements.empleadosList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #dc3545;">
          <i class="fas fa-exclamation-triangle fa-2x"></i>
          <p style="margin-top: 1rem;">Error al cargar empleados. Por favor, intente nuevamente.</p>
        </div>
      `;
    }
  },

  renderTabla(empleados) {
    if (empleados.length === 0) {
      this.elements.empleadosList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #666;">
          <i class="fas fa-users fa-2x"></i>
          <p style="margin-top: 1rem;">No se encontraron empleados con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    let html = `
      <table class="tabla-empleados">
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Sucursal</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    empleados.forEach(emp => {
      const esActivo = emp.estado === 'ACTIVO';
      html += `
        <tr>
          <td>${emp.idusuarios || 'N/A'}</td>
          <td>${emp.nombre} ${emp.apellido}</td>
          <td>${emp.correo}</td>
          <td>${emp.rol?.tipo_rol || 'N/A'}</td>
          <td>${emp.sucursal?.nombreSucursal || 'N/A'}</td>
          <td>
            <button 
              class="btn-accion ${esActivo ? 'activo' : 'inactivo'}" 
              data-id="${emp.idusuarios}"
              title="Clic para cambiar estado"
            >
              ${esActivo ? 'Activo' : 'Inactivo'}
            </button>
          </td>
          <td>
            <button 
              class="btn-accion editar editar-empleado" 
              data-id="${emp.idusuarios}"
              title="Editar empleado"
            >
              <i class="fas fa-edit"></i> Editar
            </button>
            
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    this.elements.empleadosList.innerHTML = html;
  },

  async toggleEstado(btn) {
    const usuarioId = btn.dataset.id;
    if (!usuarioId) return;

    btn.disabled = true;
    const textoOriginal = btn.textContent;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
      const usuario = await EmpleadosAPI.toggleEstado(usuarioId);
      
      const esActivo = usuario.estado === 'ACTIVO';
      btn.textContent = esActivo ? 'Activo' : 'Inactivo';
      btn.classList.toggle('activo', esActivo);
      btn.classList.toggle('inactivo', !esActivo);

      const empleado = AppState.empleados.find(e => e.idusuarios == usuarioId);
      if (empleado) {
        empleado.estado = usuario.estado;
      }

      Utils.showNotification('Estado actualizado correctamente', 'success');

    } catch (error) {
      btn.textContent = textoOriginal;
      Utils.showNotification('No se pudo actualizar el estado', 'error');
    } finally {
      btn.disabled = false;
    }
  },

  async eliminarEmpleado(usuarioId) {
    const empleado = AppState.empleados.find(e => e.idusuarios == usuarioId);
    const nombre = empleado ? `${empleado.nombre} ${empleado.apellido}` : 'este empleado';
    
    const confirmar = await Utils.confirmar(
      `¿Está seguro de eliminar a ${nombre}?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmar) return;

    try {
      await EmpleadosAPI.eliminar(usuarioId);
      Utils.showNotification('Empleado eliminado correctamente', 'success');
      this.cargarEmpleados();
    } catch (error) {
      Utils.showNotification(error.message || 'No se pudo eliminar el empleado', 'error');
    }
  }
};

// ================= MÓDULO MODAL NUEVO EMPLEADO =================
const ModalNuevoModule = {
  elements: {},

  init() {
    this.elements = {
      modal: document.getElementById('modal-nuevo'),
      form: document.getElementById('form-nuevo-empleado'),
      btnCerrar: document.getElementById('cerrar-nuevo'),
      btnCancelar: document.getElementById('cancelar-nuevo'),
      btnGuardar: document.getElementById('guardar-nuevo')
    };

    if (!this.elements.modal) {
      console.warn('Modal nuevo no encontrado');
      return;
    }

    this.initEventListeners();
  },

  initEventListeners() {
    [this.elements.btnCerrar, this.elements.btnCancelar].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.cerrar());
      }
    });

    if (this.elements.form) {
      this.elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.guardar();
      });
    }

    if (this.elements.modal) {
      this.elements.modal.addEventListener('click', (e) => {
        if (e.target === this.elements.modal) {
          this.cerrar();
        }
      });
    }
  },

  abrir() {
    if (this.elements.form) {
      this.elements.form.reset();
    }
    Utils.toggleModal('modal-nuevo', true);
  },

  cerrar() {
    Utils.toggleModal('modal-nuevo', false);
    if (this.elements.form) {
      this.elements.form.reset();
    }
  },

  async guardar() {
    const formData = new FormData(this.elements.form);
    const empleadoData = Utils.parseFormData(formData);

    console.log('Datos del formulario nuevo:', empleadoData);

    // Validaciones
    if (!empleadoData.cedula || !Utils.isValidCedula(empleadoData.cedula.toString())) {
      Utils.showNotification('Cédula inválida (debe tener entre 7 y 10 dígitos)', 'error');
      return;
    }

    if (!empleadoData.correo || !Utils.isValidEmail(empleadoData.correo)) {
      Utils.showNotification('Correo electrónico inválido', 'error');
      return;
    }

    if (!empleadoData.nombre || !empleadoData.apellido) {
      Utils.showNotification('Nombre y apellido son obligatorios', 'error');
      return;
    }

    if (!empleadoData.password || empleadoData.password.length < 6) {
      Utils.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    try {
      if (this.elements.btnGuardar) {
        this.elements.btnGuardar.disabled = true;
        this.elements.btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
      }

      console.log('Enviando datos al servidor:', empleadoData);
      await EmpleadosAPI.crear(empleadoData);
      
      Utils.showNotification('Empleado creado exitosamente', 'success');
      this.cerrar();
      EmpleadosModule.cargarEmpleados();
      
    } catch (error) {
      console.error('Error completo:', error);
      Utils.showNotification(error.message || 'Error al crear empleado', 'error');
    } finally {
      if (this.elements.btnGuardar) {
        this.elements.btnGuardar.disabled = false;
        this.elements.btnGuardar.innerHTML = '<i class="fas fa-user-plus"></i> Agregar Empleado';
      }
    }
  }
};

// ================= MÓDULO MODAL EDITAR EMPLEADO =================
const ModalEditarModule = {
  elements: {},

  init() {
    this.elements = {
      modal: document.getElementById('modal-editar'),
      form: document.getElementById('form-editar-empleado'),
      btnCerrar: document.getElementById('cerrar-modal'),
      btnCancelar: document.getElementById('cancelar-editar')
    };

    if (!this.elements.modal) return;

    this.initEventListeners();
  },

  initEventListeners() {
    [this.elements.btnCerrar, this.elements.btnCancelar].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.cerrar());
      }
    });

    if (this.elements.form) {
      this.elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.guardar();
      });
    }

    if (this.elements.modal) {
      this.elements.modal.addEventListener('click', (e) => {
        if (e.target === this.elements.modal) {
          this.cerrar();
        }
      });
    }
  },

  abrir(usuarioId) {
    AppState.empleadoEditando = usuarioId;

    const empleado = AppState.empleados.find(emp => emp.idusuarios == usuarioId);
    
    if (empleado) {
      this.cargarDatos(empleado);
      Utils.toggleModal('modal-editar', true);
    } else {
      Utils.showNotification('No se encontró el empleado seleccionado', 'error');
      console.error('Empleado no encontrado:', usuarioId);
    }
  },

  cerrar() {
    Utils.toggleModal('modal-editar', false);
    AppState.empleadoEditando = null;
    if (this.elements.form) {
      this.elements.form.reset();
    }
  },

  cargarDatos(empleado) {
    if (!this.elements.form) return;

    console.log('Cargando empleado:', empleado);

    const camposMap = {
      'editar-cedula': empleado.idusuarios,
      'editar-nombre': empleado.nombre,
      'editar-apellido': empleado.apellido,
      'editar-correo': empleado.correo,
      'editar-rol': empleado.rol?.id_roles || empleado.rol_id,
      'editar-sucursal': empleado.sucursal?.id_sucursal || empleado.sucursal_id,
      'editar-salario': empleado.salario
    };

    Object.keys(camposMap).forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input && camposMap[fieldId] !== undefined && camposMap[fieldId] !== null) {
        input.value = camposMap[fieldId];
      }
    });

    console.log('Datos cargados en el formulario');
  },

  async guardar() {
    const formData = new FormData(this.elements.form);
    const empleadoData = Utils.parseFormData(formData);

    // Validaciones
    if (!Utils.isValidEmail(empleadoData.correo)) {
      Utils.showNotification('Correo electrónico inválido', 'error');
      return;
    }

    // Si hay contraseña, validarla
    if (empleadoData.password && empleadoData.password.length < 6) {
      Utils.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    // Si la contraseña está vacía, no enviarla
    if (!empleadoData.password || empleadoData.password === '') {
      delete empleadoData.password;
    }

    try {
      const btnGuardar = document.getElementById('guardar-editar');
      if (btnGuardar) {
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
      }

      await EmpleadosAPI.editar(AppState.empleadoEditando, empleadoData);
      
      Utils.showNotification('Empleado actualizado exitosamente', 'success');
      this.cerrar();
      EmpleadosModule.cargarEmpleados();
      
    } catch (error) {
      Utils.showNotification(error.message || 'Error al actualizar empleado', 'error');
    } finally {
      const btnGuardar = document.getElementById('guardar-editar');
      if (btnGuardar) {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
      }
    }
  }
};

// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando aplicación...');
  
  SidebarModule.init();
  EmpleadosModule.init();
  ModalNuevoModule.init();
  ModalEditarModule.init();
  
  // Inicializar módulo de sucursales si existe
  if (typeof SucursalesModule !== 'undefined' && !SucursalesModule.inicializado) {
    SucursalesModule.init();
    console.log('Módulo de sucursales inicializado');
  }
  
  console.log('Aplicación inicializada correctamente');
});