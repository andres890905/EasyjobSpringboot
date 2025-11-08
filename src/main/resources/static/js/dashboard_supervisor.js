// ================= DASHBOARD SUPERVISOR COMPLETO ==================
document.addEventListener('DOMContentLoaded', function() {

  // ====== ELEMENTOS DE NAVEGACIÓN ======
  const btnDashboard = document.getElementById('btnDashboard');
  const btnEmpleados = document.getElementById('btnEmpleados');
  const btnHorarios = document.getElementById('btnHorarios');
  const btnIncapacidades = document.getElementById('btnIncapacidades');
  const btnVacaciones = document.getElementById('btnVacaciones');
  const btnTraslados = document.getElementById('btnTraslados');
  const btnReportes = document.getElementById('btnReportes');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');

  // ====== SECCIONES ======
  const seccionDashboard = document.getElementById('seccionDashboard');
  const seccionEmpleados = document.getElementById('seccionEmpleados');
  const seccionHorarios = document.getElementById('seccionHorarios');
  const seccionIncapacidades = document.getElementById('seccionIncapacidades');
  const seccionVacaciones = document.getElementById('seccionVacaciones');
  const seccionTraslados = document.getElementById('seccionTraslados');
  const seccionReportes = document.getElementById('seccionReportes');

  const navLinks = document.querySelectorAll('.sidebar .nav-link');

  // ====== FUNCIONES DE NAVEGACIÓN ======
  function ocultarSecciones() {
    seccionDashboard.style.display = 'none';
    seccionEmpleados.style.display = 'none';
    seccionHorarios.style.display = 'none';
    seccionIncapacidades.style.display = 'none';
    seccionVacaciones.style.display = 'none';
    seccionTraslados.style.display = 'none';
    seccionReportes.style.display = 'none';
  }

  function removerActiveLinks() {
    navLinks.forEach(link => link.classList.remove('active'));
  }

  function animarEntrada(elemento) {
    elemento.style.opacity = '0';
    elemento.style.transform = 'translateY(20px)';
    setTimeout(() => {
      elemento.style.transition = 'all 0.5s ease';
      elemento.style.opacity = '1';
      elemento.style.transform = 'translateY(0)';
    }, 10);
  }

  // ====== BOTONES DE NAVEGACIÓN ======
  btnDashboard.addEventListener('click', e => {
    e.preventDefault();
    ocultarSecciones(); removerActiveLinks();
    btnDashboard.classList.add('active');
    seccionDashboard.style.display = 'block';
    animarEntrada(seccionDashboard);
  });

  btnEmpleados.addEventListener('click', e => {
    e.preventDefault();
    ocultarSecciones(); removerActiveLinks();
    btnEmpleados.classList.add('active');
    seccionEmpleados.style.display = 'block';
    animarEntrada(seccionEmpleados);
  });

  btnHorarios.addEventListener('click', e => {
    e.preventDefault();
    ocultarSecciones(); removerActiveLinks();
    btnHorarios.classList.add('active');
    seccionHorarios.style.display = 'block';
    cargarHorarios();
    animarEntrada(seccionHorarios);
  });

  btnIncapacidades.addEventListener('click', e => {
    e.preventDefault();
    ocultarSecciones(); removerActiveLinks();
    btnIncapacidades.classList.add('active');
    seccionIncapacidades.style.display = 'block';
    animarEntrada(seccionIncapacidades);
  });

  btnVacaciones.addEventListener('click', e => {
    e.preventDefault();
    ocultarSecciones(); removerActiveLinks();
    btnVacaciones.classList.add('active');
    seccionVacaciones.style.display = 'block';
    animarEntrada(seccionVacaciones);
  });

  btnTraslados.addEventListener('click', e => {
    e.preventDefault();
    ocultarSecciones(); removerActiveLinks();
    btnTraslados.classList.add('active');
    seccionTraslados.style.display = 'block';
    animarEntrada(seccionTraslados);
  });

  btnReportes.addEventListener('click', e => {
    e.preventDefault();
    ocultarSecciones(); removerActiveLinks();
    btnReportes.classList.add('active');
    seccionReportes.style.display = 'block';
    animarEntrada(seccionReportes);
  });

  // ====== CERRAR SESIÓN ======
  btnCerrarSesion.addEventListener('click', e => {
    e.preventDefault();
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      mostrarAlerta('Cerrando sesión...', 'info');
      setTimeout(() => window.location.href = '/logout', 1500);
    }
  });

  // ====== FORMULARIO DE BÚSQUEDA DE EMPLEADOS ======
   const formBusqueda = document.getElementById('form-busqueda');
   const resultadoEmpleado = document.getElementById('resultadoEmpleado');

   formBusqueda.addEventListener('submit', e => {
     e.preventDefault();
     const idEmpleado = document.getElementById('idEmpleado').value.trim();
     const nombreEmpleado = document.getElementById('nombreEmpleado').value.trim();

     if (!idEmpleado && !nombreEmpleado) {
       mostrarAlerta('Por favor ingrese al menos un criterio de búsqueda', 'warning');
       return;
     }

     // Por ahora solo funciona búsqueda por ID (cédula)
     if (!idEmpleado) {
       mostrarAlerta('Por favor ingrese el ID/Cédula del empleado', 'warning');
       return;
     }

     mostrarLoading(resultadoEmpleado);

     fetch(`http://localhost:9090/api/usuarios/empleados/${idEmpleado}`)
     .then(res => {
       if (!res.ok) {
         throw new Error('Empleado no encontrado');
       }
       return res.json();
     })
     .then(empleado => {
       if (empleado && empleado.idusuarios) {
         mostrarResultadoEmpleado(empleado);
       } else {
         throw new Error('Empleado no encontrado');
       }
     })
     .catch(error => {
       resultadoEmpleado.style.display = 'none';
       mostrarAlerta('Empleado no encontrado. Verifique el ID ingresado.', 'warning');
       console.error('Error:', error);
     });
   });

   function mostrarLoading(elemento) {
     elemento.style.display = 'block';
     elemento.innerHTML = `
       <div class="text-center py-4">
         <div class="spinner-border text-primary" role="status">
           <span class="visually-hidden">Cargando...</span>
         </div>
         <p class="mt-3 text-muted">Buscando empleado...</p>
       </div>`;
   }

   function mostrarResultadoEmpleado(empleado) {
     resultadoEmpleado.style.display = 'block';
     resultadoEmpleado.innerHTML = `
       <h4 class="mb-4"><i class="fas fa-user-circle text-primary me-2"></i>Información del Empleado</h4>
       <div class="row">
         <div class="col-md-6">
           <p><strong><i class="fas fa-id-card me-2 text-primary"></i>ID/Cédula:</strong> ${empleado.idusuarios}</p>
           <p><strong><i class="fas fa-user me-2 text-primary"></i>Nombre:</strong> ${empleado.nombre} ${empleado.apellido}</p>
         </div>
         <div class="col-md-6">
           <p><strong><i class="fas fa-envelope me-2 text-primary"></i>Email:</strong> ${empleado.correo || empleado.email || 'N/A'}</p>
           <p><strong><i class="fas fa-phone me-2 text-primary"></i>Teléfono:</strong> ${empleado.telefono || 'N/A'}</p>
		   <p><strong><i class="fas fa-birthday-cake me-2 text-primary"></i>Fecha de Nacimiento:</strong> 
		            ${empleado.fecha_nacimiento ? new Date(empleado.fecha_nacimiento).toLocaleDateString('es-CO') : 'N/A'}
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
		 <p><strong><i class="fas fa-building me-2 text-primary"></i>Sucursal:</strong> 
		       ${empleado.sucursal ? empleado.sucursal.nombreSucursal : 'N/A'}
		     </p>
			 <p><strong><i class="fas fa-dollar-sign me-2 text-primary"></i>Salario:</strong> 
			           ${empleado.salario ? '$' + empleado.salario.toLocaleString('es-CO') : 'N/A'}
			         </p>

       </div>`;
     animarEntrada(resultadoEmpleado);
   }

  // ================= SECCIÓN HORARIOS MEJORADA =================
  
  let empleadoSeleccionado = null;

  const formBuscarHorario = document.getElementById('formBuscarHorario');
  const resultadoHorario = document.getElementById('resultadoHorario');

  formBuscarHorario.addEventListener('submit', function(e) {
    e.preventDefault();

    const idHorarioEmpleado = document.getElementById('idHorarioEmpleado').value.trim();
    
    if (!idHorarioEmpleado) {
      mostrarAlerta('Por favor ingrese la cédula del empleado', 'warning');
      return;
    }

    mostrarLoadingHorario();

    fetch(`http://localhost:9090/api/usuarios/buscar/${idHorarioEmpleado}`)
      .then(res => {
        if (!res.ok) throw new Error('Empleado no encontrado');
        return res.json();
      })
      .then(data => {
        if (!data.success || !data.usuario) {
          throw new Error('Empleado no encontrado');
        }
        
        empleadoSeleccionado = data.usuario;
        mostrarFormularioAsignacion(empleadoSeleccionado);
      })
      .catch(error => {
        resultadoHorario.style.display = 'none';
        mostrarAlerta('Empleado no encontrado. Verifique la cédula ingresada.', 'danger');
        console.error('Error:', error);
      });
  });

  function mostrarLoadingHorario() {
    resultadoHorario.style.display = 'block';
    resultadoHorario.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Buscando...</span>
        </div>
        <p class="mt-3 text-muted">Buscando empleado...</p>
      </div>`;
  }

  function mostrarFormularioAsignacion(usuario) {
    const hoy = new Date().toISOString().split('T')[0];
    
    resultadoHorario.style.display = 'block';
    resultadoHorario.innerHTML = `
      <h4 class="mb-3 text-primary">
        <i class="fas fa-user me-2"></i>Empleado seleccionado
      </h4>
      
      <div class="row mb-3">
        <div class="col-md-4">
          <p class="mb-1"><strong>Cédula:</strong></p>
          <p class="text-muted">${usuario.idusuarios}</p>
        </div>
        <div class="col-md-4">
          <p class="mb-1"><strong>Nombre:</strong></p>
          <p class="text-muted">${usuario.nombre} ${usuario.apellido}</p>
        </div>
        <div class="col-md-4">
          <p class="mb-1"><strong>Email:</strong></p>
          <p class="text-muted">${usuario.correo || 'N/A'}</p>
        </div>
      </div>

      <hr class="my-4"/>

      <h5 class="mb-3">
        <i class="fas fa-clock me-2"></i>Configurar horario
      </h5>

      <form id="formAsignarHorario">
        <div class="row g-3">
          <div class="col-md-6">
            <label for="tipoAsignacion" class="form-label">
              <i class="fas fa-calendar-check me-1"></i>Tipo de asignación *
            </label>
            <select id="tipoAsignacion" class="form-select" required>
              <option value="">Seleccione...</option>
              <option value="quincenal">Quincenal (15 días)</option>
              <option value="mensual">Mensual</option>
            </select>
            <small class="text-muted">La fecha fin se calculará automáticamente</small>
          </div>

          <div class="col-md-6">
            <label for="fechaHorario" class="form-label">
              <i class="fas fa-calendar-day me-1"></i>Fecha de inicio *
            </label>
            <input type="date" class="form-control" id="fechaHorario" 
                   min="${hoy}" value="${hoy}" required />
            <small class="text-muted">No puede ser anterior a hoy</small>
          </div>

          <div class="col-md-6">
            <label for="horaEntrada" class="form-label">
              <i class="fas fa-sign-in-alt me-1"></i>Hora de entrada *
            </label>
            <input type="time" class="form-control" id="horaEntrada" 
                   value="08:00" required />
          </div>

          <div class="col-md-6">
            <label for="horaSalida" class="form-label">
              <i class="fas fa-sign-out-alt me-1"></i>Hora de salida *
            </label>
            <input type="time" class="form-control" id="horaSalida" 
                   value="17:00" required />
            <small class="text-muted" id="horasDuracion">Duración: 9 horas</small>
          </div>

          <div class="col-md-12">
            <label class="form-label">
              <i class="fas fa-calendar-week me-1"></i>Días laborales
            </label>
            <div class="d-flex gap-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diaLun" checked>
                <label class="form-check-label" for="diaLun">Lun</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diaMar" checked>
                <label class="form-check-label" for="diaMar">Mar</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diaMie" checked>
                <label class="form-check-label" for="diaMie">Mié</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diaJue" checked>
                <label class="form-check-label" for="diaJue">Jue</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diaVie" checked>
                <label class="form-check-label" for="diaVie">Vie</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diaSab">
                <label class="form-check-label" for="diaSab">Sáb</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="diaDom">
                <label class="form-check-label" for="diaDom">Dom</label>
              </div>
            </div>
          </div>

          <div class="col-md-12">
            <label for="observacionesHorario" class="form-label">
              <i class="fas fa-comment me-1"></i>Observaciones (opcional)
            </label>
            <textarea class="form-control" id="observacionesHorario" rows="2" 
                      placeholder="Ej: Horario rotativo, incluye almuerzo de 1 hora..."></textarea>
          </div>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-success">
            <i class="fas fa-check me-2"></i>Guardar Horario
          </button>
          <button type="button" class="btn btn-secondary" onclick="cancelarAsignacion()">
            <i class="fas fa-times me-2"></i>Cancelar
          </button>
        </div>
      </form>
    `;

    document.getElementById('horaEntrada').addEventListener('change', calcularDuracion);
    document.getElementById('horaSalida').addEventListener('change', calcularDuracion);
    document.getElementById('formAsignarHorario').addEventListener('submit', guardarHorario);

    animarEntrada(resultadoHorario);
  }

  function calcularDuracion() {
    const entrada = document.getElementById('horaEntrada').value;
    const salida = document.getElementById('horaSalida').value;
    
    if (entrada && salida) {
      const [hE, mE] = entrada.split(':').map(Number);
      const [hS, mS] = salida.split(':').map(Number);
      
      let duracion = (hS * 60 + mS) - (hE * 60 + mE);
      
      if (duracion < 0) duracion += 24 * 60;
      
      const horas = Math.floor(duracion / 60);
      const minutos = duracion % 60;
      
      const texto = minutos > 0 ? `${horas}h ${minutos}min` : `${horas} horas`;
      document.getElementById('horasDuracion').textContent = `Duración: ${texto}`;
      
      if (duracion > 12 * 60) {
        document.getElementById('horasDuracion').classList.add('text-danger');
        document.getElementById('horasDuracion').textContent += ' ⚠️ Jornada muy larga';
      } else {
        document.getElementById('horasDuracion').classList.remove('text-danger');
      }
    }
  }

  function guardarHorario(e) {
    e.preventDefault();

    const tipo = document.getElementById('tipoAsignacion').value;
    const fechaInicio = document.getElementById('fechaHorario').value;
    const horaEntrada = document.getElementById('horaEntrada').value;
    const horaSalida = document.getElementById('horaSalida').value;
    const observaciones = document.getElementById('observacionesHorario').value;

    if (!tipo || !fechaInicio || !horaEntrada || !horaSalida) {
      mostrarAlerta('Por favor complete todos los campos obligatorios (*)', 'warning');
      return;
    }

    if (horaEntrada >= horaSalida) {
      mostrarAlerta('La hora de salida debe ser posterior a la hora de entrada', 'warning');
      return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(inicio);

    if (tipo === 'quincenal') {
      fin.setDate(inicio.getDate() + 14);
    } else if (tipo === 'mensual') {
      fin.setMonth(inicio.getMonth() + 1);
      fin.setDate(inicio.getDate() - 1);
    }

    const fechaFin = fin.toISOString().split('T')[0];

    const diasLaborales = [];
    if (document.getElementById('diaLun').checked) diasLaborales.push('Lun');
    if (document.getElementById('diaMar').checked) diasLaborales.push('Mar');
    if (document.getElementById('diaMie').checked) diasLaborales.push('Mie');
    if (document.getElementById('diaJue').checked) diasLaborales.push('Jue');
    if (document.getElementById('diaVie').checked) diasLaborales.push('Vie');
    if (document.getElementById('diaSab').checked) diasLaborales.push('Sab');
    if (document.getElementById('diaDom').checked) diasLaborales.push('Dom');

    let descripcion = `Horario ${tipo}: ${horaEntrada} - ${horaSalida}`;
    if (diasLaborales.length > 0) {
      descripcion += ` | Días: ${diasLaborales.join(', ')}`;
    }
    if (observaciones) {
      descripcion += ` | ${observaciones}`;
    }

    const datos = {
      usuario: {
        idusuarios: parseInt(empleadoSeleccionado.idusuarios)
      },
      descripcion: descripcion,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };

    const btnGuardar = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Guardando...';

    fetch('http://localhost:9090/api/programacion/asignar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        mostrarAlerta(`Horario ${tipo} asignado correctamente a ${empleadoSeleccionado.nombre}`, 'success');
        cargarHorarios();
        cancelarAsignacion();
      } else {
        throw new Error(data.message || 'Error al asignar horario');
      }
    })
    .catch(error => {
      mostrarAlerta('Error al guardar: ' + error.message, 'danger');
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = textoOriginal;
    });
  }

  window.cancelarAsignacion = function() {
    empleadoSeleccionado = null;
    resultadoHorario.style.display = 'none';
    document.getElementById('formBuscarHorario').reset();
  };

  window.cargarHorarios = function() {
    const tbody = document.querySelector('#tablaHorarios tbody');
    
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 mb-0 text-muted">Cargando horarios...</p>
        </td>
      </tr>`;

    fetch('http://localhost:9090/api/programacion/listar')
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = '';
        
        const contador = document.getElementById('contadorHorarios');
        if (contador) {
          contador.textContent = `${data.length} horario${data.length !== 1 ? 's' : ''}`;
        }
        
        if (!data || data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                No hay horarios registrados
              </td>
            </tr>`;
          return;
        }

        data.forEach(h => {
          const fila = document.createElement('tr');
          
          const hoy = new Date();
          const inicio = new Date(h.fechaInicio);
          const fin = new Date(h.fechaFin);
          
          let badge = '';
          if (hoy < inicio) {
            badge = '<span class="badge bg-info">Próximo</span>';
          } else if (hoy >= inicio && hoy <= fin) {
            badge = '<span class="badge bg-success">Activo</span>';
          } else {
            badge = '<span class="badge bg-secondary">Finalizado</span>';
          }

          fila.innerHTML = `
            <td>${h.idProgramacion}</td>
            <td>
              <strong>${h.nombreUsuario || 'N/A'}</strong><br>
              <small class="text-muted">ID: ${h.idUsuario || 'N/A'}</small>
            </td>
            <td>
              ${h.descripcion}
              <br>${badge}
            </td>
            <td><small>${formatearFecha(h.fechaInicio)}</small></td>
            <td><small>${formatearFecha(h.fechaFin)}</small></td>
            <td class="text-center">
              <button class="btn btn-danger btn-sm" onclick="eliminarHorario(${h.idProgramacion})" 
                      title="Eliminar horario">
                <i class="fas fa-trash"></i>
              </button>
            </td>`;
          tbody.appendChild(fila);
        });
      })
      .catch(error => {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-danger py-4">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Error al cargar los horarios
            </td>
          </tr>`;
        console.error('Error:', error);
      });
  };

  window.eliminarHorario = function(id) {
    if (!confirm('¿Está seguro de eliminar este horario?\n\nEsta acción no se puede deshacer.')) {
      return;
    }

    fetch(`http://localhost:9090/api/programacion/eliminar/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        mostrarAlerta('Horario eliminado correctamente', 'success');
        cargarHorarios();
      } else {
        throw new Error('Error al eliminar');
      }
    })
    .catch(() => mostrarAlerta('Error al eliminar el horario', 'danger'));
  };

  // ====== FORMULARIO DE INCAPACIDADES ======
  const formIncapacidades = document.getElementById('formIncapacidades');
  
  if (formIncapacidades) {
    formIncapacidades.addEventListener('submit', e => {
      e.preventDefault();

      const empleado = document.getElementById('empleadoIncapacidad').value;
      const tipo = document.getElementById('tipoIncapacidad').value;
      const fechaInicio = document.getElementById('fechaInicioIncapacidad').value;
      const fechaFin = document.getElementById('fechaFinIncapacidad').value;
      const observaciones = document.getElementById('observacionesIncapacidad').value;

      if (!empleado || !tipo || !fechaInicio || !fechaFin) {
        mostrarAlerta('Complete todos los campos requeridos', 'warning');
        return;
      }

      const datos = {
        empleado: empleado,
        tipo: tipo,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        observaciones: observaciones
      };

      fetch('http://localhost:9090/api/incapacidades/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          mostrarAlerta('Incapacidad registrada correctamente', 'success');
          formIncapacidades.reset();
        } else {
          mostrarAlerta('Error al registrar incapacidad', 'danger');
        }
      })
      .catch(() => mostrarAlerta('Error de conexión con el servidor', 'danger'));
    });
  }

  // ====== FORMULARIO DE VACACIONES ======
  const formVacaciones = document.getElementById('formVacaciones');
  
  if (formVacaciones) {
    formVacaciones.addEventListener('submit', e => {
      e.preventDefault();

      const idVacacion = document.getElementById('idVacacion').value;
      const accion = document.querySelector('input[name="accionVacaciones"]:checked');
      const comentarios = document.getElementById('comentariosVacaciones').value;

      if (!idVacacion) {
        mostrarAlerta('Por favor ingrese el ID de la solicitud', 'warning');
        return;
      }

      if (!accion) {
        mostrarAlerta('Por favor seleccione una acción (Aprobar o Rechazar)', 'warning');
        return;
      }

      const datos = {
        idVacacion: parseInt(idVacacion),
        estado: accion.value,
        comentarios: comentarios
      };

      const btnSubmit = e.target.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';

      fetch('http://localhost:9090/api/vacaciones/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          mostrarAlerta(`Solicitud ${accion.value.toLowerCase()}a correctamente`, 'success');
          formVacaciones.reset();
        } else {
          mostrarAlerta('Error al procesar la solicitud', 'danger');
        }
      })
      .catch(() => mostrarAlerta('Error de conexión con el servidor', 'danger'))
      .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Estado';
      });
    });
  }

  // ====== FORMULARIO DE TRASLADOS ======
  const formTraslados = document.getElementById('formTraslados');
  
  if (formTraslados) {
    formTraslados.addEventListener('submit', e => {
      e.preventDefault();

      const empleado = document.getElementById('empleadoTraslado').value;
      const sucursalActual = document.getElementById('sucursalActual').value;
      const sucursalDestino = document.getElementById('sucursalDestino').value;
      const fechaTraslado = document.getElementById('fechaTraslado').value;
      const motivo = document.getElementById('motivoTraslado').value;

      if (!empleado || !sucursalActual || !sucursalDestino || !fechaTraslado) {
        mostrarAlerta('Complete todos los campos requeridos', 'warning');
        return;
      }

      if (sucursalActual === sucursalDestino) {
        mostrarAlerta('La sucursal destino debe ser diferente a la actual', 'warning');
        return;
      }

      const datos = {
        empleado: empleado,
        sucursalActual: sucursalActual,
        sucursalDestino: sucursalDestino,
        fechaTraslado: fechaTraslado,
        motivo: motivo
      };

      fetch('http://localhost:9090/api/traslados/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          mostrarAlerta('Traslado registrado correctamente', 'success');
          formTraslados.reset();
        } else {
          mostrarAlerta('Error al registrar traslado', 'danger');
        }
      })
      .catch(() => mostrarAlerta('Error de conexión con el servidor', 'danger'));
    });
  }

  // ====== FORMULARIO DE REPORTES ======
  const formReportes = document.getElementById('formReportes');
  
  if (formReportes) {
    formReportes.addEventListener('submit', e => {
      e.preventDefault();

      const tipoReporte = document.getElementById('tipoReporte').value;
      const periodo = document.getElementById('periodoReporte').value;
      const fechaInicio = document.getElementById('fechaInicioReporte').value;
      const fechaFin = document.getElementById('fechaFinReporte').value;

      if (!tipoReporte || !periodo) {
        mostrarAlerta('Por favor seleccione el tipo de reporte y período', 'warning');
        return;
      }

      if (!fechaInicio || !fechaFin) {
        mostrarAlerta('Por favor ingrese las fechas de inicio y fin', 'warning');
        return;
      }

      if (new Date(fechaInicio) > new Date(fechaFin)) {
        mostrarAlerta('La fecha de inicio debe ser anterior a la fecha fin', 'warning');
        return;
      }

      const datos = {
        tipo: tipoReporte,
        periodo: periodo,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      };

      const btnSubmit = e.target.querySelector('button[type="submit"]');
      const textoOriginal = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando reporte...';

      fetch('http://localhost:9090/api/reportes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      .then(res => {
        if (res.ok) {
          return res.blob();
        }
        throw new Error('Error al generar el reporte');
      })
      .then(blob => {
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${tipoReporte}_${periodo}_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarAlerta('Reporte generado y descargado correctamente', 'success');
        formReportes.reset();
      })
      .catch(error => {
        mostrarAlerta('Error al generar el reporte: ' + error.message, 'danger');
      })
      .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
      });
    });
  }

  // ====== CARGAR HORARIOS AL INICIO ======
  cargarHorarios();

  // ====== FUNCIONES AUXILIARES ======
  function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const f = new Date(fecha + 'T00:00:00');
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return f.toLocaleDateString('es-ES', opciones);
  }

  function mostrarAlerta(mensaje, tipo = 'info') {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alertaDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    alertaDiv.role = 'alert';
    
    let icono = 'info-circle';
    if (tipo === 'success') icono = 'check-circle';
    if (tipo === 'danger') icono = 'exclamation-triangle';
    if (tipo === 'warning') icono = 'exclamation-circle';
    
    alertaDiv.innerHTML = `
      <i class="fas fa-${icono} me-2"></i>${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    
    document.body.appendChild(alertaDiv);
    setTimeout(() => alertaDiv.remove(), 5000);
  }

}); // Fin DOMContentLoaded

// ====== FUNCIÓN GLOBAL TOGGLE SIDEBAR ======
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}