export interface GraphData {
    nodes: Array<{
      id: string; // O number, a seconda di come identifichi i nodi
      [key: string]: any; // Proprietà addizionali dei nodi
    }>;
    edges: Array<{
      startNode: string; // ID del nodo sorgente
      endNode: string; // ID del nodo destinazione
      weight: number; // Peso dell'arco
      [key: string]: any; // Proprietà addizionali degli archi
    }>;
  }
  