/*
SQLyog Ultimate v10.42 
MySQL - 5.5.5-10.4.8-MariaDB : Database - web_login
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`web_login` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `web_login`;

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombreCompleto` varchar(25) NOT NULL,
  `email` varchar(40) NOT NULL,
  `contraseña` varchar(64) NOT NULL,
  `token` varchar(200) DEFAULT NULL,
  `confirmado` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 0,
  `rol` varchar(20) NOT NULL DEFAULT 'user',
  `fechaCreado` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4;

/*Table structure for table `users_logs` */

DROP TABLE IF EXISTS `users_logs`;

CREATE TABLE `users_logs` (
  `usuario_id` int(11) NOT NULL,
  `fecha_login` varchar(50) NOT NULL,
  `hora_login` varchar(50) NOT NULL,
  PRIMARY KEY (`usuario_id`,`fecha_login`,`hora_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
