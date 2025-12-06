// ========================
// ESTADO GLOBAL
// ========================
let empleadoData = null;

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
          <input type="email" id="correo" value="${empleadoData.correo || ''}" required>
        </div>
        
        <div class="form-group">
          <label>Teléfono: *</label>
          <input type="tel" id="telefono" value="${empleadoData.telefono || ''}" required>
        </div>
        
        <div class="form-group">
          <label>Dirección: *</label>
          <input type="text" id="direccion" value="${empleadoData.direccion || ''}" required>
        </div>
        
		<div class="form-group">
		    <label>Fecha de Nacimiento:</label>
		    <input 
		        type="date" 
		        id="fecha_nacimiento" 
		        value="${empleadoData.fecha_nacimiento != null ? empleadoData.fecha_nacimiento : ''}">
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
  
  document.getElementById('formEditarDatos').addEventListener('submit', async function(e) {
    e.preventDefault();

    const datos = {
      correo: document.getElementById('correo').value,
      telefono: document.getElementById('telefono').value,
      direccion: document.getElementById('direccion').value,
	  fecha_nacimiento: document.getElementById('fecha_nacimiento').value
    };

    try {
      const res = await fetch('/api/empleado/actualizar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar los datos');
      }

      const updatedUsuario = await res.json();
      empleadoData = updatedUsuario;

      showNotification('Datos actualizados correctamente', 'success');
      loadSection('mis-datos');

    } catch (err) {
      console.error('Error:', err);
      showNotification(err.message, 'error');
    }
  });
} // ← FIX: Cerrar la función correctamente

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
  
  document.getElementById('formVacaciones').addEventListener('submit', async function(e) {
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
    
    // TODO: Integrar con API cuando esté disponible
    /*
    try {
      const res = await fetch('/api/empleado/vacaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inicio, fin, motivo, dias })
      });
      
      if (!res.ok) throw new Error('Error al enviar solicitud');
      const data = await res.json();
      solicitudes.vacaciones.push(data);
    } catch (err) {
      showNotification(err.message, 'error');
      return;
    }
    */
    
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
      tipo, 
      fechaInicio: inicio, 
      fechaFin: fin, 
      dias, 
      observaciones,
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
async function loadProgramacionSection(container) {
  if (!empleadoData) {
    container.innerHTML = `
      <div class="card">
        <h2 style="margin-top: 20px;">📅 Programación</h2>
        <p style="padding: 20px; color: #999;">Cargando información del empleado...</p>
      </div>
    `;
    return;
  }

  const idEmpleado = empleadoData.idusuarios;

  // Mostrar loading
  container.innerHTML = `
    <div class="card fade-in">
      <h2 style="margin-top: 20px;">Programación</h2>
      <div style="text-align: center; padding: 40px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p style="color: #999; margin-top: 10px;">Cargando tu programación...</p>
      </div>
    </div>
  `;

  try {
    console.log('🔍 Cargando programación para empleado:', idEmpleado);

    // ✅ Obtener horario de hoy
    const responseHoy = await fetch(`http://localhost:9090/api/programacion/empleado/${idEmpleado}/hoy`);
    console.log('Status horario hoy:', responseHoy.status);
    
    let horarioHoy = null;
    if (responseHoy.ok) {
      const text = await responseHoy.text();
      console.log('Respuesta hoy (raw):', text);
      horarioHoy = text ? JSON.parse(text) : null;
    }
    
    // ✅ Obtener próximos turnos
    const responseProximos = await fetch(`http://localhost:9090/api/programacion/empleado/${idEmpleado}/proximos`);
    console.log('Status próximos turnos:', responseProximos.status);
    
    let proximosTurnos = [];
    if (responseProximos.ok) {
      const text = await responseProximos.text();
      console.log('Respuesta próximos (raw):', text);
      proximosTurnos = text ? JSON.parse(text) : [];
    }

    console.log('✅ Datos cargados:', { horarioHoy, proximosTurnos });
    mostrarProgramacion(container, horarioHoy, proximosTurnos);

  } catch (error) {
    console.error('❌ Error al cargar programación:', error);
    container.innerHTML = `
      <div class="card fade-in">
        <h2 style="margin-top: 20px;">📅 Programación</h2>
        <div class="alert alert-danger" style="margin: 20px;">
          <i class="fas fa-exclamation-triangle"></i>
          Error al cargar la programación: ${error.message}
        </div>
        <button class="btn-primary" onclick="location.reload()">
          Reintentar
        </button>
      </div>
    `;
  }
}

function mostrarProgramacion(container, horarioHoy, proximosTurnos) {
  const hoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sucursal = empleadoData.sucursal?.nombreSucursal || "No asignada";

  // ✅ Construir HTML del horario de hoy
  let horarioHoyHTML = '';
  if (horarioHoy && horarioHoy.horaEntrada) {
    const horaEntrada = horarioHoy.horaEntrada.substring(0, 5);
    const horaSalida = horarioHoy.horaSalida.substring(0, 5);
    const horas = calcularHoras(horarioHoy.horaEntrada, horarioHoy.horaSalida);
    
    horarioHoyHTML = `
      <div class="info-box">
        <h4>✅ Horario de hoy</h4>
        <div class="info-item" style="border:none;">
          <span class="info-label">📅 Fecha:</span> ${hoy}
        </div>
        <div class="info-item" style="border:none;">
          <span class="info-label">⏰ Turno:</span> ${horaEntrada} - ${horaSalida}
        </div>
        <div class="info-item" style="border:none;">
          <span class="info-label">📍 Ubicación:</span> ${sucursal}
        </div>
        <div class="info-item" style="border:none;">
          <span class="info-label">⏱️ Horas:</span> ${horas} horas
        </div>
        ${horarioHoy.descripcion ? `
        <div class="info-item" style="border:none;">
          <span class="info-label">📝 Descripción:</span> ${horarioHoy.descripcion}
        </div>
        ` : ''}
      </div>
    `;
  } else {
    horarioHoyHTML = `
      <div class="info-box">
        <h4>📅 Horario de hoy</h4>
        <div class="alert alert-info" style="margin: 10px 0; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196F3;">
          <i class="fas fa-info-circle"></i>
          No tienes horario asignado para hoy. Contacta con tu supervisor.
        </div>
      </div>
    `;
  }

  // ✅ Construir HTML de próximos turnos
  let proximosTurnosHTML = '';
  if (proximosTurnos && proximosTurnos.length > 0) {
    proximosTurnosHTML = `
      <div class="info-box">
        <h4>📆 Próximos turnos (3 días)</h4>
        <div style="max-height: 300px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="position: sticky; top: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr style="border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left;">Fecha</th>
                <th style="padding: 10px; text-align: left;">Entrada</th>
                <th style="padding: 10px; text-align: left;">Salida</th>
                <th style="padding: 10px; text-align: left;">Horas</th>
              </tr>
            </thead>
            <tbody>
    `;

    proximosTurnos.forEach(turno => {
      const fecha = new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const entrada = turno.horaEntrada.substring(0, 5);
      const salida = turno.horaSalida.substring(0, 5);
      const horas = calcularHoras(turno.horaEntrada, turno.horaSalida);

      proximosTurnosHTML += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">${fecha}</td>
          <td style="padding: 10px;"><span style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${entrada}</span></td>
          <td style="padding: 10px;"><span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${salida}</span></td>
          <td style="padding: 10px;"><strong>${horas}h</strong></td>
        </tr>
      `;
    });

    proximosTurnosHTML += `
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else {
    proximosTurnosHTML = `
      <div class="info-box">
        <h4>📆 Próximos turnos</h4>
        <div class="alert alert-info" style="margin: 10px 0; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196F3;">
          <i class="fas fa-info-circle"></i>
          No tienes turnos programados para los próximos 3 días
        </div>
      </div>
    `;
  }

  // ✅ Renderizar todo
  container.innerHTML = `
    <div class="card fade-in">
      <h2 style="margin-top: 20px;">📅 Programación</h2>
      <div style="margin-top: 30px;">
        ${horarioHoyHTML}
        ${proximosTurnosHTML}
        <button class="btn-primary" onclick="mostrarCalendarioCompleto()">
          📆 Ver Calendario Completo del Mes
        </button>
      </div>
    </div>
  `;
}

// ✅ Función auxiliar para calcular horas trabajadas
function calcularHoras(horaEntrada, horaSalida) {
  try {
    const [h1, m1] = horaEntrada.split(':').map(Number);
    const [h2, m2] = horaSalida.split(':').map(Number);
    
    const minutos1 = h1 * 60 + m1;
    const minutos2 = h2 * 60 + m2;
    
    const diff = minutos2 - minutos1;
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;
    
    return minutos > 0 ? `${horas}:${minutos.toString().padStart(2, '0')}` : horas;
  } catch (error) {
    console.error('Error calculando horas:', error);
    return '0';
  }
}

// ========================
// BOTÓN: VER CALENDARIO COMPLETO
// ========================
async function mostrarCalendarioCompleto() {
  if (!empleadoData) {
    showNotification("Error: Datos de empleado no disponibles", "error");
    return;
  }

  const idEmpleado = empleadoData.idusuarios;
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  // Mostrar modal con loading
  const loadingModal = `
    <div id="modalCalendario" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
        <div class="spinner-border text-primary" role="status"></div>
        <p style="margin-top: 10px; color: #999;">Cargando calendario...</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', loadingModal);

  try {
    const response = await fetch(
      `http://localhost:9090/api/programacion/empleado/${idEmpleado}/mes?year=${anioActual}&month=${mesActual}`
    );

    if (!response.ok) {
      throw new Error('Error al cargar el calendario');
    }

    const text = await response.text();
    const programaciones = text ? JSON.parse(text) : [];

    // Remover loading modal
    document.getElementById('modalCalendario').remove();

    // Mostrar calendario
    mostrarModalCalendario(programaciones, mesActual, anioActual);

  } catch (error) {
    console.error('Error al cargar calendario:', error);
    document.getElementById('modalCalendario').remove();
    showNotification("Error al cargar el calendario: " + error.message, "error");
  }
}

function mostrarModalCalendario(programaciones, mes, anio) {
  const nombreMes = new Date(anio, mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  
  // Generar calendario del mes
  const primerDia = new Date(anio, mes - 1, 1);
  const ultimoDia = new Date(anio, mes, 0);
  const diasEnMes = ultimoDia.getDate();
  const primerDiaSemana = primerDia.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  
  // Crear un mapa de programaciones por fecha
  const programacionesPorFecha = {};
  programaciones.forEach(prog => {
    const fecha = prog.fecha; // formato YYYY-MM-DD
    programacionesPorFecha[fecha] = prog;
  });
  
  let calendarioHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.remove()">
      <div style="background: white; padding: 30px; border-radius: 20px; max-width: 1200px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <h2 style="margin: 0; text-transform: capitalize; color: #333;">
            📅 ${nombreMes}
          </h2>
          <button onclick="this.closest('div[style*=fixed]').remove()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #999; padding: 0; width: 40px; height: 40px; border-radius: 50%; transition: all 0.3s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">
            ×
          </button>
        </div>

        <!-- Calendario Grid -->
        <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; margin-top: 20px;">
          
          <!-- Encabezado de semanas -->
          <div style="background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: white; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">
            N° Semana
          </div>
          
          <!-- Días de la semana -->
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">Lunes</div>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">Martes</div>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">Miércoles</div>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">Jueves</div>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">Viernes</div>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">Sábado</div>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold;">Domingo</div>
  `;

  // Calcular el número de semana del año
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  }

  let diaActual = 1;
  let semanaActual = getWeekNumber(primerDia);
  
  // Ajustar primerDiaSemana: convertir Domingo=0 a Domingo=7
  const primerDiaAjustado = primerDiaSemana === 0 ? 7 : primerDiaSemana;

  // Generar filas del calendario
  for (let semana = 0; semana < 6; semana++) {
    if (diaActual > diasEnMes) break;

    // Columna de número de semana
    calendarioHTML += `
      <div style="background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%); color: white; padding: 15px; text-align: center; border-radius: 10px; font-weight: bold; font-size: 24px;">
        ${semanaActual}
      </div>
    `;
    semanaActual++;

    // Días de la semana (Lunes a Domingo)
    for (let dia = 1; dia <= 7; dia++) {
      // Primera semana: llenar espacios vacíos antes del primer día
      if (semana === 0 && dia < primerDiaAjustado) {
        calendarioHTML += `<div style="background: #fafafa; border-radius: 10px;"></div>`;
        continue;
      }

      // Si ya terminamos el mes, celdas vacías
      if (diaActual > diasEnMes) {
        calendarioHTML += `<div style="background: #fafafa; border-radius: 10px;"></div>`;
        continue;
      }

      // Crear fecha en formato YYYY-MM-DD
      const fechaStr = `${anio}-${String(mes).padStart(2, '0')}-${String(diaActual).padStart(2, '0')}`;
      const programacion = programacionesPorFecha[fechaStr];
      
      // Determinar color de fondo
      let bgColor = '#ffffff';
      let borderColor = '#e0e0e0';
      
      if (programacion) {
        // Hay programación para este día
        if (programacion.esDescanso) {
          bgColor = '#fff3e0'; // Naranja claro
          borderColor = '#ff9800';
        } else if (programacion.esDominical) {
          bgColor = '#e3f2fd'; // Azul claro
          borderColor = '#2196F3';
        } else {
          bgColor = '#e8f5e9'; // Verde claro
          borderColor = '#4caf50';
        }
      }

      // Contenido de la celda
      let contenidoCelda = `
        <div style="background: ${bgColor}; border: 2px solid ${borderColor}; padding: 12px; border-radius: 10px; min-height: 100px; position: relative; transition: all 0.3s; cursor: pointer;" 
             onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';" 
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
          
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #333;">
            ${diaActual}
          </div>
      `;

      if (programacion) {
        const horaEntrada = programacion.horaEntrada.substring(0, 5);
        const horaSalida = programacion.horaSalida.substring(0, 5);
        const tipoTurno = programacion.esDescanso ? 'Descanso' : 
                         programacion.esDominical ? 'Dominical' : 'Turno Normal';
        
        contenidoCelda += `
          <div style="background: ${borderColor}; color: white; padding: 6px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 4px;">
            ${tipoTurno}
          </div>
          <div style="font-size: 12px; color: #555; margin-top: 5px;">
            <div style="margin: 2px 0;">⏰ ${horaEntrada} - ${horaSalida}</div>
          </div>
        `;
        
        if (programacion.descripcion) {
          contenidoCelda += `
            <div style="font-size: 10px; color: #777; margin-top: 5px; font-style: italic;">
              ${programacion.descripcion.substring(0, 30)}${programacion.descripcion.length > 30 ? '...' : ''}
            </div>
          `;
        }
      } else {
        contenidoCelda += `
          <div style="color: #bbb; font-size: 12px; margin-top: 10px;">
            Sin programación
          </div>
        `;
      }

      contenidoCelda += `</div>`;
      calendarioHTML += contenidoCelda;

      diaActual++;
    }
  }

  calendarioHTML += `
        </div>

        <!-- Leyenda -->
        <div style="margin-top: 25px; padding: 20px; background: #f9f9f9; border-radius: 10px;">
          <h4 style="margin: 0 0 15px 0;">📋 Leyenda</h4>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; background: #e8f5e9; border: 2px solid #4caf50; border-radius: 4px;"></div>
              <span>Turno Normal</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; background: #e3f2fd; border: 2px solid #2196F3; border-radius: 4px;"></div>
              <span>Dominical</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; background: #fff3e0; border: 2px solid #ff9800; border-radius: 4px;"></div>
              <span>Descanso</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 24px; height: 24px; background: white; border: 2px solid #e0e0e0; border-radius: 4px;"></div>
              <span>Sin programación</span>
            </div>
          </div>
        </div>

        <!-- Botón cerrar -->
        <button class="btn-primary" style="margin-top: 20px; width: 100%;" onclick="this.closest('div[style*=fixed]').remove()">
          Cerrar Calendario
        </button>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', calendarioHTML);
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
          <input type="email" id="correoEnvio" value="${empleadoData.correo || ''}">
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
  
  const userAvatar = document.querySelector('.user-avatar');
  if (userAvatar) userAvatar.textContent = iniciales;
  
  const userName = document.querySelector('.user-name');
  if (userName) userName.textContent = `${nombre} ${apellido}`;
  
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