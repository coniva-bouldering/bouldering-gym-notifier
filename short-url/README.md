# ざっくり使い方

## 短縮URL生成

```bash
$ curl -X POST -H "Content-Type: application/json" -d '[{"original_url":"https://blog.haton14.com/"},{"original_url":"https://blog.haton14.com/2023-04-28_first-post/"}]' https://su.coniva.net/
{"short_url_keys":["eykhx","jilcv"]}
```

## 短縮URLでアクセス

```bash
https://url.haton14.com/bnnkn
```

# 自動生成したやつ↓

# worker-template-tinygo

- A template for starting a Cloudflare Worker project with tinygo.
- This template uses [`workers`](https://github.com/syumai/workers) package to run an HTTP server.

## Usage

- `main.go` includes simple HTTP server implementation. Feel free to edit this code and implement your own HTTP server.

## Requirements

- Node.js
- [wrangler](https://developers.cloudflare.com/workers/wrangler/)
  - just run `npm install -g wrangler`
- tinygo

## Getting Started

```console
wrangler generate my-app syumai/workers/_templates/cloudflare/worker-tinygo
cd my-app
go mod init
go mod tidy
make dev # start running dev server
curl http://localhost:8787/hello # outputs "Hello!"
```

- To change worker name, please edit `name` property in `wrangler.toml`.

## Development

### Commands

```
make dev     # run dev server
make build   # build Go Wasm binary
make deploy # deploy worker
```

### Testing dev server

- Just send HTTP request using some tools like curl.

```
$ curl http://localhost:8787/hello
Hello!
```

```
$ curl -X POST -d "test message" http://localhost:8787/echo
test message
```
