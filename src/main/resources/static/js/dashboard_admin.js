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

    // Agregar botón de toggle si no existe
    this.createToggleButton();
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

      // Ocultar sidebar en secciones específicas (opcional)
      const seccionesConSidebarOculto = ['empleados-section','reportes-section', 'sucursales-section'];
      if (seccionesConSidebarOculto.includes(targetId)) {
        this.hideSidebar();
      } else {
        this.showSidebar();
      }

      // Cargar datos según la sección activada
      if (targetId === 'empleados-section') {
        EmpleadosModule.cargarEmpleados();
      } else if (targetId === 'sucursales-section' && typeof SucursalesModule !== 'undefined') {
        console.log('Cargando sucursales...');
        SucursalesModule.cargarSucursales();
      }
    }
  },

  hideSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (sidebar && mainContent) {
      sidebar.classList.add('sidebar-hidden');
      mainContent.classList.add('content-expanded');
    }
  },

  showSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (sidebar && mainContent) {
      sidebar.classList.remove('sidebar-hidden');
      mainContent.classList.remove('content-expanded');
    }
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (sidebar && mainContent) {
      sidebar.classList.toggle('sidebar-hidden');
      mainContent.classList.toggle('content-expanded');
    }
  },

  createToggleButton() {
    // Verificar si ya existe el botón
    if (document.getElementById('sidebar-toggle-btn')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'sidebar-toggle-btn';
    toggleBtn.className = 'btn btn-dark sidebar-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.title = 'Mostrar/Ocultar menú';
    
    toggleBtn.addEventListener('click', () => {
      this.toggleSidebar();
      
      // Cambiar icono del botón
      const icon = toggleBtn.querySelector('i');
      if (icon.classList.contains('fa-bars')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    document.body.appendChild(toggleBtn);
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
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <p>No se encontraron empleados con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="table-container">
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

    html += `
          </tbody>
        </table>
      </div>
    `;
    
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

// ================= MÓDULO MODAL VER EMPLEADO =================
const ModalVerModule = {
  elements: {},

  init() {
    this.elements = {
      modal: document.getElementById('modal-ver-empleado'),
      btnCerrar: document.getElementById('cerrar-ver-empleado')
    };

    if (!this.elements.modal) {
      this.crearModal();
    }

    this.initEventListeners();
  },

  crearModal() {
    const modalHTML = `
      <div id="modal-ver-empleado" class="modal modal-hoja-vida" style="display: none;" aria-hidden="true">
        <div class="modal-content modal-hoja-vida-content">
          <!-- Header estilo CV -->
          <div class="cv-header">
            <button class="close-btn-cv" id="cerrar-ver-empleado" aria-label="Cerrar">
              <i class="fas fa-times"></i>
            </button>
            <div class="cv-foto-placeholder">
              <i class="fas fa-user"></i>
            </div>
            <div class="cv-header-info" id="cv-header-info"></div>
          </div>
          
          <!-- Body estilo CV -->
          <div class="cv-body" id="detalles-empleado-content"></div>
          
          <!-- Footer con opciones -->
          <div class="cv-footer">
            <button type="button" class="btn btn-secondary" id="cerrar-ver-empleado-footer">
              <i class="fas fa-times"></i> Cerrar
            </button>
            <button type="button" class="btn btn-primary" id="imprimir-cv">
              <i class="fas fa-print"></i> Imprimir CV
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.elements = {
      modal: document.getElementById('modal-ver-empleado'),
      btnCerrar: document.getElementById('cerrar-ver-empleado'),
      btnCerrarFooter: document.getElementById('cerrar-ver-empleado-footer'),
      btnImprimir: document.getElementById('imprimir-cv')
    };
  },

  initEventListeners() {
    if (this.elements.btnCerrar) {
      this.elements.btnCerrar.addEventListener('click', () => this.cerrar());
    }

    if (this.elements.btnCerrarFooter) {
      this.elements.btnCerrarFooter.addEventListener('click', () => this.cerrar());
    }

    if (this.elements.btnImprimir) {
      this.elements.btnImprimir.addEventListener('click', () => this.imprimirCV());
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
    const empleado = AppState.empleados.find(emp => emp.idusuarios == usuarioId);
    
    if (empleado) {
      this.renderCV(empleado);
      Utils.toggleModal('modal-ver-empleado', true);
    } else {
      Utils.showNotification('No se encontró el empleado seleccionado', 'error');
    }
  },

  cerrar() {
    Utils.toggleModal('modal-ver-empleado', false);
  },

  imprimirCV() {
    window.print();
  },

  formatearMoneda(valor) {
    if (!valor && valor !== 0) return 'No especificado';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  },

  formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    
    try {
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(fechaObj);
    } catch (e) {
      return 'Fecha inválida';
    }
  },

  calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    
    try {
      const hoy = new Date();
      const nacimiento = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
      
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      
      return edad;
    } catch (e) {
      return null;
    }
  },

  renderCV(empleado) {
    const headerInfo = document.getElementById('cv-header-info');
    const content = document.getElementById('detalles-empleado-content');
    if (!headerInfo || !content) return;

    const edad = this.calcularEdad(empleado.fecha_nacimiento);
    const esActivo = empleado.estado === 'ACTIVO';

    // Renderizar header
    headerInfo.innerHTML = `
      <h1 class="cv-nombre">${empleado.nombre} ${empleado.apellido}</h1>
      <p class="cv-cargo">${empleado.rol?.tipo_rol || 'Empleado'}</p>
      <div class="cv-estado-badge ${esActivo ? 'estado-activo' : 'estado-inactivo'}">
        <i class="fas fa-circle"></i> ${esActivo ? 'ACTIVO' : 'INACTIVO'}
      </div>
    `;

    // Renderizar body con secciones de CV
    content.innerHTML = `
      <!-- Información de Contacto -->
      <div class="cv-section">
        <div class="cv-section-title">
          <i class="fas fa-address-card"></i>
          <h2>Información de Contacto</h2>
        </div>
        <div class="cv-grid">
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-id-card"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Cédula</span>
              <span class="cv-item-value">${empleado.idusuarios || 'N/A'}</span>
            </div>
          </div>
          
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-envelope"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Correo Electrónico</span>
              <span class="cv-item-value">${empleado.correo || 'No especificado'}</span>
            </div>
          </div>
          
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-phone"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Teléfono</span>
              <span class="cv-item-value">${empleado.telefono || 'No especificado'}</span>
            </div>
          </div>
          
          <div class="cv-item full-width">
            <div class="cv-item-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Dirección</span>
              <span class="cv-item-value">${empleado.direccion || 'No especificada'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información Personal -->
      <div class="cv-section">
        <div class="cv-section-title">
          <i class="fas fa-user"></i>
          <h2>Información Personal</h2>
        </div>
        <div class="cv-grid">
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-birthday-cake"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Fecha de Nacimiento</span>
              <span class="cv-item-value">
                ${this.formatearFecha(empleado.fecha_nacimiento)}
                ${edad ? `<span class="cv-edad">(${edad} años)</span>` : ''}
              </span>
            </div>
          </div>
          
          ${empleado.fechaRegistro ? `
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-calendar-plus"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Fecha de Ingreso</span>
              <span class="cv-item-value">${this.formatearFecha(empleado.fechaRegistro)}</span>
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Información Laboral -->
      <div class="cv-section cv-section-highlight">
        <div class="cv-section-title">
          <i class="fas fa-briefcase"></i>
          <h2>Información Laboral</h2>
        </div>
        <div class="cv-grid">
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-user-tag"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Cargo / Rol</span>
              <span class="cv-item-value cv-rol">${empleado.rol?.tipo_rol || 'No asignado'}</span>
            </div>
          </div>
          
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-building"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Sucursal</span>
              <span class="cv-item-value">${empleado.sucursal?.nombreSucursal || 'No asignada'}</span>
            </div>
          </div>
          
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-dollar-sign"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Salario</span>
              <span class="cv-item-value cv-salario">${this.formatearMoneda(empleado.salario)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de Sucursal -->
      ${empleado.sucursal ? `
      <div class="cv-section">
        <div class="cv-section-title">
          <i class="fas fa-store"></i>
          <h2>Ubicación de Trabajo</h2>
        </div>
        <div class="cv-grid">
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-building"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Nombre Sucursal</span>
              <span class="cv-item-value">${empleado.sucursal.nombreSucursal || 'N/A'}</span>
            </div>
          </div>

          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-city"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Ciudad</span>
              <span class="cv-item-value">${empleado.sucursal.ciudad || 'No especificada'}</span>
            </div>
          </div>
          
          <div class="cv-item full-width">
            <div class="cv-item-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Dirección</span>
              <span class="cv-item-value">${empleado.sucursal.direccion || 'No especificada'}</span>
            </div>
          </div>
          
          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-phone"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Teléfono</span>
              <span class="cv-item-value">${empleado.sucursal.telefono || 'No especificado'}</span>
            </div>
          </div>

          <div class="cv-item">
            <div class="cv-item-icon"><i class="fas fa-envelope"></i></div>
            <div class="cv-item-content">
              <span class="cv-item-label">Correo</span>
              <span class="cv-item-value">${empleado.sucursal.correo || 'No especificado'}</span>
            </div>
          </div>
        </div>
      </div>
      ` : ''}
    `;
  }
};

// ================= EXTENSIÓN DEL MÓDULO EMPLEADOS =================
// Agregar funcionalidad de búsqueda al módulo existente

/**
 * Inicializar event listener de búsqueda
 * El campo debe existir en el HTML con id="busqueda-empleado"
 */
EmpleadosModule.initBusqueda = function() {
  // Obtener referencia al campo de búsqueda
  this.elements.busquedaInput = document.getElementById('busqueda-empleado');
  
  if (!this.elements.busquedaInput) {
    console.warn('⚠️ Campo de búsqueda no encontrado. Asegúrate de tener un input con id="busqueda-empleado"');
    return;
  }

  // Búsqueda en tiempo real
  this.elements.busquedaInput.addEventListener('input', (e) => {
    AppState.filtros.busqueda = e.target.value.trim();
    this.filtrarPorBusqueda();
  });

  // Limpiar búsqueda con ESC
  this.elements.busquedaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.target.value = '';
      AppState.filtros.busqueda = '';
      this.filtrarPorBusqueda();
    }
  });
  
  console.log('✅ Búsqueda de empleados inicializada');
};

/**
 * Filtrar empleados por búsqueda (ID, nombre o correo)
 */
EmpleadosModule.filtrarPorBusqueda = function() {
  const busqueda = AppState.filtros.busqueda || '';
  
  if (!busqueda) {
    // Si no hay búsqueda, mostrar todos
    this.renderTabla(AppState.empleados);
    return;
  }

  // Filtrar por ID, nombre completo o correo
  const empleadosFiltrados = AppState.empleados.filter(emp => {
    const id = emp.idusuarios?.toString() || '';
    const nombre = `${emp.nombre || ''} ${emp.apellido || ''}`.toLowerCase();
    const correo = (emp.correo || '').toLowerCase();
    const busquedaLower = busqueda.toLowerCase();
    
    return id.includes(busqueda) || 
           nombre.includes(busquedaLower) || 
           correo.includes(busquedaLower);
  });

  this.renderTabla(empleadosFiltrados, busqueda);
};

/**
 * Actualizar renderTabla para incluir botón Ver y contador de resultados
 */
const renderTablaOriginal = EmpleadosModule.renderTabla;
EmpleadosModule.renderTabla = function(empleados, busqueda = '') {
  if (empleados.length === 0) {
    if (busqueda) {
      this.elements.empleadosList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No se encontraron empleados con: <strong>"${busqueda}"</strong></p>
          <button class="btn btn-secondary" onclick="document.getElementById('busqueda-empleado').value=''; AppState.filtros.busqueda=''; EmpleadosModule.filtrarPorBusqueda();">
            <i class="fas fa-times"></i> Limpiar búsqueda
          </button>
        </div>
      `;
    } else {
      this.elements.empleadosList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users"></i>
          <p>No se encontraron empleados con los filtros seleccionados.</p>
        </div>
      `;
    }
    return;
  }

  // Contador de resultados
  let html = `
    <div class="table-container">
      ${busqueda ? `
        <div style="margin-bottom: 10px; color: #666; font-size: 14px;">
          <i class="fas fa-info-circle"></i> 
          Mostrando <strong>${empleados.length}</strong> resultado${empleados.length !== 1 ? 's' : ''} 
          para "<strong>${busqueda}</strong>"
        </div>
      ` : ''}
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
        <td><strong>${emp.idusuarios || 'N/A'}</strong></td>
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
            class="btn-accion ver ver-empleado"
            data-id="${emp.idusuarios}"
            title="Ver detalles completos"
          >
            <i class="fas fa-eye"></i> Ver
          </button>
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

  html += `
        </tbody>
      </table>
    </div>
  `;
  
  this.elements.empleadosList.innerHTML = html;
};

/**
 * Actualizar handleTableClick para incluir botón Ver
 */
const handleTableClickOriginal = EmpleadosModule.handleTableClick;
EmpleadosModule.handleTableClick = function(e) {
  // Detectar clic en botón "Ver"
  const btnVer = e.target.closest('.ver-empleado');
  if (btnVer) {
    const usuarioId = btnVer.dataset.id;
    ModalVerModule.abrir(usuarioId);
    return;
  }

  // Mantener funcionalidad original
  handleTableClickOriginal.call(this, e);
};

/**
 * Actualizar cargarEmpleados para aplicar búsqueda si existe
 */
const cargarEmpleadosOriginal = EmpleadosModule.cargarEmpleados;
EmpleadosModule.cargarEmpleados = async function() {
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
    
    // Aplicar búsqueda si existe
    if (AppState.filtros.busqueda) {
      this.filtrarPorBusqueda();
    } else {
      this.renderTabla(empleados);
    }

  } catch (error) {
    console.error('Error cargando empleados:', error);
    this.elements.empleadosList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #dc3545;">
        <i class="fas fa-exclamation-triangle fa-2x"></i>
        <p style="margin-top: 1rem;">Error al cargar empleados. Por favor, intente nuevamente.</p>
      </div>
    `;
  }
};

/**
 * Actualizar init para incluir búsqueda
 */
const initOriginal = EmpleadosModule.init;
EmpleadosModule.init = function() {
  initOriginal.call(this);
  
  // Inicializar búsqueda (el campo debe existir en el HTML)
  this.initBusqueda();
};

// ================= ACTUALIZAR APPSTATE =================
if (!AppState.filtros.busqueda) {
  AppState.filtros.busqueda = '';
}

// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar modal de ver empleado
  ModalVerModule.init();
  
  console.log('✅ Módulo Ver Empleado y Búsqueda inicializados');
});


// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando aplicación...');

  SidebarModule.init();
  EmpleadosModule.init();
  ModalNuevoModule.init();
  ModalEditarModule.init();

  // Inicializar módulo de home/dashboard
  if (typeof HomeModule !== 'undefined' && !HomeModule.inicializado) {
    HomeModule.init();
    console.log('Módulo de Home Dashboard inicializado');
  }

  // Inicializar módulo de sucursales si existe
  if (typeof SucursalesModule !== 'undefined' && !SucursalesModule.inicializado) {
    SucursalesModule.init();
    console.log('Módulo de sucursales inicializado');
  }

  // Inicializar módulo de reportes
  if (typeof ReportesModule !== 'undefined' && !ReportesModule.inicializado) {
    ReportesModule.init();
    console.log('Módulo de reportes inicializado');
  }

  console.log('Aplicación inicializada correctamente');
});