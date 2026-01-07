-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-01-2026 a las 20:55:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bio_capacitaciones`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id` int(11) NOT NULL,
  `capacitacion_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo_asistente` enum('tecnico','profesional') DEFAULT 'profesional',
  `firma` varchar(255) DEFAULT NULL,
  `fecha` date NOT NULL DEFAULT curdate(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencia`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `capacitaciones`
--

CREATE TABLE `capacitaciones` (
  `id` int(11) NOT NULL,
  `cliente` varchar(200) NOT NULL,
  `direccion` varchar(300) DEFAULT NULL,
  `cargo_departamento` varchar(200) DEFAULT NULL,
  `fecha_instalacion` date DEFAULT NULL,
  `responsable_centro_salud` varchar(200) DEFAULT NULL,
  `firma_responsable_centro` varchar(255) DEFAULT NULL,
  `usuario_creador_id` int(11) NOT NULL COMMENT 'Usuario Drager responsable (logueado)',
  `tipo_plantilla` varchar(100) DEFAULT 'plantilla_capacitacion.docx',
  `fecha_creado` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `capacitaciones`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `capacitacion_productos`
--

CREATE TABLE `capacitacion_productos` (
  `id` int(11) NOT NULL,
  `capacitacion_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `numero_serie` varchar(100) DEFAULT NULL,
  `version_software` varchar(100) DEFAULT NULL,
  `internal_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `capacitacion_productos`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `referencia` varchar(50) NOT NULL,
  `nombre` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secciones`
--

CREATE TABLE `secciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `secciones`
--

INSERT INTO `secciones` (`id`, `nombre`) VALUES
(1, 'ANESTESIA'),
(4, 'MONITOREO'),
(2, 'VENTILACION');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') DEFAULT 'usuario',
  `firma` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `firma`, `created_at`) VALUES
(1, 'Administrador', 'admin@bio.com', '$2b$10$QMEJCs10rkYC2fFVrUDUXOpiCAyW5C2L8iKEHJko9smSAMsqfNHqS', 'admin', 'uploads/firmas/firma_1764201377456.jpeg', '2025-11-13 23:50:52');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `capacitacion_id` (`capacitacion_id`);

--
-- Indices de la tabla `capacitaciones`
--
ALTER TABLE `capacitaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_creador_id` (`usuario_creador_id`);

--
-- Indices de la tabla `capacitacion_productos`
--
ALTER TABLE `capacitacion_productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `capacitacion_id` (`capacitacion_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `referencia` (`referencia`),
  ADD KEY `seccion_id` (`seccion_id`);

--
-- Indices de la tabla `secciones`
--
ALTER TABLE `secciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `capacitaciones`
--
ALTER TABLE `capacitaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `capacitacion_productos`
--
ALTER TABLE `capacitacion_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `secciones`
--
ALTER TABLE `secciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`capacitacion_id`) REFERENCES `capacitaciones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `capacitaciones`
--
ALTER TABLE `capacitaciones`
  ADD CONSTRAINT `capacitaciones_ibfk_1` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `capacitacion_productos`
--
ALTER TABLE `capacitacion_productos`
  ADD CONSTRAINT `capacitacion_productos_ibfk_1` FOREIGN KEY (`capacitacion_id`) REFERENCES `capacitaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `capacitacion_productos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
