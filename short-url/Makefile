.PHONY: dev
dev:
	wrangler dev

.PHONY: build
build:
	go run github.com/syumai/workers/cmd/workers-assets-gen@latest
	tinygo build -o ./build/app.wasm -target wasm -no-debug ./...

.PHONY: deploy
deploy:
	wrangler deploy

.PHONY: init-db-preview
init-db-preview:
	wrangler d1 execute bouldering_gym_notifier_db --file=../migrations
