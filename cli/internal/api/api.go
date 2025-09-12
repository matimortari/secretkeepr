package api

import (
	"bytes"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var BaseURL string

func init() {
	_ = godotenv.Load()

	BaseURL = os.Getenv("API_URL")
	if BaseURL == "" {
		BaseURL = "https://secretkeepr.vercel.app/api"
	}
}

// request is a generic HTTP request helper for the API.
func request(method, token, path string, body []byte) (*http.Response, error) {
	// Ensure path begins with a slash
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	url := BaseURL + path

	// Prepare request body
	var buf *bytes.Buffer
	if body != nil {
		buf = bytes.NewBuffer(body)
	} else {
		buf = &bytes.Buffer{}
	}

	// Create the HTTP request
	req, err := http.NewRequest(method, url, buf)
	if err != nil {
		return nil, err
	}

	// Set headers
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	if method == http.MethodPost || method == http.MethodPut {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{
		Timeout: 20 * 1e9, // 20 seconds timeout
	}
	return client.Do(req)
}

// Get performs a GET request to the API.
func Get(token, path string) (*http.Response, error) {
	return request(http.MethodGet, token, path, nil)
}

// Post performs a POST request to the API.
func Post(token, path string, body []byte) (*http.Response, error) {
	return request(http.MethodPost, token, path, body)
}

// Put performs a PUT request to the API.
func Put(token, path string, body []byte) (*http.Response, error) {
	return request(http.MethodPut, token, path, body)
}

// Delete performs a DELETE request to the API.
func Delete(token, path string) (*http.Response, error) {
	return request(http.MethodDelete, token, path, nil)
}
