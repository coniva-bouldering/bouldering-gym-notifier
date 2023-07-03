package main

import (
	"context"
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
	// d1に接続
	c, err := d1.OpenConnector(context.Background(), "bouldering_gym_notifier_db")
	if err != nil {
		log.Fatal(err)
	}
	db := sql.OpenDB(c)
	defer db.Close()

	// 短縮URLを作成する
	http.HandleFunc("/create", func(w http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		type URL struct {
			OriginURL string `json:"origin_url"`
		}
		var url URL
		if err := json.NewDecoder(req.Body).Decode(&url); err != nil {
			http.Error(w, "request format is invali", http.StatusBadRequest)
			return
		}
		id := generate(5)
		_, err := db.ExecContext(req.Context(), "INSERT INTO url (short_url_key, origin_url) VALUES (?, ?)", id, url.OriginURL)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed insert url: %s", err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"short_url": id})
	})
	// 短縮URLから元のURLにリダイレクトする
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		key := req.URL.Path[1:]

		var originURL string
		err = db.QueryRowContext(req.Context(), "SELECT origin_url FROM url WHERE short_url_key = ?", key).Scan(&originURL)
		if err != nil {
			http.Error(w, fmt.Sprintf("failed get origin_url: %s", err), http.StatusInternalServerError)
			return
		}
		http.Redirect(w, req, originURL, http.StatusFound)
	})
	workers.Serve(nil) // use http.DefaultServeMux
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
