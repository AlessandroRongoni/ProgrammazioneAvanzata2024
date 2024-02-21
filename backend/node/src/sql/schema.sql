CREATE DATABASE mydb;

\c mydb;

-- Creazione della tabella 'users'
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    tokens FLOAT NOT NULL,
    isadmin BOOLEAN NOT NULL
);

-- Creazione della tabella 'graphs'
CREATE TABLE IF NOT EXISTS graphs (
    graph_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost FLOAT NOT NULL,
    createdat DATE DEFAULT CURRENT_DATE,
    updatedat DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);


-- Creazione della tabella 'edges'
CREATE TABLE IF NOT EXISTS edges (
    edge_id SERIAL PRIMARY KEY,
    graph_id INT NOT NULL,
    start_node VARCHAR(255) NOT NULL,
    end_node VARCHAR(255) NOT NULL,
    weight FLOAT NOT NULL,
    FOREIGN KEY (graph_id) REFERENCES graphs (graph_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS updates (
    update_id SERIAL PRIMARY KEY,
    graph_id INT NOT NULL,
    edge_id INT NOT NULL,
    requester_id INT NOT NULL,
    receiver_id INT NOT NULL,
    new_weight FLOAT NOT NULL,
    approved BOOLEAN,
    createdat DATE DEFAULT CURRENT_DATE,
    updatedat DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (graph_id) REFERENCES graphs (graph_id) ON DELETE CASCADE,
    FOREIGN KEY (edge_id) REFERENCES edges (edge_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (user_id) ON DELETE CASCADE
);


-- Inserimento dati nella tabella 'users'
INSERT INTO users (email, password, tokens, isadmin) VALUES
 ('daniele@op.it', 'Opti2024!', 100.00, false),
 ('alessandro@op.it', 'Opti2024!', 100.00, false),
 ('adriano@op.it', 'Opti2024!', 100.00, true);

-- Inserimento di due grafi con 8 nodi e 16 archi
INSERT INTO graphs (user_id, name, description, cost) VALUES
    (1, 'Graph 1', 'Description of Graph 1', 3.0),
    (2, 'Graph 2', 'Description of Graph 2', 4.1),
    (3, 'Graph 3', 'Description of Graph 3', 2.3),
    (1, 'Graph 4', 'Description of Graph 4', 5.1),
    (2, 'Graph 5', 'Description of Graph 5', 6.6),
    (3, 'Graph 6', 'Description of Graph 6', 1.9),
    (3, 'GrafoSimulation', 'Un grafo di test per la simulazione con un arco dal peso elevato.', 9.9);


-- Inserimento degli archi per il primo grafo
INSERT INTO edges (graph_id, start_node, end_node, weight) VALUES
    (1, 'A', 'B', 1.5),
    (1, 'B', 'C', 2.0),
    (1, 'C', 'D', 1.2),
    (1, 'D', 'E', 1.8),
    (1, 'E', 'F', 2.3),
    (1, 'F', 'G', 1.6),
    (1, 'G', 'H', 1.9),
    (1, 'H', 'A', 1.4);

-- Inserimento degli archi per il secondo grafo
INSERT INTO edges (graph_id, start_node, end_node, weight) VALUES
    (2, 'A', 'B', 2.1),
    (2, 'B', 'C', 1.7),
    (2, 'C', 'D', 1.3),
    (2, 'D', 'E', 2.5),
    (2, 'E', 'F', 1.6),
    (2, 'F', 'G', 1.8),
    (2, 'G', 'H', 2.2),
    (2, 'H', 'A', 1.9);

-- Inserimento degli archi per il terzo grafo
INSERT INTO edges (graph_id, start_node, end_node, weight) VALUES
    (3, 'A', 'B', 1.1),
    (3, 'B', 'C', 1.4),
    (3, 'C', 'D', 1.2),
    (3, 'D', 'E', 2.1),
    (3, 'E', 'F', 1.9),
    (3, 'F', 'G', 1.2),
    (3, 'G', 'H', 2.1),
    (3, 'H', 'A', 1.2);

INSERT INTO edges (graph_id, start_node, end_node, weight) VALUES
    (4, 'I', 'J', 1.7),
    (4, 'J', 'K', 2.1),
    (4, 'K', 'P', 1.3),
    (4, 'L', 'M', 1.9),
    (4, 'M', 'N', 2.2),
    (4, 'K', 'O', 1.5),
    (4, 'O', 'P', 1.8),
    (4, 'P', 'M', 2.0);

INSERT INTO edges (graph_id, start_node, end_node, weight) VALUES
    (5, 'Q', 'R', 1.6),
    (5, 'R', 'S', 1.9),
    (5, 'W', 'T', 2.1),
    (5, 'T', 'U', 1.4),
    (5, 'R', 'V', 2.3),
    (5, 'V', 'W', 1.7),
    (5, 'W', 'X', 1.8),
    (5, 'X', 'V', 1.9);

INSERT INTO edges (graph_id, start_node, end_node, weight) VALUES
    (6, 'Y', 'Z', 2.2),
    (6, 'Z', 'A1', 1.6),
    (6, 'A1', 'B1', 1.8),
    (6, 'B1', 'C1', 2.0),
    (6, 'C1', 'D1', 1.5),
    (6, 'D1', 'E1', 1.9),
    (6, 'E1', 'F1', 2.1),
    (6, 'F1', 'A1', 1.7);

    INSERT INTO edges (graph_id, start_node, end_node, weight) VALUES
    (7, 'A', 'B', 50),
    (7, 'A', 'C', 1),
    (7, 'C', 'D', 1),
    (7, 'D', 'B', 1);

-- Inserimento di alcune richieste di modifica degli archi con requester_id e receiver_id
INSERT INTO updates (graph_id, edge_id, requester_id, receiver_id, new_weight, approved) VALUES
    (1, 1, 2, 1, 1.7, NULL), -- Richiesta di modifica per il primo arco da alessandro a daniele
    (1, 4, 2, 1, 2.0, NULL), -- Richiesta di modifica per il quarto arco da alessandro a daniele
    (2, 9, 1, 3, 1.5, NULL), -- Richiesta di modifica per il nono arco da daniele a adriano
    (2, 10, 1, 3, 1.7, true),
    (2, 11, 1, 3, 2.0, false),
    (2, 9, 1, 3, 1.5, NULL);
    
   