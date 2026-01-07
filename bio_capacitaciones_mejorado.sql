-- phpMyAdmin SQL Dump
-- Base de datos mejorada: `bio_capacitaciones`
-- Reestructurada: 14-11-2025

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
(2, 'VENTILACION');

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
(8, 2, '8422500', 'Ventilador mecanico volumetrico - Modelo: Evita V800');

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
(1, 'Administrador', 'admin@bio.com', '$2b$10$QMEJCs10rkYC2fFVrUDUXOpiCAyW5C2L8iKEHJko9smSAMsqfNHqS', 'admin', NULL, '2025-11-13 23:50:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `capacitaciones`
-- Tabla principal que representa un evento de capacitación
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `capacitacion_productos`
-- Tabla intermedia para los productos incluidos en cada capacitación
--

CREATE TABLE `capacitacion_productos` (
  `id` int(11) NOT NULL,
  `capacitacion_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `numero_serie` varchar(100) DEFAULT NULL,
  `version_software` varchar(100) DEFAULT NULL,
  `internal_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
-- Registra los asistentes a cada capacitación
--

CREATE TABLE `asistencia` (
  `id` int(11) NOT NULL,
  `capacitacion_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo_asistente` enum('usuario','tecnico') NOT NULL DEFAULT 'usuario',
  `firma` varchar(255) DEFAULT NULL,
  `fecha` date NOT NULL DEFAULT curdate(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `secciones`
--
ALTER TABLE `secciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `referencia` (`referencia`),
  ADD KEY `seccion_id` (`seccion_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

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
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `capacitacion_id` (`capacitacion_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

ALTER TABLE `secciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `capacitaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `capacitacion_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`);

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
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`capacitacion_id`) REFERENCES `capacitaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asistencia_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
