














# OpenGrid Project Makefile

.PHONY: all build test lint dev demo clean deploy push docs

all: build

build:
	@echo "Building all components..."
	$(MAKE) -C daemon build
	$(MAKE) -C coordinator build
	$(MAKE) -C contracts build
	$(MAKE) -C cli build
	$(MAKE) -C ui build
	$(MAKE) -C verifier build

test:
	@echo "Running tests for all components..."
	$(MAKE) -C daemon test
	$(MAKE) -C coordinator test
	$(MAKE) -C contracts test
	$(MAKE) -C cli test
	$(MAKE) -C ui test
	$(MAKE) -C verifier test

lint:
	@echo "Linting all components..."
	$(MAKE) -C daemon lint
	$(MAKE) -C coordinator lint
	$(MAKE) -C contracts lint
	$(MAKE) -C cli lint
	$(MAKE) -C ui lint
	$(MAKE) -C verifier lint

dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

demo:
	@echo "Running demo scenario..."
	make dev &
	sleep 30 # Wait for services to start
	opengrid/cli/og submit examples/sdxl-generate/job.yaml

clean:
	@echo "Cleaning build artifacts..."
	$(MAKE) -C daemon clean
	$(MAKE) -C coordinator clean
	$(MAKE) -C contracts clean
	$(MAKE) -C cli clean
	$(MAKE) -C ui clean
	$(MAKE) -C verifier clean

deploy:
	@echo "Deploying to production..."
	docker-compose up --build -d

push:
	@echo "Pushing Docker images to registry..."
	docker push opengrid/daemon:latest
	docker push opengrid/coordinator:latest
	docker push opengrid/contracts:latest
	docker push opengrid/cli:latest
	docker push opengrid/ui:latest
	docker push opengrid/verifier:latest

docs:
	@echo "Generating documentation..."
	pandoc docs/*.md -o docs/opengrid-docs.pdf












