package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/syumai/workers"
	"github.com/syumai/workers/cloudflare/d1"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		switch req.Method {
		case http.MethodGet:
			// 短縮URLから元のURLにリダイレクトする
			get(w, req)
			return
		case http.MethodPost:
			// 短縮URLを作成する
			create(w, req)
			return
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
	})
	workers.Serve(nil) // use http.DefaultServeMux
}

func create(w http.ResponseWriter, req *http.Request) {
	// d1に接続
	c, err := d1.OpenConnector(req.Context(), "GymDB")
	if err != nil {
		log.Fatal(err)
	}
	db := sql.OpenDB(c)
	type URL struct {
		OriginalURL string `json:"original_url"`
	}
	type URLs []URL
	urls := URLs{}
	if err := json.NewDecoder(req.Body).Decode(&urls); err != nil {
		http.Error(w, "request format is invalid.", http.StatusBadRequest)
		return
	}
	// URLが空の場合は何もしない
	if len(urls) == 0 {
		return
	}
	// URLの数が10個以上の場合はエラー
	if len(urls) > 10 {
		http.Error(w, "fuck, array too big.", http.StatusBadRequest)
		return
	}
	// 短縮URL登録
	keys := make([]string, 0, len(urls))
	for _, v := range urls {
	ReTry:
		key := generate(5)
		// 短縮URLの重複チェック
		rows, err := db.QueryContext(req.Context(), fmt.Sprintf("SELECT original_url FROM urls WHERE short_url_key = '%s';", key))
		if err != nil {
			http.Error(w, fmt.Sprintf("unexpected: %s", err), http.StatusInternalServerError)
			return
		}
		if rows.Next() {
			// 短縮URLが重複するならgoto文でkey生成からリトライさせる
			goto ReTry
		}
		// 短縮URL登録
		_, err = db.ExecContext(req.Context(), "INSERT INTO urls (short_url_key, original_url) VALUES (?, ?)", key, v.OriginalURL)
		keys = append(keys, key)
	}
	if err != nil {
		http.Error(w, fmt.Sprintf("failed insert url: %s", err), http.StatusInternalServerError)
		return
	}
	// レスポンス生成
	w.Header().Set("Content-Type", "application/json")
	type Response struct {
		ShortURLKey []string `json:"short_url_keys"`
	}
	json.NewEncoder(w).Encode(Response{
		ShortURLKey: keys,
	})
}

func get(w http.ResponseWriter, req *http.Request) {
	// d1に接続
	c, err := d1.OpenConnector(req.Context(), "GymDB")
	if err != nil {
		log.Fatal(err)
	}
	db := sql.OpenDB(c)
	key := req.URL.Path[1:]
	var originalURL string
	rows, err := db.QueryContext(req.Context(), fmt.Sprintf("SELECT original_url FROM urls WHERE short_url_key = '%s';", key))
	if err != nil {
		http.Error(w, fmt.Sprintf("unexpected: %s", err), http.StatusInternalServerError)
		return
	}
	for rows.Next() {
		err = rows.Scan(&originalURL)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to scan: %s", err), http.StatusInternalServerError)
			return
		}
	}
	http.Redirect(w, req, originalURL, http.StatusFound)
}

// 短縮URL用の文字列を生成する
func generate(size int) string {
	alphabet := []byte("abcdefghijklmnopqrstuvwxyz")
	b := make([]byte, size)
	rand.Read(b)
	for i := 0; i < size; i++ {
		b[i] = alphabet[b[i]%byte(len(alphabet))]
	}
	return string(b)
}
