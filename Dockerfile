FROM node:24-slim

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

RUN npm install

# Copy the rest of the project
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
