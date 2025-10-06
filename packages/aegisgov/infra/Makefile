
















.PHONY: help build run test

help:
	@echo "Available commands:"
	@echo "  make help        - Show this help message"
	@echo "  make build       - Build the Docker images"
	@echo "  make run         - Run the application with docker-compose"
	@echo "  make test        - Run tests"

build:
	docker-compose build

run: build
	docker-compose up

test:
	pytest tests/














