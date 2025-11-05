// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
  
  // Elementos de navegación
  const btnDashboard = document.getElementById('btnDashboard');
  const btnEmpleados = document.getElementById('btnEmpleados');
  const btnHorarios = document.getElementById('btnHorarios');
  const btnIncapacidades = document.getElementById('btnIncapacidades');
  const btnVacaciones = document.getElementById('btnVacaciones');
  const btnTraslados = document.getElementById('btnTraslados');
  const btnReportes = document.getElementById('btnReportes');
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  
  // Secciones
  const seccionDashboard = document.getElementById('seccionDashboard');
  const seccionEmpleados = document.getElementById('seccionEmpleados');
  const seccionHorarios = document.getElementById('seccionHorarios');
  const seccionIncapacidades = document.getElementById('seccionIncapacidades');
  const seccionVacaciones = document.getElementById('seccionVacaciones');
  const seccionTraslados = document.getElementById('seccionTraslados');
  const seccionReportes = document.getElementById('seccionReportes');
  
  // Todos los enlaces de navegación
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  
  // Función para ocultar todas las secciones
  function ocultarSecciones() {
    seccionDashboard.style.display = 'none';
    seccionEmpleados.style.display = 'none';
    seccionHorarios.style.display = 'none';
    seccionIncapacidades.style.display = 'none';
    seccionVacaciones.style.display = 'none';
    seccionTraslados.style.display = 'none';
    seccionReportes.style.display = 'none';
  }
  
  // Función para remover la clase active de todos los enlaces
  function removerActiveLinks() {
    navLinks.forEach(link => link.classList.remove('active'));
  }
  
  // Función para animar la entrada de secciones
  function animarEntrada(elemento) {
    elemento.style.opacity = '0';
    elemento.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      elemento.style.transition = 'all 0.5s ease';
      elemento.style.opacity = '1';
      elemento.style.transform = 'translateY(0)';
    }, 10);
  }
  
  // Mostrar Dashboard
  btnDashboard.addEventListener('click', function(e) {
    e.preventDefault();
    ocultarSecciones();
    removerActiveLinks();
    this.classList.add('active');
    seccionDashboard.style.display = 'block';
    animarEntrada(seccionDashboard);
  });
  
  // Mostrar Empleados
  btnEmpleados.addEventListener('click', function(e) {
    e.preventDefault();
    ocultarSecciones();
    removerActiveLinks();
    this.classList.add('active');
    seccionEmpleados.style.display = 'block';
    animarEntrada(seccionEmpleados);
  });
  
  // Mostrar Horarios
  btnHorarios.addEventListener('click', function(e) {
    e.preventDefault();
    ocultarSecciones();
    removerActiveLinks();
    this.classList.add('active');
    seccionHorarios.style.display = 'block';
    animarEntrada(seccionHorarios);
  });
  
  // Mostrar Incapacidades
  btnIncapacidades.addEventListener('click', function(e) {
    e.preventDefault();
    ocultarSecciones();
    removerActiveLinks();
    this.classList.add('active');
    seccionIncapacidades.style.display = 'block';
    animarEntrada(seccionIncapacidades);
  });
  
  // Mostrar Vacaciones
  btnVacaciones.addEventListener('click', function(e) {
    e.preventDefault();
    ocultarSecciones();
    removerActiveLinks();
    this.classList.add('active');
    seccionVacaciones.style.display = 'block';
    animarEntrada(seccionVacaciones);
  });
  
  // Mostrar Traslados
  btnTraslados.addEventListener('click', function(e) {
    e.preventDefault();
    ocultarSecciones();
    removerActiveLinks();
    this.classList.add('active');
    seccionTraslados.style.display = 'block';
    animarEntrada(seccionTraslados);
  });
  
  // Mostrar Reportes
  btnReportes.addEventListener('click', function(e) {
    e.preventDefault();
    ocultarSecciones();
    removerActiveLinks();
    this.classList.add('active');
    seccionReportes.style.display = 'block';
    animarEntrada(seccionReportes);
  });
  
  // Cerrar sesión
  btnCerrarSesion.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      mostrarAlerta('Cerrando sesión...', 'info');
      setTimeout(() => {
        window.location.href = '/logout';
      }, 1500);
    }
  });
  
  // Formulario de búsqueda de empleados
  const formBusqueda = document.getElementById('form-busqueda');
  const resultadoEmpleado = document.getElementById('resultadoEmpleado');
  
  formBusqueda.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const idEmpleado = document.getElementById('idEmpleado').value;
    const nombreEmpleado = document.getElementById('nombreEmpleado').value;
    
    if (!idEmpleado && !nombreEmpleado) {
      mostrarAlerta('Por favor ingrese al menos un criterio de búsqueda', 'warning');
      return;
    }
    
    // Simular búsqueda
    mostrarLoading(resultadoEmpleado);
    
    setTimeout(() => {
      // Datos simulados
      const empleado = {
        id: idEmpleado || '1001',
        nombre: nombreEmpleado || 'Fernanda',
        apellido: 'Astrid González',
        cargo: 'Desarrolladora Senior',
        sucursal: 'Sede Principal',
        estado: 'Activo',
        email: 'fernanda.gonzalez@easyjob.com',
        telefono: '+57 300 123 4567'
      };
      
      mostrarResultadoEmpleado(empleado);
    }, 1000);
  });
  
  // Función para mostrar loading
  function mostrarLoading(elemento) {
    elemento.style.display = 'block';
    elemento.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Buscando empleado...</p>
      </div>
    `;
  }
  
  // Función para mostrar resultado del empleado
  function mostrarResultadoEmpleado(empleado) {
    resultadoEmpleado.style.display = 'block';
    resultadoEmpleado.innerHTML = `
      <h4 class="mb-4"><i class="fas fa-user-circle text-primary me-2"></i>Información del Empleado</h4>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="info-item">
            <label class="text-muted"><i class="fas fa-id-card me-2"></i>ID:</label>
            <p class="fw-bold">${empleado.id}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="info-item">
            <label class="text-muted"><i class="fas fa-user me-2"></i>Nombre Completo:</label>
            <p class="fw-bold">${empleado.nombre} ${empleado.apellido}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="info-item">
            <label class="text-muted"><i class="fas fa-briefcase me-2"></i>Cargo:</label>
            <p class="fw-bold">${empleado.cargo}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="info-item">
            <label class="text-muted"><i class="fas fa-building me-2"></i>Sucursal:</label>
            <p class="fw-bold">${empleado.sucursal}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="info-item">
            <label class="text-muted"><i class="fas fa-circle me-2"></i>Estado:</label>
            <p class="fw-bold text-success">${empleado.estado}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="info-item">
            <label class="text-muted"><i class="fas fa-envelope me-2"></i>Email:</label>
            <p class="fw-bold">${empleado.email}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="info-item">
            <label class="text-muted"><i class="fas fa-phone me-2"></i>Teléfono:</label>
            <p class="fw-bold">${empleado.telefono}</p>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <button class="btn btn-primary me-2" onclick="editarEmpleado()">
          <i class="fas fa-edit me-2"></i>Editar
        </button>
        <button class="btn btn-warning" onclick="verHistorial()">
          <i class="fas fa-history me-2"></i>Ver Historial
        </button>
      </div>
    `;
    
    animarEntrada(resultadoEmpleado);
  }
  
  // Formulario de búsqueda de horarios
  const formBuscarHorario = document.getElementById('formBuscarHorario');
  const resultadoHorario = document.getElementById('resultadoHorario');
  
  formBuscarHorario.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const idHorarioEmpleado = document.getElementById('idHorarioEmpleado').value;
    const nombreHorarioEmpleado = document.getElementById('nombreHorarioEmpleado').value;
    
    if (!idHorarioEmpleado && !nombreHorarioEmpleado) {
      mostrarAlerta('Por favor ingrese al menos un criterio de búsqueda', 'warning');
      return;
    }
    
    // Simular búsqueda
    mostrarLoadingHorario();
    
    setTimeout(() => {
      resultadoHorario.style.display = 'block';
      animarEntrada(resultadoHorario);
      
      // Establecer fecha actual
      const hoy = new Date().toISOString().split('T')[0];
      document.getElementById('fechaHorario').value = hoy;
      document.getElementById('horaEntrada').value = '08:00';
      document.getElementById('horaSalida').value = '17:00';
    }, 800);
  });
  
  function mostrarLoadingHorario() {
    resultadoHorario.style.display = 'block';
    resultadoHorario.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando horarios...</p>
      </div>
    `;
    
    setTimeout(() => {
      resultadoHorario.innerHTML = `
        <h4 class="mb-3"><i class="fas fa-clock text-primary me-2"></i>Horario de: <span class="text-primary">Fernanda Astrid</span></h4>
        <div class="row g-3">
          <div class="col-md-6">
            <label for="fechaHorario" class="form-label">Fecha</label>
            <input type="date" class="form-control" id="fechaHorario" />
          </div>
          <div class="col-md-3">
            <label for="horaEntrada" class="form-label">Hora Entrada</label>
            <input type="time" class="form-control" id="horaEntrada" value="08:00" />
          </div>
          <div class="col-md-3">
            <label for="horaSalida" class="form-label">Hora Salida</label>
            <input type="time" class="form-control" id="horaSalida" value="17:00" />
          </div>
        </div>
        <div class="mt-4">
          <button class="btn btn-success me-2" onclick="asignarHorario()">
            <i class="fas fa-check me-2"></i>Asignar Horario
          </button>
          <button class="btn btn-warning" onclick="editarHorario()">
            <i class="fas fa-edit me-2"></i>Editar Horario
          </button>
        </div>
      `;
      
      // Establecer fecha actual
      const hoy = new Date().toISOString().split('T')[0];
      document.getElementById('fechaHorario').value = hoy;
    }, 800);
  }
  
  // Formulario de Incapacidades
  const formIncapacidades = document.getElementById('formIncapacidades');
  formIncapacidades.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const empleado = document.getElementById('empleadoIncapacidad').value;
    const tipo = document.getElementById('tipoIncapacidad').value;
    const fechaInicio = document.getElementById('fechaInicioIncapacidad').value;
    const fechaFin = document.getElementById('fechaFinIncapacidad').value;
    
    if (!empleado || !tipo || !fechaInicio || !fechaFin) {
      mostrarAlerta('Por favor complete todos los campos requeridos', 'warning');
      return;
    }
    
    mostrarAlerta('Incapacidad registrada exitosamente', 'success');
    formIncapacidades.reset();
  });
  
  // Formulario de Aprobación/Rechazo de Vacaciones (basado en tabla vacaciones)
const formVacaciones = document.getElementById('formVacaciones');
formVacaciones.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const idVacacion = document.getElementById('idVacacion').value.trim();
  const accion = document.querySelector('input[name="accionVacaciones"]:checked')?.value; // Aprobado o Rechazado
  const comentarios = document.getElementById('comentariosVacaciones')?.value.trim() || '';

  if (!idVacacion || !accion) {
    mostrarAlerta('Por favor seleccione una solicitud válida y una acción (Aprobar o Rechazar)', 'warning');
    return;
  }

  // Crear objeto con los datos a enviar al backend
  const datos = {
    id_vacacion: parseInt(idVacacion),
    estado: accion,
    comentarios: comentarios
  };

  // Enviar datos a PHP
  fetch('http://127.0.0.1/easyjob/vacaciones/aprobar_rechazar.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      mostrarAlerta(`Solicitud #${idVacacion} ${accion.toLowerCase()} correctamente`, 'success');
      formVacaciones.reset();
    } else {
      mostrarAlerta('Error al actualizar el estado de la solicitud', 'danger');
    }
  })
  .catch(err => {
    console.error('Error al conectar con el servidor:', err);
    mostrarAlerta('No se pudo conectar con el servidor', 'danger');
  });
});


  
  // Formulario de Traslados
  const formTraslados = document.getElementById('formTraslados');
  formTraslados.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const empleado = document.getElementById('empleadoTraslado').value;
    const sucursalActual = document.getElementById('sucursalActual').value;
    const sucursalDestino = document.getElementById('sucursalDestino').value;
    const fecha = document.getElementById('fechaTraslado').value;
    
    if (!empleado || !sucursalActual || !sucursalDestino || !fecha) {
      mostrarAlerta('Por favor complete todos los campos requeridos', 'warning');
      return;
    }
    
    if (sucursalActual === sucursalDestino) {
      mostrarAlerta('La sucursal destino debe ser diferente a la actual', 'warning');
      return;
    }
    
    mostrarAlerta('Traslado registrado exitosamente', 'success');
    formTraslados.reset();
  });
  
  // Formulario de Reportes
  const formReportes = document.getElementById('formReportes');
  formReportes.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('tipoReporte').value;
    const periodo = document.getElementById('periodoReporte').value;
    const fechaInicio = document.getElementById('fechaInicioReporte').value;
    const fechaFin = document.getElementById('fechaFinReporte').value;
    
    if (!tipo || !periodo || !fechaInicio || !fechaFin) {
      mostrarAlerta('Por favor complete todos los campos requeridos', 'warning');
      return;
    }
    
    // Simular generación de reporte
    mostrarAlerta('Generando reporte... Por favor espere', 'info');
    
    setTimeout(() => {
      mostrarAlerta('Reporte generado exitosamente. Descargando...', 'success');
    }, 2000);
  });
  
  // Función para mostrar alertas
  function mostrarAlerta(mensaje, tipo = 'info') {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alertaDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertaDiv.role = 'alert';
    alertaDiv.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertaDiv);
    
    setTimeout(() => {
      alertaDiv.remove();
    }, 4000);
  }
  
  // Hacer la función global
  window.mostrarAlerta = mostrarAlerta;
  
  // Efectos hover en las cards
  const cards = document.querySelectorAll('.card-custom');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Animación de los íconos en la lista de bienvenida
  const listItems = document.querySelectorAll('.list-unstyled li');
  listItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      item.style.transition = 'all 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 100 * index);
  });
  
});

// Funciones globales para los botones
function editarEmpleado() {
  mostrarAlerta('Función de editar empleado en desarrollo', 'info');
}

function verHistorial() {
  mostrarAlerta('Función de ver historial en desarrollo', 'info');
}

function asignarHorario() {
  const fecha = document.getElementById('fechaHorario').value;
  const horaEntrada = document.getElementById('horaEntrada').value;
  const horaSalida = document.getElementById('horaSalida').value;
  
  if (!fecha || !horaEntrada || !horaSalida) {
    mostrarAlerta('Por favor complete todos los campos', 'warning');
    return;
  }
  
  mostrarAlerta('Horario asignado exitosamente', 'success');
}

function editarHorario() {
  mostrarAlerta('Función de editar horario en desarrollo', 'info');
}

// Menú responsive (para móviles)
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}

// Agregar botón de menú para móviles
if (window.innerWidth <= 768) {
  const menuBtn = document.createElement('button');
  menuBtn.className = 'btn btn-primary position-fixed';
  menuBtn.style.cssText = 'top: 1rem; left: 1rem; z-index: 1001;';
  menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  menuBtn.onclick = toggleSidebar;
  document.body.appendChild(menuBtn);
}