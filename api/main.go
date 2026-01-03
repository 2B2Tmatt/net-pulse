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
	http.ListenAndServe(":8080", router)
}
