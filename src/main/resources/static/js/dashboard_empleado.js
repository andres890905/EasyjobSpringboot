// Datos del empleado (esto normalmente vendría de una base de datos)
const empleadoData = {
  nombre: "Maicol Estiven Amaya Pachon",
  cargo: "Vendedor",
  sucursal: "Ventura terreros",
  fechaRegistro: "2025-03-24",
  correo: "maicolsoy23@gmail.com",
  direccion: "carrera 21 este #33-02",
  cedula: "1000364783",
  fechaNacimiento: "31/10/2001",
  iniciales: "MA",
  avatar: "img/Perfil.png.jpg"
};

// Datos de navegación
const menuItems = {
  misDatos: { icon: '👤', text: 'Mis datos', url: '#mis-datos' },
  vacaciones: { icon: '🌴', text: 'Vacaciones', url: '#vacaciones' },
  incapacidades: { icon: '🏥', text: 'Incapacidades', url: '#incapacidades' },
  programacion: { icon: '📅', text: 'Programación', url: '#programacion' },
  certificados: { icon: '🧾', text: 'Certificados', url: '#certificados' }
};

// Función para inicializar el dashboard
function initDashboard() {
  setupNavigation();
  loadUserData();
  setupImageError();
  addWelcomeAnimation();
  setupLogout();
}

// Configurar navegación del menú lateral
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach((item, index) => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remover clase active de todos los items
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Agregar clase active al item clickeado
      this.classList.add('active');
      
      // Cambiar contenido según la sección
      const sections = Object.keys(menuItems);
      loadSection(sections[index]);
      
      // Efecto de pulso
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 100);
    });
    
    // Efecto hover con animación
    item.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
}

// Cargar datos del usuario
function loadUserData() {
  const userAvatar = document.querySelector('.user-avatar');
  const userName = document.querySelector('.user-name');
  
  if (userAvatar) {
    userAvatar.textContent = empleadoData.iniciales;
  }
  
  if (userName) {
    userName.textContent = empleadoData.nombre.split(' ')[0] + ' ' + empleadoData.nombre.split(' ')[2];
  }
}

// Cargar diferentes secciones
function loadSection(section) {
  const mainContent = document.querySelector('.main-content');
  
  switch(section) {
    case 'misDatos':
      loadProfileSection(mainContent);
      break;
    case 'vacaciones':
      loadVacacionesSection(mainContent);
      break;
    case 'incapacidades':
      loadIncapacidadesSection(mainContent);
      break;
    case 'programacion':
      loadProgramacionSection(mainContent);
      break;
    case 'certificados':
      loadCertificadosSection(mainContent);
      break;
  }
}

// Sección de perfil
function loadProfileSection(container) {
  container.innerHTML = `
    <div class="card">
      <img src="${empleadoData.avatar}" alt="Foto de perfil" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22150%22 height=%22150%22/%3E%3Ctext fill=%22%23999%22 x=%2250%%25%22 y=%2250%%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2260%22%3E${empleadoData.iniciales}%3C/text%3E%3C/svg%3E'">
      <h2>${empleadoData.nombre}</h2>
      <h3>${empleadoData.cargo}</h3>
      <p><span>Sucursal:</span> ${empleadoData.sucursal}</p>
      <p><span>Fecha de Registro:</span> ${empleadoData.fechaRegistro}</p>
      <p><span>Correo:</span> ${empleadoData.correo}</p>
      <p><span>Dirección:</span> ${empleadoData.direccion}</p>
      <p><span>Cédula:</span> ${empleadoData.cedula}</p>
      <p><span>Fecha de nacimiento:</span> ${empleadoData.fechaNacimiento}</p>
    </div>
  `;
  addCardAnimation();
}

// Sección de vacaciones
function loadVacacionesSection(container) {
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">🌴 Vacaciones</h2>
      <div style="margin-top: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 15px;">
          <h4 style="color: #667eea; margin-bottom: 10px;">Días disponibles</h4>
          <p style="font-size: 32px; font-weight: bold; color: #2c3e50; border: none;">15 días</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 15px;">
          <h4 style="color: #667eea; margin-bottom: 10px;">Días utilizados este año</h4>
          <p style="font-size: 24px; font-weight: bold; color: #555; border: none;">5 días</p>
        </div>
        <button onclick="solicitarVacaciones()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 15px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: transform 0.3s;">
          Solicitar Vacaciones
        </button>
      </div>
    </div>
  `;
  addCardAnimation();
}

// Sección de incapacidades
function loadIncapacidadesSection(container) {
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">🏥 Incapacidades</h2>
      <div style="margin-top: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 15px;">
          <h4 style="color: #667eea; margin-bottom: 10px;">Historial de incapacidades</h4>
          <p style="color: #999; border: none;">No hay registros de incapacidades</p>
        </div>
        <button onclick="reportarIncapacidad()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 15px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: transform 0.3s;">
          Reportar Incapacidad
        </button>
      </div>
    </div>
  `;
  addCardAnimation();
}

// Sección de programación
function loadProgramacionSection(container) {
  const hoy = new Date().toLocaleDateString('es-CO');
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">📅 Programación</h2>
      <div style="margin-top: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 15px;">
          <h4 style="color: #667eea; margin-bottom: 10px;">Horario de hoy</h4>
          <p style="border: none;"><strong>Fecha:</strong> ${hoy}</p>
          <p style="border: none;"><strong>Turno:</strong> 8:00 AM - 5:00 PM</p>
          <p style="border: none;"><strong>Ubicación:</strong> ${empleadoData.sucursal}</p>
        </div>
        <button onclick="verCalendario()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 15px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px;">
          Ver Calendario Completo
        </button>
      </div>
    </div>
  `;
  addCardAnimation();
}

// Sección de certificados
function loadCertificadosSection(container) {
  container.innerHTML = `
    <div class="card">
      <h2 style="margin-top: 20px;">🧾 Certificados</h2>
      <div style="margin-top: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
          <h4 style="color: #667eea; margin-bottom: 5px;">📄 Certificado Laboral</h4>
          <p style="color: #999; font-size: 13px; border: none;">Descargar certificado de trabajo</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
          <h4 style="color: #667eea; margin-bottom: 5px;">💰 Certificado de Ingresos</h4>
          <p style="color: #999; font-size: 13px; border: none;">Descargar certificado de salario</p>
        </div>
        <button onclick="solicitarCertificado()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 15px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px;">
          Solicitar Otro Certificado
        </button>
      </div>
    </div>
  `;
  addCardAnimation();
}

// Funciones auxiliares
function solicitarVacaciones() {
  alert('Función de solicitud de vacaciones. Aquí se abriría un formulario.');
}

function reportarIncapacidad() {
  alert('Función de reporte de incapacidad. Aquí se abriría un formulario.');
}

function verCalendario() {
  alert('Función de calendario. Aquí se mostraría el calendario completo.');
}

function solicitarCertificado() {
  alert('Función de solicitud de certificado. Aquí se abriría un formulario.');
}

// Animación de entrada para las tarjetas
function addCardAnimation() {
  const card = document.querySelector('.card');
  if (card) {
    card.style.animation = 'none';
    setTimeout(() => {
      card.style.animation = 'slideUp 0.6s ease-out';
    }, 10);
  }
}

// Manejo de errores de imagen
function setupImageError() {
  const profileImg = document.querySelector('.card img');
  if (profileImg) {
    profileImg.onerror = function() {
      this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23ddd' width='150' height='150'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='60'%3E${empleadoData.iniciales}%3C/text%3E%3C/svg%3E`;
    };
  }
}

// Animación de bienvenida
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

// Configurar cierre de sesión
function setupLogout() {
  const userProfile = document.querySelector('.user-profile');
  if (userProfile) {
    userProfile.addEventListener('dblclick', function() {
      if (confirm('¿Deseas cerrar sesión?')) {
        window.location.href = '/logout';
      }
    });
  }
}

// Efecto de hover en botones
document.addEventListener('mouseover', function(e) {
  if (e.target.tagName === 'BUTTON') {
    e.target.style.transform = 'scale(1.05)';
  }
});

document.addEventListener('mouseout', function(e) {
  if (e.target.tagName === 'BUTTON') {
    e.target.style.transform = 'scale(1)';
  }
});

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}