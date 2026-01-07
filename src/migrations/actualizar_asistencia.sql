-- Migración: Actualizar tabla asistencia
-- Fecha: 26 de noviembre de 2025
-- Descripción: 
--   1. Eliminar columna usuario_id
--   2. Cambiar valores de tipo_asistente de 'usuario' a 'profesional'

USE bio_capacitaciones;

-- Paso 1: Actualizar los valores de tipo_asistente
-- Cambiar 'usuario' por 'profesional'
UPDATE asistencia 
SET tipo_asistente = 'profesional' 
WHERE tipo_asistente = 'usuario';

-- Paso 2: Eliminar la restricción de clave foránea primero
-- Primero, verificar el nombre de la constraint
SELECT CONSTRAINT_NAME 
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'asistencia' 
  AND COLUMN_NAME = 'usuario_id' 
  AND TABLE_SCHEMA = 'bio_capacitaciones';

-- Eliminar la constraint de clave foránea (ajusta el nombre si es diferente)
ALTER TABLE asistencia 
DROP FOREIGN KEY asistencia_ibfk_2;

-- Ahora eliminar el índice
ALTER TABLE asistencia 
DROP INDEX usuario_id;

-- Finalmente eliminar la columna
ALTER TABLE asistencia 
DROP COLUMN usuario_id;

-- Paso 3: Verificar los cambios
SELECT * FROM asistencia LIMIT 10;

-- Paso 4: Actualizar la restricción ENUM si existe
ALTER TABLE asistencia 
MODIFY COLUMN tipo_asistente ENUM('tecnico', 'profesional') DEFAULT 'profesional';

-- Verificación final
DESCRIBE asistencia;
