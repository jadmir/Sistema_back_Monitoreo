-- Agregar campo tipo_plantilla a la tabla capacitaciones
ALTER TABLE capacitaciones 
ADD COLUMN tipo_plantilla VARCHAR(100) DEFAULT 'plantilla_capacitacion.docx' 
AFTER usuario_creador_id;
