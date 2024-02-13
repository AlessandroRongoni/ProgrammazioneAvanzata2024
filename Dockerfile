# Utilizza l'immagine ufficiale di Node.js come immagine base
FROM node:14

# Imposta la directory di lavoro nel container
WORKDIR /usr/src/app

# Copia il file package.json e package-lock.json (se disponibile)
COPY package*.json ./

# Installa le dipendenze del progetto
RUN npm install

# Copia i file del progetto nella directory di lavoro del container
COPY . .

# Espone la porta su cui l'applicazione sarà disponibile
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["node", "src/app.js"]
