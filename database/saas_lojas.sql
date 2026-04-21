-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 21/04/2026 às 18:15
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `saas_lojas`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `abandoned_carts`
--

CREATE TABLE `abandoned_carts` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_email` varchar(100) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `cart_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`cart_data`)),
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('open','abandoned','recovered') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `abandoned_carts`
--

INSERT INTO `abandoned_carts` (`id`, `store_id`, `customer_name`, `customer_email`, `customer_phone`, `cart_data`, `total_amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', '[{\"id\":5,\"quantity\":1,\"price\":79.77}]', 79.77, 'recovered', '2026-04-18 21:02:44', '2026-04-18 21:03:09'),
(2, 4, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', '[{\"id\":5,\"quantity\":1,\"price\":79.77}]', 79.77, 'open', '2026-04-18 21:41:18', '2026-04-18 21:41:18'),
(3, 6, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', '[{\"id\":7,\"quantity\":1,\"price\":50}]', 50.00, 'recovered', '2026-04-19 15:26:56', '2026-04-19 15:27:13'),
(4, 6, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', '[{\"id\":8,\"quantity\":1,\"price\":29.91}]', 29.91, 'recovered', '2026-04-19 15:28:23', '2026-04-19 15:28:38');

-- --------------------------------------------------------

--
-- Estrutura para tabela `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categories`
--

INSERT INTO `categories` (`id`, `store_id`, `name`) VALUES
(1, 3, 'Calçados'),
(2, 3, 'Camisas'),
(3, 3, 'Calças'),
(4, 4, 'Camisas'),
(5, 4, 'Acessórios'),
(6, 4, 'Calças'),
(7, 6, 'Camisa'),
(8, 6, 'Calças'),
(9, 6, 'Acessórios');

-- --------------------------------------------------------

--
-- Estrutura para tabela `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `customers`
--

INSERT INTO `customers` (`id`, `store_id`, `name`, `email`, `phone`, `address`, `password`, `created_at`, `otp_code`, `otp_expires_at`) VALUES
(1, 3, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', '\"Rua Sena\\n1069\"', NULL, '2026-04-16 02:41:04', NULL, NULL),
(2, 3, 'FELIPE SANTOS DE JESUS', 'felipe@felipe', '21997', '\"Rua Sena\\n1069\"', NULL, '2026-04-16 03:25:35', NULL, NULL),
(3, 4, 'FELIPE SANTOS DE JESUS', 'gabriela@gabriela', '27997303135', '\"Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127045\"', NULL, '2026-04-16 05:16:35', NULL, NULL),
(4, 4, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127045', NULL, '2026-04-18 21:03:09', NULL, NULL),
(5, 6, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069', NULL, '2026-04-19 15:27:13', NULL, NULL),
(6, 6, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069', NULL, '2026-04-19 15:28:38', NULL, NULL),
(7, 3, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127048', NULL, '2026-04-19 15:50:36', NULL, NULL),
(8, 3, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Rua Sena, 1069 - João Goulart, Vila Velha - ES, CEP: 29127048', NULL, '2026-04-19 15:50:52', NULL, NULL),
(9, 3, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127045', NULL, '2026-04-19 16:39:17', NULL, NULL),
(10, 3, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127045', NULL, '2026-04-19 16:40:28', NULL, NULL),
(11, 6, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127045', NULL, '2026-04-21 12:12:49', NULL, NULL),
(12, 6, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127045', NULL, '2026-04-21 12:16:18', NULL, NULL),
(13, 3, 'FELIPE SANTOS DE JESUS', 'felipejsf7@gmail.com', '27997303135', 'Avenida Muriaé, 1069 - João Goulart, Vila Velha - ES, CEP: 29127045', NULL, '2026-04-21 13:24:12', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `shipping_method` varchar(50) DEFAULT NULL,
  `tracking_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `orders`
--

INSERT INTO `orders` (`id`, `store_id`, `customer_id`, `total_amount`, `status`, `shipping_method`, `tracking_code`, `created_at`) VALUES
(1, 3, 1, 31.80, 'pending', 'motoboy', NULL, '2026-04-16 02:41:04'),
(2, 3, 2, 85.90, 'pending', 'correios', NULL, '2026-04-16 03:25:35'),
(3, 3, 2, 155.90, 'pending', 'motoboy', NULL, '2026-04-16 03:31:58'),
(4, 3, 2, 279.70, 'pending', 'correios', NULL, '2026-04-16 04:30:40'),
(5, 4, 3, 79.77, 'pending', 'correios', NULL, '2026-04-16 05:16:35'),
(6, 4, 4, 79.77, 'pending', 'correios', NULL, '2026-04-18 21:03:09'),
(7, 6, 5, 50.00, 'delivered', 'correios', 'https://rastreio.fotus.com.br/?tpDoc=4&cod=191420', '2026-04-19 15:27:13'),
(8, 6, 6, 29.91, 'pending', 'correios', NULL, '2026-04-19 15:28:38'),
(9, 3, 7, 69.90, 'pending', 'correios', NULL, '2026-04-19 15:50:36'),
(10, 3, 8, 69.90, 'pending', 'correios', NULL, '2026-04-19 15:50:52'),
(11, 3, 9, 69.90, 'pending', 'correios', NULL, '2026-04-19 16:39:17'),
(12, 3, 10, 69.90, 'pending', 'correios', NULL, '2026-04-19 16:40:28'),
(13, 6, 11, 50.00, 'paid', 'correios', 'https://rastreio.fotus.com.br/?tpDoc=4&cod=191420', '2026-04-21 12:12:49'),
(14, 6, 12, 50.00, 'pending', 'correios', '12345612', '2026-04-21 12:16:18'),
(15, 3, 13, 15.90, 'pending', 'correios', NULL, '2026-04-21 13:24:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 2, 15.90),
(2, 2, 1, 1, 15.90),
(3, 2, 2, 1, 70.00),
(4, 3, 1, 1, 15.90),
(5, 3, 2, 2, 70.00),
(6, 4, 4, 2, 69.90),
(7, 4, 4, 1, 69.90),
(8, 4, 3, 1, 70.00),
(9, 5, 5, 1, 79.77),
(10, 6, 5, 1, 79.77),
(11, 7, 7, 1, 50.00),
(12, 8, 8, 1, 29.91),
(13, 9, 4, 1, 69.90),
(14, 10, 4, 1, 69.90),
(15, 11, 4, 1, 69.90),
(16, 12, 4, 1, 69.90),
(17, 13, 7, 1, 50.00),
(18, 14, 7, 1, 50.00),
(19, 15, 1, 1, 15.90);

-- --------------------------------------------------------

--
-- Estrutura para tabela `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `promotional_price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_featured` tinyint(1) DEFAULT 0,
  `variations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variations`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `products`
--

INSERT INTO `products` (`id`, `store_id`, `category_id`, `name`, `description`, `price`, `promotional_price`, `image_url`, `is_active`, `created_at`, `is_featured`, `variations`, `images`) VALUES
(1, 3, 3, 'ET 11', '', 29.82, 15.90, 'http://localhost:3000/files/1b6381bd7524-e00f9841618bf906833512fdd977be65.jpg', 1, '2026-04-14 00:28:56', 0, NULL, NULL),
(2, 3, 2, 'top', 'okokok', 70.00, 70.00, 'http://localhost:3000/files/0995f8d798b8-WhatsApp Image 2026-02-12 at 21.49.58.jpeg', 1, '2026-04-14 00:29:48', 0, NULL, NULL),
(3, 3, 1, 'Camisa AZUL', 'Legal demais', 100.00, 70.00, 'http://localhost:3000/files/36a725d56af9-nveoy.jpg', 1, '2026-04-14 00:37:44', 0, NULL, NULL),
(4, 3, NULL, 'Opa Legal', '', 89.90, 69.90, NULL, 1, '2026-04-16 04:02:25', 0, '{\"colors\":[\"Preto\",\"Branco\",\"Laranja\"],\"sizes\":[\"P\",\"M\",\"G\",\"GG\"]}', '[\"http://localhost:3000/files/94b79a46b230-WhatsApp Image 2026-02-17 at 23.08.23.jpeg\",\"http://localhost:3000/files/579b424b7a16-WhatsApp Image 2026-02-17 at 21.22.24.jpeg\",\"http://localhost:3000/files/5b9d727affd9-WhatsApp Image 2026-02-12 at 21.49.58.jpeg\"]'),
(5, 4, NULL, 'Teste Corte de Cabelo', 'O que são páginas de aterragem e como funcionam? Porque são tão importantes no actual ecossistema de web marketing. Dentro deste guia fornecerá toda a informação básica relacionada com a criação e optimização das páginas de aterragem. Em particular, estudaremos o princípio de funcionamento na base desta ferramenta de web marketing. Mas também aprofundará a redacção dos textos e as melhores estratégias para aumentar a eficácia operacional destes instrumentos.\n\nEm resumo, este é o primeiro manual destinado aos utilizadores que não têm conhecimentos sobre o assunto e que querem compreender de uma forma simples e eficaz como funcionam as páginas de vendas na web.', 100.00, 79.77, NULL, 1, '2026-04-16 05:15:22', 0, '{\"colors\":[\"Preto\",\"Branco\",\"Cinza\"],\"sizes\":[\"P\",\"M\",\"G\",\"GG\"]}', '[\"http://localhost:3000/files/8e6f4f436fe1-nveoy.jpg\",\"http://localhost:3000/files/59b4df661788-e00f9841618bf906833512fdd977be65.jpg\"]'),
(6, 6, 7, 'Produto Teste 1', 'Esses três erros são clássicos do desenvolvimento Full-Stack! Eles marcam exatamente a fronteira onde o React (Frontend) tenta conversar com o Node.js (Backend) e esbarra em algum fio desconectado.\n\nAnalisei o seu Products.jsx e encontrei exatamente onde o JavaScript está \"engasgando\" com a resposta dupla, além de identificar o que falta nas rotas.', 100.00, 70.00, NULL, 1, '2026-04-18 22:34:07', 0, '{\"colors\":[\"Preto\",\"Roxo\",\"Branco\"],\"sizes\":[\"P\",\"M\",\"G\",\"GG\",\"XL\"]}', '[\"http://localhost:3000/files/17ebcc0738a0-nveoy.jpg\",\"http://localhost:3000/files/dbffa3a12698-e00f9841618bf906833512fdd977be65.jpg\"]'),
(7, 6, 8, 'UnderCut', 'Coisa boa visse', 80.00, 50.00, NULL, 1, '2026-04-19 09:47:52', 0, '{\"colors\":[\"Preto\",\"Branco\"],\"sizes\":[\"P\",\"M\",\"G\"]}', '[\"http://localhost:3000/files/205e1403d8f2-UnderCut.jpg\"]'),
(8, 6, 9, 'Fade', 'Coisa boa viu!?', 80.00, 29.91, NULL, 1, '2026-04-19 09:48:41', 0, '{\"colors\":[\"Branco\",\"Azul\"],\"sizes\":[\"P\",\"M\",\"G\"]}', '[\"http://localhost:3000/files/9797448e6db9-Degrade(Fade).jpg\"]');

-- --------------------------------------------------------

--
-- Estrutura para tabela `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `theme_color` varchar(10) DEFAULT '#000000',
  `logo_url` varchar(255) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `subscription_status` varchar(20) DEFAULT 'active',
  `expires_at` datetime DEFAULT NULL,
  `role` varchar(20) DEFAULT 'tenant'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `stores`
--

INSERT INTO `stores` (`id`, `slug`, `name`, `email`, `password`, `theme_color`, `logo_url`, `banner_url`, `created_at`, `subscription_status`, `expires_at`, `role`) VALUES
(1, 'raffros', 'Loja da Raffros', '', '', '#fc52ff', '', NULL, '2026-04-13 23:02:58', 'active', NULL, 'tenant'),
(3, 'felipe', 'Felipe', 'felipejsf7@gmail.com', '$2b$10$tDdaJMyUnSiOYipKWmM8pu0duv1hSvc.NVBjHvFclklTqj2zf4tau', '#000000', '', NULL, '2026-04-13 23:27:55', 'active', NULL, 'admin'),
(4, 'gabriela', 'Gabriela', 'gabriela@gabriela', '$2b$10$eHFXDcibilJMeaJZmACIjO3gM6OrTRAIupiZFqlVq3iYNwDydjccm', '#000000', NULL, NULL, '2026-04-16 05:13:27', 'active', NULL, 'tenant'),
(6, 'rafrros2', 'Rafrros2', 'felipe@felipe', '', '#db8f48', 'http://localhost:3000/files/e17cdc1c71ed-Captura de tela 2026-04-21 130041.png', 'http://localhost:3000/files/a6910bbbb936-Captura de tela 2026-04-21 130041.png', '2026-04-18 22:19:01', 'trial', NULL, 'tenant'),
(12, 'gabriela2', 'Gabriela2', 'felipejsf@gmail.com', '', '#000000', NULL, NULL, '2026-04-21 12:34:56', 'trial', NULL, 'tenant'),
(13, 'feli', 'feli', 'feli@felipe.com.br', '', '#000000', NULL, NULL, '2026-04-21 12:48:39', 'trial', NULL, 'tenant'),
(14, 'danilo', 'Danilo', 'danilo@danilo', '', '#000000', NULL, NULL, '2026-04-21 12:52:44', 'trial', NULL, 'tenant');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `store_id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 6, 'Felipe', 'felipe@felipe', '$2b$10$rU7Z9NcGuTxTvyEiilCjoetjwqrOWWLXyiRajx7E2.P1JnNZRVTxO', 'admin', '2026-04-18 22:19:01', '2026-04-21 14:05:22'),
(2, 12, 'Gabriela', 'felipejsf@gmail.com', '$2b$10$BAcpYmOSV8ZUWeVQ.0FCKuPlRjBeQC5J8DRllAYt4HPMvV7Ai09Pe', 'admin', '2026-04-21 12:34:56', '2026-04-21 12:34:56'),
(3, 13, 'Felipe', 'feli@felipe.com.br', '$2b$10$VTVsj4muU7EWsgfTF8Qroe4AdDJxP4j3JACVhAYIOWSyEBZfTEgCG', 'admin', '2026-04-21 12:48:39', '2026-04-21 12:48:39'),
(4, 14, 'Danilo', 'danilo@danilo', '$2b$10$TeZCvZ2D8W2p7qKpNyP0h.TW6YCUw8u4obU.RQhtAl0F8Nj/.5iSm', 'admin', '2026-04-21 12:52:44', '2026-04-21 12:52:44');

-- --------------------------------------------------------

--
-- Estrutura para tabela `visits`
--

CREATE TABLE `visits` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `visits`
--

INSERT INTO `visits` (`id`, `store_id`, `created_at`) VALUES
(1, 3, '2026-04-14 01:28:18'),
(2, 3, '2026-04-14 01:28:18'),
(3, 3, '2026-04-14 01:29:53'),
(4, 3, '2026-04-14 01:29:53'),
(5, 3, '2026-04-14 01:53:20'),
(6, 3, '2026-04-14 01:53:20'),
(7, 3, '2026-04-16 02:07:59'),
(8, 3, '2026-04-16 02:07:59'),
(9, 3, '2026-04-16 02:08:26'),
(10, 3, '2026-04-16 02:08:26'),
(11, 1, '2026-04-16 02:09:41'),
(12, 1, '2026-04-16 02:09:41'),
(13, 3, '2026-04-16 02:11:14'),
(14, 3, '2026-04-16 02:11:14'),
(15, 3, '2026-04-16 02:11:58'),
(16, 3, '2026-04-16 02:11:59'),
(17, 3, '2026-04-16 02:37:34'),
(18, 3, '2026-04-16 02:37:34'),
(19, 3, '2026-04-16 02:39:26'),
(20, 3, '2026-04-16 02:39:42'),
(21, 3, '2026-04-16 02:39:42'),
(22, 3, '2026-04-16 02:44:54'),
(23, 3, '2026-04-16 02:45:22'),
(24, 3, '2026-04-16 02:45:22'),
(25, 3, '2026-04-16 02:58:11'),
(26, 3, '2026-04-16 02:58:12'),
(27, 3, '2026-04-16 03:10:29'),
(28, 3, '2026-04-16 03:10:29'),
(29, 3, '2026-04-16 03:12:58'),
(30, 3, '2026-04-16 03:12:58'),
(31, 3, '2026-04-16 03:13:01'),
(32, 3, '2026-04-16 03:13:01'),
(33, 3, '2026-04-16 03:14:47'),
(34, 3, '2026-04-16 03:14:47'),
(35, 3, '2026-04-16 03:20:46'),
(36, 3, '2026-04-16 03:20:46'),
(37, 3, '2026-04-16 03:21:54'),
(38, 3, '2026-04-16 03:21:58'),
(39, 3, '2026-04-16 03:21:58'),
(40, 3, '2026-04-16 03:28:06'),
(41, 3, '2026-04-16 03:45:30'),
(42, 3, '2026-04-16 03:45:44'),
(43, 3, '2026-04-16 03:45:44'),
(44, 3, '2026-04-16 03:49:11'),
(45, 3, '2026-04-16 03:49:15'),
(46, 3, '2026-04-16 03:49:15'),
(47, 3, '2026-04-16 03:55:53'),
(48, 1, '2026-04-16 03:58:54'),
(49, 1, '2026-04-16 03:58:54'),
(50, 3, '2026-04-16 03:58:57'),
(51, 3, '2026-04-16 03:58:57'),
(52, 3, '2026-04-16 03:59:28'),
(53, 3, '2026-04-16 03:59:28'),
(54, 1, '2026-04-16 03:59:42'),
(55, 1, '2026-04-16 03:59:42'),
(56, 3, '2026-04-16 03:59:47'),
(57, 3, '2026-04-16 03:59:47'),
(58, 3, '2026-04-16 03:59:50'),
(59, 3, '2026-04-16 03:59:50'),
(60, 3, '2026-04-16 04:02:42'),
(61, 3, '2026-04-16 04:02:42'),
(62, 3, '2026-04-16 04:03:36'),
(63, 3, '2026-04-16 04:03:36'),
(64, 3, '2026-04-16 04:04:47'),
(65, 3, '2026-04-16 04:04:47'),
(66, 3, '2026-04-16 04:08:01'),
(67, 4, '2026-04-16 05:13:48'),
(68, 4, '2026-04-16 05:13:48'),
(69, 4, '2026-04-16 05:15:31'),
(70, 4, '2026-04-16 05:15:31'),
(71, 4, '2026-04-17 02:42:02'),
(72, 4, '2026-04-17 02:42:02'),
(73, 4, '2026-04-17 02:43:01'),
(74, 4, '2026-04-17 02:43:01'),
(75, 4, '2026-04-17 02:44:30'),
(76, 4, '2026-04-17 02:44:30'),
(77, 4, '2026-04-18 21:01:37'),
(78, 4, '2026-04-18 21:01:37'),
(79, 4, '2026-04-18 21:40:48'),
(80, 4, '2026-04-18 21:40:48'),
(81, 4, '2026-04-18 21:51:15'),
(82, 4, '2026-04-18 21:51:15'),
(83, 4, '2026-04-18 22:58:11'),
(84, 4, '2026-04-18 22:58:11'),
(85, 4, '2026-04-18 22:58:14'),
(86, 4, '2026-04-18 22:58:14'),
(87, 1, '2026-04-18 22:58:23'),
(88, 1, '2026-04-18 22:58:23'),
(89, 3, '2026-04-18 22:58:29'),
(90, 3, '2026-04-18 22:58:29'),
(91, 3, '2026-04-18 22:58:39'),
(92, 3, '2026-04-18 22:58:39'),
(93, 4, '2026-04-18 22:59:13'),
(94, 4, '2026-04-18 22:59:13'),
(95, 1, '2026-04-18 23:01:21'),
(96, 1, '2026-04-18 23:01:21'),
(97, 4, '2026-04-19 09:30:56'),
(98, 4, '2026-04-19 09:30:56');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `abandoned_carts`
--
ALTER TABLE `abandoned_carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`);

--
-- Índices de tabela `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`);

--
-- Índices de tabela `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`);

--
-- Índices de tabela `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Índices de tabela `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Índices de tabela `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Índices de tabela `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `store_id` (`store_id`);

--
-- Índices de tabela `visits`
--
ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `abandoned_carts`
--
ALTER TABLE `abandoned_carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `visits`
--
ALTER TABLE `visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `abandoned_carts`
--
ALTER TABLE `abandoned_carts`
  ADD CONSTRAINT `abandoned_carts_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `visits`
--
ALTER TABLE `visits`
  ADD CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
