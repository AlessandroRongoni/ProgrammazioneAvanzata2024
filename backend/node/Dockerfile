# Utilizza l'immagine ufficiale di Node.js come immagine base
FROM node:alpine
# Imposta la directory di lavoro nel container
WORKDIR /usr/app
COPY . .
# Installa le dipendenze del progetto
RUN npm install
RUN npx tsc 
# Espone la porta su cui l'applicazione sarà disponibile
EXPOSE 3000
# Comando per avviare l'applicazione
CMD ["node", "./build/src/app.js"]
