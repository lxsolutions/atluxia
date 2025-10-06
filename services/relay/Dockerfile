





FROM golang:1.20-alpine

WORKDIR /app

# Copy go.mod and go.sum first to leverage Docker cache
COPY go.mod go.sum ./

RUN go mod tidy && go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application
RUN go build -o relay-service main.go

EXPOSE 8080

CMD ["./relay-service"]


