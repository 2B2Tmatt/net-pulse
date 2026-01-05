package main

import (
	"log"
	"net/http"
	"pulse-api/handlers"
)

func main() {
	router := http.NewServeMux()
	router.HandleFunc("POST /api/lookup", handlers.Lookup)

	log.Println("Server started on port: 8080")
	http.ListenAndServe(":8080", corsMiddleware(router))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
