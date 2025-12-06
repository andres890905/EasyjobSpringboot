const ReportesModule = {
    inicializado: false,
    API_BASE_URL: "http://localhost:9090/api/reportes",
    API_PROGRAMACION_URL: "http://localhost:9090/api/reportes-programacion",
    datosActuales: null,
    // Filtros para programación
    filtrosProgramacion: {
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        usarRango: false,
        fechaInicio: '',
        fechaFin: ''
    },

    init() {
        if (this.inicializado) return;
        
        console.log("ReportesModule: Intentando inicializar...");

        const tipoReporte = document.getElementById("tipoReporte");
        const btnGenerarPDF = document.getElementById("btnGenerarPDF");
        const resultado = document.getElementById("resultadoReporte");
        const tablaContenedor = document.getElementById("tablaContenedor");

        if (!tipoReporte || !btnGenerarPDF || !resultado || !tablaContenedor) {
            console.warn("⚠️ Algunos elementos no se encontraron todavía. Reintentando en 500ms...");
            setTimeout(() => this.init(), 500);
            return;
        }

        this.inicializado = true;
        console.log("✅ ReportesModule inicializado correctamente");

        tablaContenedor.style.display = "none";

        // Crear controles de filtros para programación
        this.crearControlesFiltrosProgramacion();

        tipoReporte.addEventListener("change", async () => {
            await this.cargarVistaPrevia(tipoReporte.value, resultado, tablaContenedor);
        });

        btnGenerarPDF.addEventListener("click", () => {
            this.descargarPDF(tipoReporte.value);
        });
    },

    crearControlesFiltrosProgramacion() {
        const tipoReporte = document.getElementById("tipoReporte");
        const resultado = document.getElementById("resultadoReporte");
        
        // Crear contenedor de filtros
        let filtrosHTML = `
            <div id="filtrosProgramacion" style="display: none;" class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0"><i class="bi bi-funnel me-2"></i>Filtros de Programación</h6>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-12">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="usarRangoFechas">
                                <label class="form-check-label" for="usarRangoFechas">
                                    <strong>Usar rango de fechas personalizado</strong>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Filtros por Mes/Año -->
                    <div id="filtrosMesAnio" class="row g-3 mt-2">
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-calendar-month me-1"></i>Mes</label>
                            <select class="form-select" id="filtroMes">
                                <option value="1">Enero</option>
                                <option value="2">Febrero</option>
                                <option value="3">Marzo</option>
                                <option value="4">Abril</option>
                                <option value="5">Mayo</option>
                                <option value="6">Junio</option>
                                <option value="7">Julio</option>
                                <option value="8">Agosto</option>
                                <option value="9">Septiembre</option>
                                <option value="10">Octubre</option>
                                <option value="11">Noviembre</option>
                                <option value="12">Diciembre</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-calendar3 me-1"></i>Año</label>
                            <select class="form-select" id="filtroAnio"></select>
                        </div>
                    </div>
                    
                    <!-- Filtros por Rango -->
                    <div id="filtrosRango" class="row g-3 mt-2" style="display: none;">
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-calendar-check me-1"></i>Fecha Inicio</label>
                            <input type="date" class="form-control" id="fechaInicio">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label"><i class="bi bi-calendar-x me-1"></i>Fecha Fin</label>
                            <input type="date" class="form-control" id="fechaFin">
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <button class="btn btn-primary w-100" id="btnAplicarFiltros">
                                <i class="bi bi-search me-2"></i>Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar antes del resultado
        resultado.insertAdjacentHTML('beforebegin', filtrosHTML);

        // Poblar años (últimos 5 años)
        const anioSelect = document.getElementById('filtroAnio');
        const anioActual = new Date().getFullYear();
        for (let i = anioActual; i >= anioActual - 5; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === anioActual) option.selected = true;
            anioSelect.appendChild(option);
        }

        // Seleccionar mes actual
        const mesActual = new Date().getMonth() + 1;
        document.getElementById('filtroMes').value = mesActual;

        // Event listeners
        document.getElementById('usarRangoFechas').addEventListener('change', (e) => {
            document.getElementById('filtrosMesAnio').style.display = e.target.checked ? 'none' : 'flex';
            document.getElementById('filtrosRango').style.display = e.target.checked ? 'flex' : 'none';
            this.filtrosProgramacion.usarRango = e.target.checked;
        });

        document.getElementById('btnAplicarFiltros').addEventListener('click', async () => {
            const tipo = tipoReporte.value;
            if (tipo === 'programacion') {
                if (this.filtrosProgramacion.usarRango) {
                    this.filtrosProgramacion.fechaInicio = document.getElementById('fechaInicio').value;
                    this.filtrosProgramacion.fechaFin = document.getElementById('fechaFin').value;
                    
                    if (!this.filtrosProgramacion.fechaInicio || !this.filtrosProgramacion.fechaFin) {
                        this.mostrarAlerta('Por favor seleccione ambas fechas', 'warning');
                        return;
                    }
                } else {
                    this.filtrosProgramacion.mes = parseInt(document.getElementById('filtroMes').value);
                    this.filtrosProgramacion.anio = parseInt(document.getElementById('filtroAnio').value);
                }
                
                await this.cargarVistaPrevia(tipo, resultado, document.getElementById('tablaContenedor'));
            }
        });
    },

    async cargarVistaPrevia(tipo, resultado, tablaContenedor) {
        const filtrosDiv = document.getElementById('filtrosProgramacion');
        
        if (!tipo) {
            resultado.innerHTML = "<p class='text-info'><i class='bi bi-info-circle me-2'></i>Seleccione un reporte para visualizar.</p>";
            tablaContenedor.style.display = "none";
            if (filtrosDiv) filtrosDiv.style.display = "none";
            this.datosActuales = null;
            return;
        }

        // Mostrar filtros solo para programación
        if (filtrosDiv) {
            filtrosDiv.style.display = tipo === 'programacion' ? 'block' : 'none';
        }

        resultado.innerHTML = `
            <div class="d-flex align-items-center">
                <span class='spinner-border spinner-border-sm me-2'></span>
                <span>Cargando datos del reporte...</span>
            </div>
        `;
        tablaContenedor.style.display = "none";

        try {
            let res, data;
            
            if (tipo === 'programacion') {
                // Usar el nuevo API de programación
                const params = new URLSearchParams();
                
                if (this.filtrosProgramacion.usarRango) {
                    params.append('fechaInicio', this.filtrosProgramacion.fechaInicio);
                    params.append('fechaFin', this.filtrosProgramacion.fechaFin);
                    res = await fetch(`${this.API_PROGRAMACION_URL}/datos/rango?${params}`);
                } else {
                    params.append('mes', this.filtrosProgramacion.mes);
                    params.append('anio', this.filtrosProgramacion.anio);
                    res = await fetch(`${this.API_PROGRAMACION_URL}/datos?${params}`);
                }
            } else {
                // Usar el API antiguo para usuarios e incapacidades
                res = await fetch(`${this.API_BASE_URL}/preview/empleados/${tipo}`);
            }
            
            if (!res.ok) {
                throw new Error(`Error del servidor: ${res.status} - ${res.statusText}`);
            }
            
            data = await res.json();
            
            console.log("=== DATOS RECIBIDOS DE LA API ===");
            console.log("Tipo de reporte:", tipo);
            console.log("Datos:", data);
            console.log("Es array:", Array.isArray(data));
            console.log("Cantidad de elementos:", Array.isArray(data) ? data.length : "No es array");
            console.log("================================");
            
            this.datosActuales = data;

            const cantidadRegistros = Array.isArray(data) ? data.length : 0;
            resultado.innerHTML = `
                <div class="alert alert-success d-flex align-items-center mb-3">
                    <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div>
                        <strong>Datos cargados exitosamente</strong><br>
                        <small>${cantidadRegistros} registro${cantidadRegistros !== 1 ? 's' : ''} encontrado${cantidadRegistros !== 1 ? 's' : ''}</small>
                    </div>
                </div>
            `;

            await this.generarTablas(tipo, data, tablaContenedor);
            tablaContenedor.style.display = "block";

        } catch (err) {
            console.error("Error cargando datos:", err);
            resultado.innerHTML = `
                <div class="alert alert-danger">
                    <h6 class="alert-heading"><i class="bi bi-exclamation-triangle me-2"></i>Error al cargar datos</h6>
                    <p class="mb-0"><small>${err.message}</small></p>
                    <hr>
                    <small class="text-muted">Verifique que el servidor esté en funcionamiento</small>
                </div>
            `;
            tablaContenedor.style.display = "none";
            this.datosActuales = null;
        }
    },

    descargarPDF(tipo) {
        if (!tipo) {
            this.mostrarAlerta("Por favor seleccione un tipo de reporte", "warning");
            return;
        }

        if (!this.datosActuales || (Array.isArray(this.datosActuales) && this.datosActuales.length === 0)) {
            this.mostrarAlerta("No hay datos para generar el PDF. Cargue primero la vista previa.", "warning");
            return;
        }
        
        console.log(`Generando PDF de tipo: ${tipo}`);
        
        let url;
        
        if (tipo === 'programacion') {
            // Usar el nuevo API de programación
            const params = new URLSearchParams();
            
            if (this.filtrosProgramacion.usarRango) {
                params.append('fechaInicio', this.filtrosProgramacion.fechaInicio);
                params.append('fechaFin', this.filtrosProgramacion.fechaFin);
                url = `${this.API_PROGRAMACION_URL}/pdf/rango?${params}`;
            } else {
                params.append('mes', this.filtrosProgramacion.mes);
                params.append('anio', this.filtrosProgramacion.anio);
                url = `${this.API_PROGRAMACION_URL}/pdf?${params}`;
            }
        } else {
            // Usar el API antiguo para usuarios e incapacidades
            url = `${this.API_BASE_URL}/pdf/${tipo}`;
        }
        
        window.open(url, "_blank");
        this.mostrarAlerta("Generando PDF... Se abrirá en una nueva pestaña", "info");
    },

    mostrarAlerta(mensaje, tipo = "info") {
        const iconos = {
            success: "check-circle",
            warning: "exclamation-triangle",
            danger: "x-circle",
            info: "info-circle"
        };

        const alerta = document.createElement("div");
        alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alerta.style.zIndex = "9999";
        alerta.style.minWidth = "300px";
        alerta.innerHTML = `
            <i class="bi bi-${iconos[tipo]} me-2"></i>${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            alerta.remove();
        }, 4000);
    },

    async generarTablas(tipo, datos, contenedor) {
        console.log("=== VALIDANDO DATOS EN generarTablas ===");
        console.log("Tipo:", tipo);
        console.log("Datos recibidos:", datos);
        console.log("Es null/undefined:", datos === null || datos === undefined);
        console.log("Es array:", Array.isArray(datos));
        console.log("Length:", Array.isArray(datos) ? datos.length : "N/A");
        console.log("==========================================");

        if (!datos) {
            console.warn("⚠️ Datos es null o undefined");
            contenedor.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Los datos recibidos son nulos. Verifique la respuesta del servidor.
                </div>
            `;
            return;
        }

        if (!Array.isArray(datos)) {
            console.warn("⚠️ Datos no es un array:", typeof datos);
            contenedor.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Los datos recibidos no tienen el formato esperado (se esperaba un array).
                    <br><small>Tipo recibido: ${typeof datos}</small>
                </div>
            `;
            return;
        }

        if (datos.length === 0) {
            console.warn("⚠️ Array de datos está vacío");
            contenedor.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    No hay datos disponibles para el reporte de <strong>${tipo}</strong>
                </div>
            `;
            return;
        }

        console.log("✅ Datos validados correctamente. Generando tablas...");

        let html = '';

        switch (tipo.toLowerCase()) {
            case "usuarios":
                html = this.generarTablaUsuarios(datos);
                break;
            case "programacion":
                html = this.generarTablaProgramacion(datos);
                break;
            case "incapacidades":
                html = this.generarTablaIncapacidades(datos);
                break;
            default:
                html = `
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Tipo de reporte no soportado: <strong>${tipo}</strong>
                    </div>
                `;
        }

        contenedor.innerHTML = html;
    },

    generarTablaUsuarios(usuarios) {
        const total = usuarios.length;
        const activos = usuarios.filter(u => u.estado && u.estado.trim().toLowerCase() === 'activo').length;
        const inactivos = total - activos;
        
        const salarios = usuarios.filter(u => u.salario && !isNaN(u.salario)).map(u => parseFloat(u.salario));
        const salarioPromedio = salarios.length > 0 
            ? salarios.reduce((a, b) => a + b, 0) / salarios.length 
            : 0;
        const nominaTotal = salarios.reduce((a, b) => a + b, 0);

        return `
            <!-- Métricas Principales -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card text-center border-primary shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-people-fill fs-3 text-primary mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Total Usuarios</h6>
                            <h2 class="card-title text-primary mb-0">${total}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-success shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-check-circle-fill fs-3 text-success mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Activos</h6>
                            <h2 class="card-title text-success mb-0">${activos}</h2>
                            <small class="text-muted">${total > 0 ? ((activos/total)*100).toFixed(1) : 0}%</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-danger shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-x-circle-fill fs-3 text-danger mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Inactivos</h6>
                            <h2 class="card-title text-danger mb-0">${inactivos}</h2>
                            <small class="text-muted">${total > 0 ? ((inactivos/total)*100).toFixed(1) : 0}%</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-warning shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-cash-coin fs-3 text-warning mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Salario Promedio</h6>
                            <h2 class="card-title text-warning mb-0">$${this.formatearMoneda(salarioPromedio)}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nómina Total -->
            <div class="alert alert-success shadow-sm text-center mb-4">
                <i class="bi bi-wallet2 fs-3 mb-2"></i>
                <h5 class="mb-2">💰 Nómina Total Mensual</h5>
                <h3 class="mb-0"><strong>$${this.formatearMoneda(nominaTotal)}</strong></h3>
            </div>

            <!-- Tabla de Usuarios -->
            <div class="card shadow-sm">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">Listado Detallado de Usuarios</h5>
                </div>
                <div class="card-body p-0">
                    ${this.generarTablaUsuariosHTML(usuarios)}
                </div>
            </div>
        `;
    },

    generarTablaUsuariosHTML(usuarios) {
        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                    <thead class="table-dark">
                        <tr>
                            <th>Cédula</th>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Estado</th>
                            <th>Salario</th>
                            <th>Sucursal</th>
                            <th>Cargo</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!usuarios || usuarios.length === 0) {
            html += `
                <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-3"></i>
                        <p class="mb-0 mt-2">No hay usuarios registrados</p>
                    </td>
                </tr>
            `;
        } else {
            usuarios.forEach((u, index) => {
                const estadoActivo = u.estado && u.estado.trim().toLowerCase() === 'activo';
                html += `
                    <tr>
                        <td><strong>${u.id || 'N/A'}</strong></td>
                        <td>${u.nombreCompleto || 'N/A'}</td>
                        <td><small>${u.correo || 'N/A'}</small></td>
                        <td>${u.telefono || 'N/A'}</td>
                        <td><small>${u.direccion || 'N/A'}</small></td>
                        <td>
                            <span class="badge ${estadoActivo ? 'bg-success' : 'bg-secondary'}">
                                <i class="bi bi-${estadoActivo ? 'check-circle' : 'x-circle'} me-1"></i>
                                ${u.estado || 'N/A'}
                            </span>
                        </td>
                        <td><strong>${u.salario ? this.formatearMoneda(u.salario) : 'N/A'}</strong></td>
                        <td>${u.sucursal || 'N/A'}</td>
                        <td><span class="badge bg-primary">${u.rol || 'N/A'}</span></td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    },

    generarTablaProgramacion(reportes) {
        // Los datos vienen agrupados por empleado con estadísticas calculadas
        const total = reportes.length;
        
        // Calcular totales
        let totalDescansos = 0;
        let totalDominicales = 0;
        let totalHorasExtra = 0;

        reportes.forEach(r => {
            totalDescansos += r.totalDescansos || 0;
            totalDominicales += r.totalDominicales || 0;
            totalHorasExtra += r.totalHorasExtra || 0;
        });

        return `
            <!-- Métricas Programación -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card text-center border-primary shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-people-fill fs-3 text-primary mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Total Empleados</h6>
                            <h2 class="card-title text-primary mb-0">${total}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-warning shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-moon-stars-fill fs-3 text-warning mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Total Descansos</h6>
                            <h2 class="card-title text-warning mb-0">${totalDescansos}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-info shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-calendar-week fs-3 text-info mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Total Dominicales</h6>
                            <h2 class="card-title text-info mb-0">${totalDominicales}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-success shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-clock-history fs-3 text-success mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Total Horas Extra</h6>
                            <h2 class="card-title text-success mb-0">${totalHorasExtra.toFixed(1)}</h2>
                            <small class="text-muted">horas</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Programación -->
            <div class="card shadow-sm">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">Resumen por Empleado</h5>
                </div>
                <div class="card-body p-0">
                    ${this.generarTablaProgramacionHTML(reportes)}
                </div>
            </div>
        `;
    },

    generarTablaProgramacionHTML(reportes) {
        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                    <thead class="table-dark text-dark">
                        <tr>
                            <th>Cédula</th>
                            <th>Empleado</th>                           
                            <th>Descansos</th>
                            <th>Dominicales</th>
                            <th>Total Días</th>
                            <th>Horas Extra</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!reportes || reportes.length === 0) {
            html += `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-3"></i>
                        <p class="mb-0 mt-2">No hay datos de programación</p>
                    </td>
                </tr>
            `;
        } else {
            reportes.forEach(r => {
                const totalDias = (r.diasNormales || 0) + (r.totalDescansos || 0) + (r.totalDominicales || 0);
                html += `
                    <tr>
                        <td><strong>${r.idUsuario || 'N/A'}</strong></td>
                        <td>${r.nombreCompleto || 'N/A'}</td>
                        <td><span class="badge bg-warning text-dark">${r.totalDescansos || 0}</span></td>
                        <td><span class="badge bg-info">${r.totalDominicales || 0}</span></td>
                        <td><strong>${totalDias}</strong></td>
                        <td><strong class="text-success">${r.totalHorasExtra ? r.totalHorasExtra.toFixed(2) : '0.00'}</strong></td>
                        <td>
                            <button class="btn btn-sm btn-danger" 
                                    onclick="ReportesModule.descargarPDFIndividual(${r.idUsuario})"
                                    title="Descargar PDF individual">
                                <i class="bi bi-file-pdf me-1"></i>PDF
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    },

    // NUEVO MÉTODO: Descargar PDF individual
    descargarPDFIndividual(idEmpleado) {
        if (!idEmpleado) {
            this.mostrarAlerta("ID de empleado inválido", "danger");
            return;
        }

        console.log(`Generando PDF individual para empleado: ${idEmpleado}`);
        
        let url;
        const params = new URLSearchParams();
        
        if (this.filtrosProgramacion.usarRango) {
            // PDF por rango de fechas
            if (!this.filtrosProgramacion.fechaInicio || !this.filtrosProgramacion.fechaFin) {
                this.mostrarAlerta('Por favor configure las fechas primero', 'warning');
                return;
            }
            params.append('fechaInicio', this.filtrosProgramacion.fechaInicio);
            params.append('fechaFin', this.filtrosProgramacion.fechaFin);
            url = `${this.API_PROGRAMACION_URL}/pdf/empleado/${idEmpleado}/rango?${params}`;
        } else {
            // PDF por mes/año
            params.append('mes', this.filtrosProgramacion.mes);
            params.append('anio', this.filtrosProgramacion.anio);
            url = `${this.API_PROGRAMACION_URL}/pdf/empleado/${idEmpleado}?${params}`;
        }
        
        window.open(url, "_blank");
        this.mostrarAlerta("Generando PDF individual... Se abrirá en una nueva pestaña", "info");
    },

    generarTablaIncapacidades(incapacidades) {
        const total = incapacidades.length;
        const aprobadas = incapacidades.filter(i => i.estado && i.estado.toLowerCase() === 'aprobada').length;
        const pendientes = incapacidades.filter(i => i.estado && i.estado.toLowerCase() === 'pendiente').length;
        const rechazadas = total - aprobadas - pendientes;

        const totalDias = incapacidades.reduce((sum, i) => sum + (parseInt(i.dias) || 0), 0);

        return `
            <!-- Métricas Incapacidades -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card text-center border-primary shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-file-medical fs-3 text-primary mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Total Incapacidades</h6>
                            <h2 class="card-title text-primary mb-0">${total}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-success shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-check-circle-fill fs-3 text-success mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Aprobadas</h6>
                            <h2 class="card-title text-success mb-0">${aprobadas}</h2>
                            <small class="text-muted">${total > 0 ? ((aprobadas/total)*100).toFixed(1) : 0}%</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-warning shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-hourglass-split fs-3 text-warning mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Pendientes</h6>
                            <h2 class="card-title text-warning mb-0">${pendientes}</h2>
                            <small class="text-muted">${total > 0 ? ((pendientes/total)*100).toFixed(1) : 0}%</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center border-info shadow-sm h-100">
                        <div class="card-body">
                            <i class="bi bi-calendar-x fs-3 text-info mb-2"></i>
                            <h6 class="card-subtitle mb-2 text-muted">Total Días</h6>
                            <h2 class="card-title text-info mb-0">${totalDias}</h2>
                            <small class="text-muted">días acumulados</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Incapacidades -->
            <div class="card shadow-sm">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0"><i class="bi bi-table me-2"></i>Listado de Incapacidades</h5>
                </div>
                <div class="card-body p-0">
                    ${this.generarTablaIncapacidadesHTML(incapacidades)}
                </div>
            </div>
        `;
    },

    generarTablaIncapacidadesHTML(incapacidades) {
        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover mb-0">
                    <thead class="table-dark">
                        <tr>
                            <th><i class="bi bi-hash me-1"></i>Cédula</th>
                            <th><i class="bi bi-person me-1"></i>Empleado</th>
                            <th><i class="bi bi-file-medical me-1"></i>Tipo</th>
                            <th><i class="bi bi-calendar-check me-1"></i>Fecha Inicio</th>
                            <th><i class="bi bi-calendar-x me-1"></i>Fecha Fin</th>
                            <th><i class="bi bi-clock me-1"></i>Días</th>
                            <th><i class="bi bi-check-circle me-1"></i>Estado</th>
                            <th><i class="bi bi-file-text me-1"></i>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!incapacidades || incapacidades.length === 0) {
            html += `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-3"></i>
                        <p class="mb-0 mt-2">No hay incapacidades registradas</p>
                    </td>
                </tr>
            `;
        } else {
            incapacidades.forEach(i => {
                const estadoBadge = this.obtenerBadgeEstado(i.estado);
                html += `
                    <tr>
                        <td><strong>${i.id || 'N/A'}</strong></td>
                        <td>${i.nombreEmpleado || 'N/A'}</td>
                        <td><span class="badge bg-info">${i.tipo || 'N/A'}</span></td>
                        <td>${i.fechaInicio ? this.formatearFecha(i.fechaInicio) : 'N/A'}</td>
                        <td>${i.fechaFin ? this.formatearFecha(i.fechaFin) : 'N/A'}</td>
                        <td><strong>${i.dias || 0}</strong></td>
                        <td>
                            <span class="badge ${estadoBadge.class}">
                                <i class="bi bi-${estadoBadge.icon} me-1"></i>
                                ${i.estado || 'N/A'}
                            </span>
                        </td>
                        <td><small>${i.observaciones || '-'}</small></td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    },

    // ====== FUNCIONES AUXILIARES ======

    formatearMoneda(valor) {
        if (!valor || isNaN(valor)) return '0';
        return parseFloat(valor).toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    },

    formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        try {
            const date = new Date(fecha);
            if (isNaN(date.getTime())) return fecha;
            
            return date.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return fecha;
        }
    },

    obtenerBadgeEstado(estado) {
        if (!estado) return { class: 'bg-secondary', icon: 'question-circle' };
        
        const estadoLower = estado.toLowerCase();
        
        if (estadoLower === 'aprobada' || estadoLower === 'aprobado') {
            return { class: 'bg-success', icon: 'check-circle' };
        } else if (estadoLower === 'pendiente') {
            return { class: 'bg-warning text-dark', icon: 'hourglass-split' };
        } else if (estadoLower === 'rechazada' || estadoLower === 'rechazado') {
            return { class: 'bg-danger', icon: 'x-circle' };
        } else {
            return { class: 'bg-secondary', icon: 'info-circle' };
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.reporte-card');
    const tipoReporteInput = document.getElementById('tipoReporte');
    const btnGenerarPDF = document.getElementById('btnGenerarPDF');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover active de todas las tarjetas
            cards.forEach(c => c.classList.remove('active'));
            
            // Agregar active a la tarjeta clickeada
            this.classList.add('active');
            
            // Actualizar el valor del input oculto
            const tipo = this.dataset.tipo;
            tipoReporteInput.value = tipo;
            
            // Habilitar botón de PDF
            btnGenerarPDF.disabled = false;
            
            // Disparar evento change para que el módulo de reportes lo detecte
            tipoReporteInput.dispatchEvent(new Event('change'));
        });
    });
});

// ====== INICIALIZAR MÓDULO CUANDO EL DOM ESTÉ LISTO ======
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        console.log("DOM cargado, inicializando ReportesModule...");
        ReportesModule.init();
    });
} else {
    console.log("DOM ya estaba listo, inicializando ReportesModule...");
    ReportesModule.init();
}

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesModule;
}