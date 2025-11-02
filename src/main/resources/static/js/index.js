const categories = {
  personal: {
    title: 'Gestión De Personal',
    description: '"Permite administrar de manera integral la información de los empleados, incluyendo datos personales, historial de contratos, desempeño laboral y otros registros relevantes, facilitando la gestión eficiente y la toma de decisiones informadas dentro de la organización."',
    image: 'imagenes/hero.jpg'
  },
  capacitaciones: {
    title: 'Capacitaciones',
    description: '"Organiza y gestiona programas de formación y desarrollo profesional, promoviendo la mejora continua del personal, fortaleciendo sus competencias y contribuyendo al crecimiento y éxito de la empresa."',
    image: 'imagenes/capacitacion.jpg'
  },
  asesoria: {
    title: 'Asesoría Laboral',
    description: '"Recibe asesoría experta en asuntos legales y laborales, asegurando que tu empresa cumpla con todas las normativas vigentes y minimizando riesgos legales, para operar de manera segura y eficiente."',
    image: 'imagenes/entrevista.jpg'
  },
  digital: {
    title: 'Transformación Digital',
    description: '"Con Easy Job, moderniza los procesos de tu empresa mediante tecnología especializada, optimizando la gestión de empleados, aumentando la eficiencia operativa y potenciando la productividad de tu equipo."',
    image: 'imagenes/trabajadores.jpg'
  }
};

let currentCategory = 'personal';

function showCategory(categoryKey) {
  if (currentCategory === categoryKey) return;

  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${categoryKey}`).classList.add('active');

  const contentArea = document.getElementById('content-area');
  contentArea.classList.remove('show');

  setTimeout(() => {
    updateContent(categoryKey);
    contentArea.classList.add('show');
  }, 250);

  currentCategory = categoryKey;
}

function updateContent(categoryKey) {
  const category = categories[categoryKey];
  document.getElementById('category-title').textContent = category.title;
  document.getElementById('category-description').textContent = category.description;
  document.getElementById('main-image').innerHTML = `<img src="${category.image}" alt="${category.title}">`;
}

document.addEventListener('DOMContentLoaded', () => {
  updateContent('personal');
});
const slides = document.querySelectorAll('.hero-img');
let currentSlide = 0;

function nextSlide() {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}
 window.addEventListener('DOMContentLoaded', (event) => {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            setTimeout(() => {
                errorMessage.style.transition = "opacity 0.5s, height 0.5s, padding 0.5s, margin 0.5s";
                errorMessage.style.opacity = "0";
                errorMessage.style.height = "0";
                errorMessage.style.padding = "0";
                errorMessage.style.margin = "0";
            }, 5000);
        }
    });
// Cambiar imagen cada 5 segundos
setInterval(nextSlide, 10000);
