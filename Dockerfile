# Dockerfile
FROM node:22.12.0-alpine as builder

WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# 프로덕션 단계
FROM nginx:alpine

# Nginx 설정 파일 복사 (필요한 경우)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일을 Nginx 서버로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]