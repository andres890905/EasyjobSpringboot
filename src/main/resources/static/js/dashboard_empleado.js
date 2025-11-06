// ========================
// ESTADO GLOBAL
// ========================
let empleadoData = null; // Se llenará desde la API

const solicitudes = {
  vacaciones: [],
  incapacidades: [],
  certificados: []
};

// ========================
// SISTEMA DE NOTIFICACIONES
// ========================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  const title = type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Info';
  
  notification.innerHTML = `
    <div>
      <strong>${icon} ${title}:</strong>
      <div>${message}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.4s ease-out reverse';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// ========================
// NAVEGACIÓN ENTRE SECCIONES
// ========================
function loadSection(section) {
  if (!empleadoData) {
    console.warn('Esperando datos del empleado...');
    return;
  }
  
  const container = document.getElementById('mainContent');
  
  switch(section) {
    case 'mis-datos':
      loadMisDatosSection(container);
      break;
    case 'vacaciones':
      loadVacacionesSection(container);
      break;
    case 'incapacidades':
      loadIncapacidadesSection(container);
      break;
    case 'programacion':
      loadProgramacionSection(container);
      break;
    case 'certificados':
      loadCertificadosSection(container);
      break;
  }
}

// ========================
// SECCIÓN: MIS DATOS
// ========================
function loadMisDatosSection(container) {
  const { nombre, apellido, rol, sucursal, fechaRegistro, correo, telefono, direccion, fecha_nacimiento } = empleadoData;
  
  container.innerHTML = `
  <div class="card">
    <h2>${nombre} ${apellido}</h2>
    <h3>${rol?.tipo_rol || 'Sin rol asignado'}</h3>

    <div class="info-item"><span class="info-label">🏢 Sucursal:</span> ${sucursal?.nombreSucursal || 'N/A'}</div>
    <div class="info-item"><span class="info-label">📅 Fecha de Registro:</span> ${fechaRegistro || 'N/A'}</div>
    <div class="info-item"><span class="info-label">📧 Correo:</span> ${correo || 'N/A'}</div>
    <div class="info-item"><span class="info-label">📱 Teléfono:</span> ${telefono || 'N/A'}</div>
    <div class="info-item"><span class="info-label">📍 Dirección:</span> ${direccion || 'N/A'}</div>
    <div class="info-item"><span class="info-label">🎂 Fecha de nacimiento:</span> ${fecha_nacimiento || 'N/A'}</div>

    <!-- Botón dentro de la card -->
    <div class="btn-edit-float" onclick="editarDatosPersonales()" data-tooltip="Editar datos personales">
      <i class="fas fa-pen"></i>
    </div>
  </div>

  `;
}

function editarDatosPersonales() {
  const container = document.getElementById('mainContent');
  
  container.innerHTML = `
    <div class="card">
      <h2>✏️ Editar Datos Personales</h2>
      
      <form id="formEditarDatos" style="margin-top: 30px;">
        <div class="form-group">
          <label>Nombre Completo:</label>
          <input type="text" value="${empleadoData.nombre} ${empleadoData.apellido}" disabled>
        </div>
        
        <div class="form-group">
          <label>Cargo:</label>
          <input type="text" value="${empleadoData.rol?.tipo_rol || 'N/A'}" disabled>
        </div>
        
        <div class="form-group">
          <label>Cédula:</label>
          <input type="text" value="${empleadoData.idusuarios || 'N/A'}" disabled>
        </div>
        
        <div class="form-group">
          <label>Correo Electrónico: *</label>
          <input type="email" id="correo" value="${empleadoData.correo}" required>
        </div>
        
        <div class="form-group">
          <label>Teléfono: *</label>
          <input type="tel" id="telefono" value="${empleadoData.telefono}" required>
        </div>
        
        <div class="form-group">
          <label>Dirección: *</label>
          <input type="text" id="direccion" value="${empleadoData.direccion}" required>
        </div>
        
        <div class="form-group">
          <label>Fecha de Nacimiento:</label>
          <input type="text" value="${empleadoData.fecha_nacimiento || 'N/A'}" disabled>
        </div>
        
        <p style="color: #666; font-size: 13px; margin: 20px 0;">
          <strong>Nota:</strong> Los campos deshabilitados solo pueden ser modificados por el departamento de Recursos Humanos.
        </p>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="loadSection('mis-datos')">Cancelar</button>
          <button type="submit" class="btn-primary">💾 Guardar Cambios</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('formEditarDatos').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Actualizar datos locales
    empleadoData.correo = document.getElementById('correo').value;
    empleadoData.telefono = document.getElementById('telefono').value;
    empleadoData.direccion = document.getElementById('direccion').value;
    
    // TODO: Enviar actualización al backend
    // fetch('/api/empleado/actualizar', { method: 'PUT', body: JSON.stringify(datos) })
    
    showNotification('Datos actualizados correctamente', 'success');
    loadSection('mis-datos');
  });
}

// ========================
// SECCIÓN: VACACIONES
// ========================
function loadVacacionesSection(container) {
  const diasDisponibles = empleadoData.diasVacacionesDisponibles || 0;
  const diasUsados = empleadoData.diasVacacionesUsados || 0;
  
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">🌴 Vacaciones</h2>
      <div style="margin-top: 30px;">
        <div class="info-box">
          <h4>Días disponibles</h4>
          <p style="font-size: 32px; font-weight: bold; color: #2c3e50; margin: 0;">
            ${diasDisponibles} días
          </p>
        </div>
        
        <div class="info-box">
          <h4>Días utilizados este año</h4>
          <p style="font-size: 24px; font-weight: bold; color: #555; margin: 0;">
            ${diasUsados} días
          </p>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Mis Solicitudes:</h4>
        <div id="listaSolicitudesVacaciones">
          ${solicitudes.vacaciones.length === 0 ? 
            '<p style="color: #999;">No hay solicitudes registradas</p>' : 
            solicitudes.vacaciones.map(s => `
              <div class="solicitud-item">
                <div>
                  <strong>${s.fechaInicio} al ${s.fechaFin}</strong>
                  <small>${s.dias} días - ${s.motivo}</small>
                </div>
                <span class="badge ${s.estado}">${s.estado}</span>
              </div>
            `).join('')}
        </div>
        
        <button class="btn-primary" onclick="mostrarFormularioVacaciones()">
          ➕ Solicitar Vacaciones
        </button>
      </div>
    </div>
  `;
}

function mostrarFormularioVacaciones() {
  const container = document.getElementById('mainContent');
  const hoy = new Date().toISOString().split('T')[0];
  
  container.innerHTML = `
    <div class="card">
      <h2>📝 Solicitar Vacaciones</h2>
      <form id="formVacaciones" style="margin-top: 30px;">
        <div class="form-group">
          <label>Fecha de Inicio: *</label>
          <input type="date" id="fechaInicio" min="${hoy}" required>
        </div>
        
        <div class="form-group">
          <label>Fecha de Fin: *</label>
          <input type="date" id="fechaFin" min="${hoy}" required>
        </div>
        
        <div class="form-group">
          <label>Días solicitados:</label>
          <input type="text" id="diasCalculados" value="0 días" disabled>
        </div>
        
        <div class="form-group">
          <label>Motivo: *</label>
          <textarea id="motivo" rows="4" placeholder="Describe el motivo de tu solicitud..." required></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="loadSection('vacaciones')">Cancelar</button>
          <button type="submit" class="btn-primary">📤 Enviar Solicitud</button>
        </div>
      </form>
    </div>
  `;
  
  const fechaInicioInput = document.getElementById('fechaInicio');
  const fechaFinInput = document.getElementById('fechaFin');
  const diasCalculadosInput = document.getElementById('diasCalculados');
  
  function calcularDias() {
    const inicio = new Date(fechaInicioInput.value);
    const fin = new Date(fechaFinInput.value);
    
    if (fechaInicioInput.value && fechaFinInput.value && fin >= inicio) {
      const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
      diasCalculadosInput.value = `${dias} días`;
    } else {
      diasCalculadosInput.value = '0 días';
    }
  }
  
  fechaInicioInput.addEventListener('change', calcularDias);
  fechaFinInput.addEventListener('change', calcularDias);
  
  document.getElementById('formVacaciones').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const inicio = document.getElementById('fechaInicio').value;
    const fin = document.getElementById('fechaFin').value;
    const motivo = document.getElementById('motivo').value;
    const dias = Math.ceil((new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24)) + 1;
    
    const diasDisponibles = empleadoData.diasVacacionesDisponibles || 0;
    
    if (dias > diasDisponibles) {
      showNotification(`No tienes suficientes días disponibles. Solo tienes ${diasDisponibles} días.`, 'error');
      return;
    }
    
    solicitudes.vacaciones.push({
      fechaInicio: inicio,
      fechaFin: fin,
      motivo: motivo,
      dias: dias,
      estado: 'pendiente',
      fecha: new Date().toLocaleDateString('es-CO')
    });
    
    showNotification('Solicitud de vacaciones enviada exitosamente', 'success');
    loadSection('vacaciones');
  });
}

// ========================
// SECCIÓN: INCAPACIDADES
// ========================
function loadIncapacidadesSection(container) {
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">🏥 Incapacidades</h2>
      <div style="margin-top: 30px;">
        <div class="info-box">
          <h4>Historial de incapacidades</h4>
          <div id="listaIncapacidades">
            ${solicitudes.incapacidades.length === 0 ? 
              '<p style="color: #999; margin: 0;">No hay registros de incapacidades</p>' :
              solicitudes.incapacidades.map(inc => `
                <div class="solicitud-item">
                  <div>
                    <strong>${inc.fechaInicio} al ${inc.fechaFin}</strong>
                    <small>${inc.tipo} - ${inc.dias} días</small>
                  </div>
                  <span class="badge ${inc.estado}">${inc.estado}</span>
                </div>
              `).join('')}
          </div>
        </div>
        
        <button class="btn-primary" onclick="mostrarFormularioIncapacidad()">
          ➕ Reportar Incapacidad
        </button>
      </div>
    </div>
  `;
}

function mostrarFormularioIncapacidad() {
  const container = document.getElementById('mainContent');
  const hoy = new Date().toISOString().split('T')[0];
  
  container.innerHTML = `
    <div class="card">
      <h2>🏥 Reportar Incapacidad</h2>
      <form id="formIncapacidad" style="margin-top: 30px;">
        <div class="form-group">
          <label>Tipo de Incapacidad: *</label>
          <select id="tipoIncapacidad" required>
            <option value="">Seleccione...</option>
            <option value="Enfermedad General">Enfermedad General</option>
            <option value="Accidente Laboral">Accidente Laboral</option>
            <option value="Maternidad">Maternidad</option>
            <option value="Paternidad">Paternidad</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Fecha de Inicio: *</label>
          <input type="date" id="fechaInicioInc" max="${hoy}" required>
        </div>
        
        <div class="form-group">
          <label>Fecha de Fin: *</label>
          <input type="date" id="fechaFinInc" required>
        </div>
        
        <div class="form-group">
          <label>Días de incapacidad:</label>
          <input type="text" id="diasIncapacidad" value="0 días" disabled>
        </div>
        
        <div class="form-group">
          <label>Observaciones: *</label>
          <textarea id="observaciones" rows="4" placeholder="Detalles adicionales..." required></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="loadSection('incapacidades')">Cancelar</button>
          <button type="submit" class="btn-primary">📤 Enviar Reporte</button>
        </div>
      </form>
    </div>
  `;
  
  const fechaInicioInput = document.getElementById('fechaInicioInc');
  const fechaFinInput = document.getElementById('fechaFinInc');
  const diasInput = document.getElementById('diasIncapacidad');
  
  function calcularDias() {
    const inicio = new Date(fechaInicioInput.value);
    const fin = new Date(fechaFinInput.value);
    
    if (fechaInicioInput.value && fechaFinInput.value && fin >= inicio) {
      const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
      diasInput.value = `${dias} días`;
    } else {
      diasInput.value = '0 días';
    }
  }
  
  fechaInicioInput.addEventListener('change', calcularDias);
  fechaFinInput.addEventListener('change', calcularDias);
  
  document.getElementById('formIncapacidad').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('tipoIncapacidad').value;
    const inicio = document.getElementById('fechaInicioInc').value;
    const fin = document.getElementById('fechaFinInc').value;
    const observaciones = document.getElementById('observaciones').value;
    const dias = Math.ceil((new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24)) + 1;
    
    solicitudes.incapacidades.push({
      tipo, fechaInicio: inicio, fechaFin: fin, dias, observaciones,
      estado: 'pendiente',
      fecha: new Date().toLocaleDateString('es-CO')
    });
    
    showNotification('Incapacidad reportada exitosamente', 'success');
    loadSection('incapacidades');
  });
}

// ========================
// SECCIÓN: PROGRAMACIÓN
// ========================
function loadProgramacionSection(container) {
  const hoy = new Date().toLocaleDateString('es-CO', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">📅 Programación</h2>
      <div style="margin-top: 30px;">
        <div class="info-box">
          <h4>Horario de hoy</h4>
          <div class="info-item" style="border: none;">
            <span class="info-label">📅 Fecha:</span> ${hoy}
          </div>
          <div class="info-item" style="border: none;">
            <span class="info-label">⏰ Turno:</span> 8:00 AM - 5:00 PM
          </div>
          <div class="info-item" style="border: none;">
            <span class="info-label">📍 Ubicación:</span> ${empleadoData.sucursal?.nombreSucursal || 'N/A'}
          </div>
          <div class="info-item" style="border: none;">
            <span class="info-label">⏱️ Horas:</span> 8 horas
          </div>
        </div>
        
        <div class="info-box">
          <h4>Próximos turnos</h4>
          <p style="color: #999; margin: 0;">Consulta disponible próximamente</p>
        </div>
        
        <button class="btn-primary" onclick="showNotification('Función de calendario en desarrollo', 'info')">
          📆 Ver Calendario Completo
        </button>
      </div>
    </div>
  `;
}

// ========================
// SECCIÓN: CERTIFICADOS
// ========================
function loadCertificadosSection(container) {
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">🧾 Certificados</h2>
      <div style="margin-top: 30px;">
        <h4 style="margin-bottom: 15px;">Certificados Disponibles:</h4>
        
        <div class="info-box" style="cursor: pointer;" onclick="descargarCertificado('laboral')">
          <h4>📄 Certificado Laboral</h4>
          <p style="color: #999; font-size: 13px; margin: 0;">
            Certificado que acredita tu vínculo laboral con la empresa
          </p>
        </div>
        
        <div class="info-box" style="cursor: pointer;" onclick="descargarCertificado('ingresos')">
          <h4>💰 Certificado de Ingresos</h4>
          <p style="color: #999; font-size: 13px; margin: 0;">
            Certificado con tu información salarial
          </p>
        </div>
        
        <h4 style="margin: 20px 0 10px;">Solicitudes de Certificados:</h4>
        <div id="listaSolicitudesCertificados">
          ${solicitudes.certificados.length === 0 ? 
            '<p style="color: #999;">No hay solicitudes registradas</p>' :
            solicitudes.certificados.map(cert => `
              <div class="solicitud-item">
                <div>
                  <strong>${cert.tipo}</strong>
                  <small>Solicitado: ${cert.fecha}</small>
                </div>
                <span class="badge ${cert.estado}">${cert.estado}</span>
              </div>
            `).join('')}
        </div>
        
        <button class="btn-primary" onclick="mostrarFormularioCertificado()">
          ➕ Solicitar Otro Certificado
        </button>
      </div>
    </div>
  `;
}

function descargarCertificado(tipo) {
  showNotification(`Preparando certificado de ${tipo}...`, 'info');
  setTimeout(() => {
    showNotification(`Certificado de ${tipo} descargado exitosamente`, 'success');
  }, 2000);
}

function mostrarFormularioCertificado() {
  const container = document.getElementById('mainContent');
  
  container.innerHTML = `
    <div class="card">
      <h2>📋 Solicitar Certificado</h2>
      <form id="formCertificado" style="margin-top: 30px;">
        <div class="form-group">
          <label>Tipo de Certificado: *</label>
          <select id="tipoCertificado" required>
            <option value="">Seleccione...</option>
            <option value="Certificado Laboral">Certificado Laboral</option>
            <option value="Certificado de Ingresos">Certificado de Ingresos</option>
            <option value="Certificado de Aportes">Certificado de Aportes a Seguridad Social</option>
            <option value="Certificado de Retención">Certificado de Retención en la Fuente</option>
            <option value="Paz y Salvo">Paz y Salvo</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Motivo de la solicitud: *</label>
          <textarea id="motivoCert" rows="4" placeholder="Indica para qué necesitas el certificado..." required></textarea>
        </div>
        
        <div class="form-group">
          <label>Correo de envío:</label>
          <input type="email" id="correoEnvio" value="${empleadoData.correo}">
          <small style="color: #666; font-size: 12px;">El certificado se enviará a este correo</small>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="loadSection('certificados')">Cancelar</button>
          <button type="submit" class="btn-primary">📤 Enviar Solicitud</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('formCertificado').addEventListener('submit', function(e) {
    e.preventDefault();
    
    solicitudes.certificados.push({
      tipo: document.getElementById('tipoCertificado').value,
      motivo: document.getElementById('motivoCert').value,
      correo: document.getElementById('correoEnvio').value,
      fecha: new Date().toLocaleDateString('es-CO'),
      estado: 'pendiente'
    });
    
    showNotification('Solicitud de certificado enviada exitosamente', 'success');
    loadSection('certificados');
  });
}

// ========================
// UTILIDADES UI
// ========================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      const section = this.getAttribute('data-section');
      loadSection(section);
      
      this.style.transform = 'scale(0.95)';
      setTimeout(() => this.style.transform = '', 100);
    });
  });
}

function actualizarPerfilUsuario() {
  if (!empleadoData) return;
  
  const { nombre, apellido } = empleadoData;
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  
  // Avatar en el menú lateral
  const userAvatar = document.querySelector('.user-avatar');
  if (userAvatar) userAvatar.textContent = iniciales;
  
  // Nombre completo
  const userName = document.querySelector('.user-name');
  if (userName) userName.textContent = `${nombre} ${apellido}`;
  
  // Logo superior
  const logo = document.querySelector('.sidebar-header .logo');
  if (logo) logo.textContent = iniciales;
}

function setupLogout() {
  const userProfile = document.querySelector('.user-profile');
  
  if (userProfile) {
    userProfile.addEventListener('dblclick', function() {
      if (confirm('¿Deseas cerrar sesión?')) {
        showNotification('Cerrando sesión...', 'info');
        setTimeout(() => window.location.href = '/logout', 1000);
      }
    });
  }
}

function addWelcomeAnimation() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (sidebar) {
    sidebar.style.opacity = '0';
    sidebar.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      sidebar.style.transition = 'all 0.6s ease-out';
      sidebar.style.opacity = '1';
      sidebar.style.transform = 'translateX(0)';
    }, 100);
  }
  
  if (mainContent) {
    mainContent.style.opacity = '0';
    setTimeout(() => {
      mainContent.style.transition = 'opacity 0.6s ease-out';
      mainContent.style.opacity = '1';
    }, 300);
  }
}

// ========================
// INICIALIZACIÓN
// ========================
async function cargarDatosEmpleado() {
  try {
    const response = await fetch('/api/empleado/datos');
    if (!response.ok) throw new Error('Error al cargar datos');
    
    empleadoData = await response.json();
    
    // Actualizar UI con los datos cargados
    actualizarPerfilUsuario();
    loadSection('mis-datos');
    
  } catch (error) {
    console.error('Error al obtener datos del empleado:', error);
    showNotification('Error al cargar los datos del empleado', 'error');
  }
}

function initDashboard() {
  setupNavigation();
  setupLogout();
  addWelcomeAnimation();
  cargarDatosEmpleado();
}

// ========================
// EJECUTAR AL CARGAR
// ========================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}