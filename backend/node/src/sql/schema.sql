-- Creazione della tabella 'users'
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `tokens` FLOAT NOT NULL,
    `isadmin` BOOLEAN NOT NULL
) ENGINE=InnoDB;

-- Creazione della tabella 'graphs'
CREATE TABLE IF NOT EXISTS `graphs` (
    `graph_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Creazione della tabella 'edges'
CREATE TABLE IF NOT EXISTS `edges` (
    `edge_id` INT AUTO_INCREMENT PRIMARY KEY,
    `graph_id` INT NOT NULL,
    `start_node` VARCHAR(255) NOT NULL,
    `end_node` VARCHAR(255) NOT NULL,
    `weight` FLOAT NOT NULL,
    FOREIGN KEY (`graph_id`) REFERENCES `graphs` (`graph_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Creazione della tabella 'updates'
CREATE TABLE IF NOT EXISTS `updates` (
    `update_id` INT AUTO_INCREMENT PRIMARY KEY,
    `edge_id` INT NOT NULL,
    `new_weight` FLOAT NOT NULL,
    `approved` BOOLEAN,
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`edge_id`) REFERENCES `edges` (`edge_id`) ON DELETE CASCADE
) ENGINE=InnoDB;
