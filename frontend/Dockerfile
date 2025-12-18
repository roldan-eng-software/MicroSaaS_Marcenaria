# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro para aproveitar cache
COPY package.json package-lock.json* ./

RUN npm install

# Copiar o restante do código fonte
COPY . .

# Construir a aplicação (Vite vai usar as variáveis VITE_ passadas no build ou env)
RUN npm run build

# Servidor nginx
FROM nginx:alpine

# Copiar o build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
