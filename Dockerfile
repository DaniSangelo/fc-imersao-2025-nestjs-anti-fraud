FROM node:23.0.0-slim

# Instala dependências
RUN apt update && \
    apt install openssl procps -y

# Cria diretório da aplicação
WORKDIR /home/node/app

# Copia package.json e instala dependências (como Prisma)
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Gera Prisma Client com o binário correto
RUN npx prisma generate

# Porta que será exposta
EXPOSE 3000

CMD ["npm", "run", "start:dev"]
