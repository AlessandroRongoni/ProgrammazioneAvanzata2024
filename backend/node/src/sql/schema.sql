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
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    edge_id INT NOT NULL,
    requester_id INT NOT NULL,
    receiver_id INT NOT NULL,
    new_weight FLOAT NOT NULL,
    approved BOOLEAN,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (edge_id) REFERENCES edges (edge_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (user_id) ON DELETE CASCADE
);


-- Inserimento dati nella tabella 'users'
INSERT INTO users (email, password, tokens, isadmin) VALUES
 ('daniele@op.it', 'opti2024!', 100.00, false),
 ('alessandro@op.it', 'opti2024!', 100.00, false),
 ('adriano@op.it', 'opti2024!', 100.00, true),
 ('user1@op.it', 'opti2024!', 100.00, false),
 ('user2@op.it', 'opti2024!', 100.00, false);

-- Inserimento di due grafi con 8 nodi e 16 archi
INSERT INTO graphs (user_id, name, description) VALUES
    (1, 'Graph 1', 'Description of Graph 1'),
    (2, 'Graph 2', 'Description of Graph 2'),
    (3, 'Graph 3', 'Description of Graph 3');

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

-- Inserimento di alcune richieste di modifica degli archi con requester_id e receiver_id
INSERT INTO updates (edge_id, requester_id, receiver_id, new_weight, approved) VALUES
    (1, 1, 3, 1.7, NULL), -- Richiesta di modifica per il primo arco da daniele a adriano
    (4, 1, 3, 2.0, NULL), -- Richiesta di modifica per il quarto arco da daniele a adriano
    (9, 1, 3, 1.5, NULL); -- Richiesta di modifica per il nono arco da daniele a adriano
