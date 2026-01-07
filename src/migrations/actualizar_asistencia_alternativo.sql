-- ============================================================
-- MIGRACIÓN COMPLETA: Actualizar tabla asistencia
-- Fecha: 26 de noviembre de 2025
-- ============================================================
-- INSTRUCCIONES:
-- 1. Hacer backup de la base de datos antes de ejecutar
-- 2. Ejecutar TODO el script de una vez
-- 3. Verificar los resultados al final
-- ============================================================

USE bio_capacitaciones;

-- ============================================================
-- PASO 1: Actualizar los valores de tipo_asistente
-- ============================================================
-- Cambiar 'usuario' por 'profesional' en todos los registros existentes
UPDATE asistencia 
SET tipo_asistente = 'profesional' 
WHERE tipo_asistente = 'usuario';

SELECT 'Paso 1 completado: Valores actualizados' AS Status;

-- ============================================================
-- PASO 2: Eliminar la clave foránea
-- ============================================================
-- Buscar el nombre de la constraint de clave foránea
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_NAME = 'asistencia' 
      AND COLUMN_NAME = 'usuario_id' 
      AND TABLE_SCHEMA = 'bio_capacitaciones'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

-- Mostrar el nombre de la constraint encontrada
SELECT @constraint_name AS 'Constraint encontrada';

-- Eliminar la constraint de clave foránea
SET @drop_fk = CONCAT('ALTER TABLE asistencia DROP FOREIGN KEY ', @constraint_name);
PREPARE stmt FROM @drop_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Paso 2 completado: Clave foranea eliminada' AS Status;

-- ============================================================
-- PASO 3: Eliminar el índice de usuario_id
-- ============================================================
ALTER TABLE asistencia DROP INDEX usuario_id;

SELECT 'Paso 3 completado: Indice eliminado' AS Status;

-- ============================================================
-- PASO 4: Eliminar la columna usuario_id
-- ============================================================
ALTER TABLE asistencia DROP COLUMN usuario_id;

SELECT 'Paso 4 completado: Columna usuario_id eliminada' AS Status;

-- ============================================================
-- PASO 5: Actualizar la restricción ENUM de tipo_asistente
-- ============================================================
ALTER TABLE asistencia 
MODIFY COLUMN tipo_asistente ENUM('tecnico', 'profesional') DEFAULT 'profesional';

SELECT 'Paso 5 completado: ENUM actualizado a (tecnico, profesional)' AS Status;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT '================================================' AS '';
SELECT 'MIGRACION COMPLETADA CON EXITO' AS '';
SELECT '================================================' AS '';
SELECT 'Cambios aplicados:' AS '';
SELECT '1. tipo_asistente "usuario" cambiado a "profesional"' AS '';
SELECT '2. Columna usuario_id eliminada' AS '';
SELECT '3. ENUM actualizado: (tecnico, profesional)' AS '';
SELECT '================================================' AS '';

-- Mostrar la nueva estructura de la tabla
DESCRIBE asistencia;

-- Mostrar los primeros 10 registros
SELECT * FROM asistencia LIMIT 10;

-- Contar registros por tipo de asistente
SELECT 
    tipo_asistente,
    COUNT(*) as total
FROM asistencia
GROUP BY tipo_asistente;
