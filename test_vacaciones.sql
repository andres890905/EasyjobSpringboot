-- Script de prueba para insertar vacaciones de ejemplo
-- Ejecutar en MariaDB/MySQL después de crear la base de datos

INSERT INTO vacaciones (idusuarios, fecha_inicio, fecha_fin, estado, fecha_solicitud, comentarios) 
VALUES 
(1, '2025-12-10', '2025-12-15', 'Pendiente', NOW(), 'Vacaciones para descansar'),
(2, '2025-12-20', '2025-12-31', 'Pendiente', NOW(), 'Fin de año'),
(3, '2026-01-05', '2026-01-10', 'Pendiente', NOW(), 'Permiso después de año nuevo'),
(4, '2026-02-14', '2026-02-21', 'Aprobado', NOW(), 'Vacaciones aprobadas'),
(5, '2026-03-01', '2026-03-07', 'Rechazado', NOW(), 'Conflicto de horarios');
