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
	var url URL
	if err := json.NewDecoder(req.Body).Decode(&url); err != nil {
		http.Error(w, "request format is invali", http.StatusBadRequest)
		return
	}
	// [Todo] 既に登録されているURLは登録しない
	key := generate(5)
	_, err = db.ExecContext(req.Context(), "INSERT INTO urls (short_url_key, original_url) VALUES (?, ?)", key, url.OriginalURL)

	if err != nil {
		http.Error(w, fmt.Sprintf("failed insert url: %s", err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	type Response struct {
		ShortURLKey string `json:"short_url_key"`
	}
	json.NewEncoder(w).Encode(Response{
		ShortURLKey: key,
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
		type Response struct {
			ShortURLKey string `json:"short_url_key"`
		}
		json.NewEncoder(w).Encode(Response{
			ShortURLKey: err.Error(),
		})
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
