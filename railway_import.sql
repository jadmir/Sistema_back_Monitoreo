-- Base de datos limpia para Railway
-- bio_capacitaciones

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

-- Crear todas las tablas primero SIN foreign keys

-- Tabla secciones
CREATE TABLE IF NOT EXISTS `secciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seccion_id` int(11) NOT NULL,
  `referencia` varchar(50) NOT NULL,
  `nombre` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `referencia` (`referencia`),
  KEY `seccion_id` (`seccion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') DEFAULT 'usuario',
  `firma` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla capacitaciones
CREATE TABLE IF NOT EXISTS `capacitaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente` varchar(200) NOT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `cargo_departamento` varchar(200) DEFAULT NULL,
  `fecha_instalacion` date DEFAULT NULL,
  `responsable_centro_salud` varchar(200) DEFAULT NULL,
  `firma_responsable_centro` varchar(255) DEFAULT NULL,
  `usuario_creador_id` int(11) NOT NULL COMMENT 'Usuario Drager responsable (logueado)',
  `tipo_plantilla` varchar(100) DEFAULT 'plantilla_capacitacion.docx',
  `fecha_creado` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_creador_id` (`usuario_creador_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla capacitacion_productos
CREATE TABLE IF NOT EXISTS `capacitacion_productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `capacitacion_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `numero_serie` varchar(100) DEFAULT NULL,
  `version_software` varchar(100) DEFAULT NULL,
  `internal_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `capacitacion_id` (`capacitacion_id`),
  KEY `producto_id` (`producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla asistencia
CREATE TABLE IF NOT EXISTS `asistencia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `capacitacion_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo_asistente` enum('tecnico','profesional') DEFAULT 'profesional',
  `firma` varchar(255) DEFAULT NULL,
  `fecha` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `capacitacion_id` (`capacitacion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ahora insertar los datos

INSERT INTO `secciones` (`id`, `nombre`) VALUES
(1, 'ANESTESIA'),
(2, 'VENTILACION'),
(4, 'MONITOREO');

INSERT INTO `productos` (`id`, `seccion_id`, `referencia`, `nombre`) VALUES
(1, 1, 'MK06000', 'Maquina de anestesia - Modelo Perseus A500'),
(2, 1, '8621600', 'Maquina de anestesia - Modelo Atlan A350XL'),
(3, 1, '8621500', 'Maquina de anestesia - Modelo Atlan A350'),
(4, 1, '8621100', 'Maquina de anestesia - Modelo Atlan A100'),
(5, 2, '5704811', 'Ventilador de transporte - Modelo: Oxylog 3000 plus'),
(6, 2, '5790200', 'Ventilador de transporte - Modelo: Oxylog VEL'),
(7, 2, '8422300', 'Ventilador mecanico volumetrico - Modelo: Evita V600'),
(8, 2, '8422500', 'Ventilador mecanico volumetrico - Modelo: Evita V800'),
(10, 4, 'MS34011', 'Vista 120 Nellcor modelo C V3');

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `firma`, `created_at`) VALUES
(1, 'Administrador', 'admin@bio.com', '$2b$10$QMEJCs10rkYC2fFVrUDUXOpiCAyW5C2L8iKEHJko9smSAMsqfNHqS', 'admin', 'uploads/firmas/firma_1764201377456.jpeg', '2025-11-13 23:50:52');

INSERT INTO `capacitaciones` (`id`, `cliente`, `direccion`, `cargo_departamento`, `fecha_instalacion`, `responsable_centro_salud`, `firma_responsable_centro`, `usuario_creador_id`, `tipo_plantilla`, `fecha_creado`, `updated_at`) VALUES
(1, 'Hospital General', 'Calle Principal 123', 'Departamento de Anestesiología', '2025-11-17', 'Dr. Juan Pérez', NULL, 1, 'plantilla_capacitacion.docx', '2025-11-17 21:15:04', '2025-11-17 21:15:04'),
(2, 'prueb', 'prueba', 'no hay cargo', '2025-11-25', 'saluf', NULL, 1, 'plantilla_capacitacion.docx', '2025-11-25 02:22:48', '2025-11-25 02:22:48'),
(3, 'prueb', 'prueba', 'no hay cargo', '2025-11-25', 'saluf', NULL, 1, 'plantilla_capacitacion.docx', '2025-11-25 02:23:05', '2025-11-25 02:23:05'),
(4, 'utp', 'hauncao', 'hauncayo', '2025-11-25', 'carlos', NULL, 1, 'plantilla_capacitacion.docx', '2025-11-25 02:42:46', '2025-11-25 02:42:46'),
(5, 'dfghjk', 'dfghj', 'sdfghjk', '2025-11-25', 'sdfghjkl', NULL, 1, 'THERMOREGULACION.docx', '2025-11-25 02:45:00', '2025-11-25 02:45:00'),
(6, 'prueba final', 'prueba final', 'departameteo', '2025-11-26', 'mi amigo', NULL, 1, 'MONITOREO.docx', '2025-11-26 23:16:05', '2025-11-26 23:16:05'),
(7, 'cliente importante', 'cerro de pasco ', 'lima', '2025-11-26', 'doctor manuel', NULL, 1, 'plantilla_capacitacion.docx', '2025-11-26 23:22:17', '2025-11-26 23:22:17'),
(8, 'universidad tecnologica del perucas', 'huancayo', 'universidad', '2025-11-26', 'andres', NULL, 1, 'MONITOREO.docx', '2025-11-26 23:29:38', '2025-11-26 23:29:38'),
(9, 'CLIENTE NUEVO', 'NUEVA DIRECCION', 'NUEVO CARGO', '2025-11-26', 'NUEVO RESPONSABLE', NULL, 1, 'MONITOREO.docx', '2025-11-26 23:44:52', '2025-11-26 23:44:52'),
(10, 'sana', 'san isidro', 'centro quiru', '2025-11-29', 'jadmir vicente', NULL, 1, 'THERMOREGULACION.docx', '2025-11-29 01:07:40', '2025-11-29 01:07:40');

INSERT INTO `capacitacion_productos` (`id`, `capacitacion_id`, `producto_id`, `numero_serie`, `version_software`, `internal_id`) VALUES
(1, 1, 1, 'SN123456', 'v2.0', 'ID001'),
(4, 4, 1, 'dale', 'saagad', 'dadle'),
(5, 5, 1, 'cfvgbhnjmk', 'cfvghbnjmk', 'fvyghnj'),
(6, 6, 2, 'extensiones', 'asdfa3342', 'asfa2341'),
(7, 7, 2, 'sin nuero de serie', 'no tiene version', '20015'),
(8, 8, 3, 'asdgasd8gasdg0', 'sdfasd9f0a9', 'sdf9a0sd9f0'),
(9, 8, 4, '2222eeee', '3333gggg', 'asdga6'),
(10, 9, 2, 'NUEVA SERIE', 'NUEVO SOFT', 'NUENONO'),
(11, 10, 1, 'st244', '2.1', '13245'),
(12, 10, 2, 'st444', '2.1', '13246');

INSERT INTO `asistencia` (`id`, `capacitacion_id`, `nombre`, `tipo_asistente`, `firma`, `fecha`, `created_at`) VALUES
(1, 1, 'María García', 'tecnico', NULL, '2025-11-17', '2025-11-17 21:15:05'),
(2, 4, 'asdasfsdf', 'tecnico', NULL, '2025-11-24', '2025-11-25 02:42:46'),
(3, 5, 'srftvyhujik,l', 'tecnico', NULL, '2025-11-24', '2025-11-25 02:45:00'),
(4, 6, 'piero manuel', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:16:06'),
(5, 7, 'juan', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:22:18'),
(6, 7, 'pedro', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:22:18'),
(7, 8, 'manuel', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:29:39'),
(8, 8, 'pedruan muaneao', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:29:39'),
(9, 8, 'asdfasdfasdf', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:29:39'),
(10, 9, 'NUEVO ASISTENTE', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:44:53'),
(11, 9, 'SEGUNDO ASISTENTE', 'tecnico', NULL, '2025-11-26', '2025-11-26 23:44:53'),
(12, 10, 'jhonatan atencio', 'tecnico', NULL, '2025-11-28', '2025-11-29 01:07:40'),
(13, 10, 'jhajan sifuentes', 'tecnico', NULL, '2025-11-28', '2025-11-29 01:07:40'),
(14, 10, 'no quiero mas', 'tecnico', NULL, '2025-11-28', '2025-11-29 01:07:40');

-- Ahora agregar las foreign keys
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`);

ALTER TABLE `capacitaciones`
  ADD CONSTRAINT `capacitaciones_ibfk_1` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`);

ALTER TABLE `capacitacion_productos`
  ADD CONSTRAINT `capacitacion_productos_ibfk_1` FOREIGN KEY (`capacitacion_id`) REFERENCES `capacitaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `capacitacion_productos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`capacitacion_id`) REFERENCES `capacitaciones` (`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
