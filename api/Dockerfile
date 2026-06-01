# ==============================================================================
# DOCKERFILE - NESTJS API
# ==============================================================================
# Define a imagem base leve do Node.js.
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /usr/src/app

# Copia os arquivos de dependência primeiro para otimizar o cache do Docker.
COPY package*.json ./

# Instala as dependências do projeto.
RUN npm install

# Copia o restante do código fonte.
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Executa o build da aplicação NestJS (TypeScript para JavaScript).
RUN npm run build

# Expõe a porta que a API utilizará.
EXPOSE 3000

# Comando de inicialização em ambiente de produção.
CMD ["npm", "run", "start:prod"]
