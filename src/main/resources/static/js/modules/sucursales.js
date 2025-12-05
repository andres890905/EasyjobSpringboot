// ================= MÓDULO DE SUCURSALES Y ZONAS =================

const SucursalesZonasModule = {
  sucursales: [],
  zonas: [],
  supervisores: [],
  empleados: [],
  sucursalEditando: null,
  zonaEditando: null,
  inicializado: false,
  tabActual: 'sucursales',

  async init() {
    if (this.inicializado) return;
    this.inicializado = true;
    this.initEventListeners();
    await this.cargarDatos();
  },

  initEventListeners() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.cambiarTab(e.currentTarget.dataset.tab));
    });

    // Botón nuevo
    const btnNuevo = document.getElementById('btn-nuevo');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => {
        this.tabActual === 'sucursales' ? this.toggleFormSucursal() : this.toggleFormZona();
      });
    }

    // Sucursales
    const btnGuardarSucursal = document.getElementById('btn-guardar-sucursal');
    if (btnGuardarSucursal) btnGuardarSucursal.addEventListener('click', () => this.guardarSucursal());

    const btnCancelarSucursal = document.getElementById('btn-cancelar-sucursal');
    if (btnCancelarSucursal) btnCancelarSucursal.addEventListener('click', () => this.cancelarFormSucursal());

    // Zonas
    const btnGuardarZona = document.getElementById('btn-guardar-zona');
    if (btnGuardarZona) btnGuardarZona.addEventListener('click', () => this.guardarZona());

    const btnCancelarZona = document.getElementById('btn-cancelar-zona');
    if (btnCancelarZona) btnCancelarZona.addEventListener('click', () => this.cancelarFormZona());
  },

  cambiarTab(tab) {
    this.tabActual = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');
    this.cancelarFormSucursal();
    this.cancelarFormZona();
  },

  async cargarDatos() {
    try {
      await this.cargarEmpleados();
      await this.cargarSupervisores();
      await this.cargarZonasData();
      await this.cargarSucursales();
      this.renderZonas();
      this.actualizarEstadisticas();
    } catch (error) {
      console.error('Error en carga de datos:', error);
      this.mostrarMensaje('Error al cargar los datos', 'error');
    }
  },

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
    } catch (error) {
      console.error('Error cargando empleados:', error);
      this.empleados = [];
    }
  },

  contarEmpleadosPorSucursal(idSucursal) {
    return this.empleados.filter(e => {
      const sucursalId = e.sucursal?.idSucursal || e.sucursal?.id_sucursal || e.idSucursal || e.id_sucursal || e.sucursal_id;
      return sucursalId == idSucursal;
    }).length;
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
    document.getElementById('form-sucursal-container').style.display = 'none';
    document.getElementById('formSucursal').reset();
    this.sucursalEditando = null;
  },

  async cargarSucursales() {
    try {
      const response = await fetch('/sucursales');
      if (!response.ok) throw new Error('Error al cargar sucursales');
      
      const data = await response.json();
      this.sucursales = data.map(s => ({
        idSucursal: s.idSucursal || s.id_sucursal,
        nombreSucursal: s.nombreSucursal || s.nombre_sucursal || 'Sin nombre',
        idZona: s.idZona || s.id_zona,
        ciudad: s.ciudad || 'N/A',
        direccion: s.direccion || 'N/A',
        telefono: s.telefono || '',
        correo: s.correo || ''
      }));
      
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
            <button class="btn btn-sm btn-outline-info" 
                    onclick="SucursalesZonasModule.enviarCorreoIndividual(${s.idSucursal}, '${s.nombreSucursal}')" 
                    title="Enviar correo">
              <i class="fas fa-envelope"></i>
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
    document.getElementById('form-zona-container').style.display = 'none';
    document.getElementById('formZona').reset();
    this.zonaEditando = null;
  },

  async cargarZonasData() {
    try {
      const response = await fetch('/api/zonas');
      if (!response.ok) throw new Error('Error al cargar zonas');
      
      const data = await response.json();
      this.zonas = data.map(z => ({
        idZona: z.idZona || z.id_zona,
        nombreZona: z.nombreZona || z.nombre_zona || 'Sin nombre',
        supervisor: z.supervisor || null,
        idusuarios: z.idusuarios || (z.supervisor ? z.supervisor.idusuarios : null)
      }));
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al cargar zonas', 'error');
    }
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
          <button class="btn btn-sm btn-outline-info" 
                  onclick="SucursalesZonasModule.verDetalleZona(${z.idZona})" 
                  title="Ver detalle">
            <i class="fas fa-eye"></i>
          </button>
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

  // NUEVA FUNCIÓN: Ver detalle de la zona
  async verDetalleZona(idZona) {
    try {
      const response = await fetch(`/api/zonas/${idZona}`);
      if (!response.ok) throw new Error('Error al cargar zona');
      
      const zona = await response.json();
      const sucursalesZona = this.sucursales.filter(s => s.idZona == idZona);
      
      console.log('=== DEBUG ZONA ===');
      console.log('Zona completa:', zona);
      console.log('Sucursales encontradas:', sucursalesZona.length);
      console.log('Detalle sucursales:', sucursalesZona);
      
      // Buscar el supervisor - probar múltiples formas
      let supervisorId = null;
      
      // Opción 1: zona.supervisor.idusuarios
      if (zona.supervisor && zona.supervisor.idusuarios) {
        supervisorId = zona.supervisor.idusuarios;
        console.log('Supervisor ID (opción 1 - zona.supervisor.idusuarios):', supervisorId);
      }
      // Opción 2: zona.idusuarios
      else if (zona.idusuarios) {
        supervisorId = zona.idusuarios;
        console.log('Supervisor ID (opción 2 - zona.idusuarios):', supervisorId);
      }
      // Opción 3: zona.supervisor.id
      else if (zona.supervisor && zona.supervisor.id) {
        supervisorId = zona.supervisor.id;
        console.log('Supervisor ID (opción 3 - zona.supervisor.id):', supervisorId);
      }
      
      console.log('Supervisor ID final:', supervisorId);
      console.log('Total supervisores disponibles:', this.supervisores.length);
      
      const supervisor = supervisorId ? 
        this.supervisores.find(s => s.idusuarios == supervisorId) : 
        null;
      
      console.log('Supervisor encontrado:', supervisor);
      console.log('==================');
      
      this.mostrarModalDetalleZona(zona, sucursalesZona, supervisor);
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error al cargar el detalle de la zona', 'error');
    }
  },

  mostrarModalDetalleZona(zona, sucursales, supervisor) {
    console.log('=== MOSTRANDO MODAL ===');
    console.log('Zona:', zona.nombreZona);
    console.log('Sucursales en zona:', sucursales.length);
    console.log('Supervisor:', supervisor);
    
    // Crear el modal
    const modalHTML = `
      <div class="modal fade" id="modalDetalleZona" tabindex="-1" aria-labelledby="modalDetalleZonaLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="modalDetalleZonaLabel">
                <i class="fas fa-map-marked-alt me-2"></i>
                Detalle de Zona: ${zona.nombreZona}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
              <!-- Información del Supervisor -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-user-tie me-2"></i>
                    Supervisor Asignado
                  </h6>
                </div>
                <div class="card-body">
                  ${supervisor ? `
                    <div class="row">
                      <div class="col-md-6">
                        <p class="mb-2">
                          <strong>Nombre:</strong> ${supervisor.nombre} ${supervisor.apellido}
                        </p>
                        <p class="mb-2">
                          <strong>Correo:</strong> ${supervisor.correo || 'No especificado'}
                        </p>
                      </div>
                      <div class="col-md-6">
                        <p class="mb-2">
                          <strong>Cédula:</strong> ${supervisor.idusuarios}
                        </p>
                        <p class="mb-2">
                          <strong>Estado:</strong> 
                          <span class="badge ${supervisor.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}">
                            ${supervisor.estado || 'No especificado'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ` : `
                    <p class="text-muted mb-0">
                      <i class="fas fa-exclamation-circle me-2"></i>
                      No hay supervisor asignado a esta zona
                    </p>
                  `}
                </div>
              </div>

              <!-- Estadísticas de la Zona -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-chart-bar me-2"></i>
                    Estadísticas
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row text-center">
                    <div class="col-md-4">
                      <div class="stat-box">
                        <i class="fas fa-building fa-2x text-primary mb-2"></i>
                        <h3 class="mb-0">${sucursales.length}</h3>
                        <small class="text-muted">Sucursales</small>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="stat-box">
                        <i class="fas fa-users fa-2x text-success mb-2"></i>
                        <h3 class="mb-0">${this.contarEmpleadosPorZona(sucursales)}</h3>
                        <small class="text-muted">Empleados</small>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="stat-box">
                        <i class="fas fa-map-marker-alt fa-2x text-info mb-2"></i>
                        <h3 class="mb-0">${this.contarCiudadesPorZona(sucursales)}</h3>
                        <small class="text-muted">Ciudades</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lista de Sucursales -->
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-store me-2"></i>
                    Sucursales (${sucursales.length})
                  </h6>
                </div>
                <div class="card-body p-0">
                  ${sucursales.length > 0 ? `
                    <div class="table-responsive">
                      <table class="table table-hover mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Ciudad</th>
                            <th>Teléfono</th>
                            <th>Empleados</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${sucursales.map(s => {
                            const empleadosCount = this.contarEmpleadosPorSucursal(s.idSucursal);
                            return `
                              <tr>
                                <td>
                                  <i class="fas fa-store-alt text-primary me-2"></i>
                                  <strong>${s.nombreSucursal || 'Sin nombre'}</strong>
                                </td>
                                <td>${s.direccion || 'No especificada'}</td>
                                <td>
                                  <i class="fas fa-map-marker-alt text-muted me-1"></i>
                                  ${s.ciudad || 'No especificada'}
                                </td>
                                <td>
                                  ${s.telefono ? `<i class="fas fa-phone text-muted me-1"></i>${s.telefono}` : '-'}
                                </td>
                                <td>
                                  <span class="badge bg-info">${empleadosCount} empleado${empleadosCount !== 1 ? 's' : ''}</span>
                                </td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  ` : `
                    <div class="p-4 text-center text-muted">
                      <i class="fas fa-inbox fa-3x mb-3"></i>
                      <p class="mb-0">No hay sucursales en esta zona</p>
                    </div>
                  `}
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="fas fa-times me-2"></i>Cerrar
              </button>
              <button type="button" class="btn btn-primary" 
                      onclick="SucursalesZonasModule.editarZonaDesdeModal(${zona.idZona})"
                      data-bs-dismiss="modal">
                <i class="fas fa-edit me-2"></i>Editar Zona
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const modalAnterior = document.getElementById('modalDetalleZona');
    if (modalAnterior) {
      modalAnterior.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar el modal usando Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleZona'));
    modal.show();

    // Limpiar el modal del DOM cuando se cierre
    document.getElementById('modalDetalleZona').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  },

  // Funciones auxiliares para estadísticas
  contarEmpleadosPorZona(sucursales) {
    console.log('=== CONTANDO EMPLEADOS POR ZONA ===');
    console.log('Sucursales recibidas:', sucursales.length);
    
    let total = 0;
    sucursales.forEach(sucursal => {
      const empleadosEnSucursal = this.contarEmpleadosPorSucursal(sucursal.idSucursal);
      console.log(`Sucursal "${sucursal.nombreSucursal}" (ID: ${sucursal.idSucursal}): ${empleadosEnSucursal} empleados`);
      total += empleadosEnSucursal;
    });
    
    console.log(`Total empleados en zona: ${total}`);
    console.log('===================================');
    return total;
  },

  contarCiudadesPorZona(sucursales) {
    const ciudades = new Set(sucursales.map(s => s.ciudad).filter(c => c));
    return ciudades.size;
  },

  editarZonaDesdeModal(idZona) {
    this.editarZona(idZona);
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
      const url = this.zonaEditando ? `/api/zonas/${this.zonaEditando}` : '/api/zonas';
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
    } catch (error) {
      console.error('Error cargando supervisores:', error);
      this.supervisores = [];
    }
  },

  // ========== CORREOS ==========

  enviarCorreoIndividual(idSucursal, nombreSucursal) {
    this.mostrarModalCorreo('individual', idSucursal, nombreSucursal);
  },

  enviarCorreoMasivo() {
    this.mostrarModalCorreo('masivo', null, null);
  },

  mostrarModalCorreo(tipo, idSucursal, nombreSucursal) {
    const gradiente = tipo === 'masivo' 
      ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' 
      : 'linear-gradient(135deg, #1e88e5 0%, #1976d2 100%)';

    const modalHTML = `
      <div id="modal-correo-overlay" class="modal-overlay">
        <div id="modal-correo-content" class="modal-content">
          <div class="modal-header" style="background: ${gradiente};">
            <div>
              <h3 class="modal-title">
                <i class="fas ${tipo === 'masivo' ? 'fa-users' : 'fa-envelope'}"></i>
                ${tipo === 'masivo' ? 'Envío Masivo' : 'Envío Individual'}
              </h3>
              <p class="modal-subtitle">
                ${tipo === 'masivo' 
                  ? `Enviar a todas las sucursales (${this.sucursales.length})` 
                  : `Enviar a: ${nombreSucursal}`
                }
              </p>
            </div>
            <button onclick="SucursalesZonasModule.cerrarModalCorreo()" class="btn-close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            ${tipo === 'individual' ? `
              <div class="modal-info-box">
                <i class="fas fa-building"></i>
                <div>
                  <p class="info-title">${nombreSucursal}</p>
                  <p class="info-subtitle">ID: ${idSucursal}</p>
                </div>
              </div>
            ` : ''}

            <div class="form-group">
              <label>
                <i class="fas fa-tag"></i>
                Asunto *
              </label>
              <input 
                type="text" 
                id="modal-correo-asunto" 
                class="form-control"
                placeholder="Ej: Información importante sobre inventario"
              >
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-message"></i>
                Mensaje *
              </label>
              <textarea 
                id="modal-correo-mensaje" 
                rows="6"
                class="form-control"
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button onclick="SucursalesZonasModule.cerrarModalCorreo()" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button onclick="SucursalesZonasModule.procesarEnvioCorreo('${tipo}', ${idSucursal})" 
                    id="btn-enviar-correo-modal" 
                    class="btn btn-primary"
                    style="background: ${gradiente};">
              <i class="fas fa-paper-plane"></i>
              Enviar Correo
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => document.getElementById('modal-correo-asunto').focus(), 100);
  },

  cerrarModalCorreo() {
    const modal = document.getElementById('modal-correo-overlay');
    if (modal) modal.remove();
  },

  async procesarEnvioCorreo(tipo, idSucursal) {
    const asunto = document.getElementById('modal-correo-asunto').value.trim();
    const mensaje = document.getElementById('modal-correo-mensaje').value.trim();

    if (!asunto) {
      this.mostrarMensaje('Por favor ingresa un asunto', 'warning');
      document.getElementById('modal-correo-asunto').focus();
      return;
    }

    if (!mensaje) {
      this.mostrarMensaje('Por favor ingresa un mensaje', 'warning');
      document.getElementById('modal-correo-mensaje').focus();
      return;
    }

    if (tipo === 'masivo') {
      if (!confirm(`¿Enviar este correo a ${this.sucursales.length} sucursales?\n\nEsta acción no se puede deshacer.`)) {
        return;
      }
    }

    const btnEnviar = document.getElementById('btn-enviar-correo-modal');
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.disabled = true;
    btnEnviar.classList.add('loading');
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    await this.enviarCorreo(tipo, idSucursal, asunto, mensaje);

    btnEnviar.disabled = false;
    btnEnviar.classList.remove('loading');
    btnEnviar.innerHTML = textoOriginal;
    this.cerrarModalCorreo();
  },

  async enviarCorreo(tipo, idSucursal, asunto, mensaje) {
    try {
      const url = tipo === 'individual'
        ? `/correo-sucursales/enviar/${idSucursal}`
        : '/correo-sucursales/enviar-todas';

      const params = new URLSearchParams();
      params.append('asunto', asunto);
      params.append('mensaje', mensaje);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const result = await response.text();
      this.mostrarMensaje(response.ok ? result : 'Error al enviar correo', response.ok ? 'success' : 'error');
    } catch (error) {
      console.error('Error:', error);
      this.mostrarMensaje('Error de conexión', 'error');
    }
  },

  // ========== UTILIDADES ==========

  mostrarMensaje(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.innerHTML = `
      <i class="fas fa-${this.getIconoMensaje(tipo)}"></i>
      <span>${mensaje}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3500);
  },

  getIconoMensaje(tipo) {
    const iconos = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return iconos[tipo] || 'info-circle';
  }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  const seccion = document.getElementById('sucursales-section');
  if (seccion && !SucursalesZonasModule.inicializado) {
    SucursalesZonasModule.init();
  }
});

window.SucursalesZonasModule = SucursalesZonasModule;