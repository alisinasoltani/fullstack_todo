FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o server ./cmd/server/main.go
RUN go build -o migrate ./cmd/migrate/main.go

FROM alpine:3.18

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/migrate .

RUN apk add --no-cache netcat-openbsd

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]