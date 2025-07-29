package api

import (
	"bytes"
	"net/http"
	"strings"
)

// "https://secretkeepr.vercel.app/api"
var BaseURL = "http://localhost:3000/api"

func buildURL(path string) string {
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return BaseURL + path
}

func Get(token, path string) (*http.Response, error) {
	url := buildURL(path)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	return http.DefaultClient.Do(req)
}

func Post(token, path string, body []byte) (*http.Response, error) {
	url := buildURL(path)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	return http.DefaultClient.Do(req)
}

func Put(token, path string, body []byte) (*http.Response, error) {
	url := buildURL(path)
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	return http.DefaultClient.Do(req)
}

func Delete(token, path string) (*http.Response, error) {
	url := buildURL(path)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	return http.DefaultClient.Do(req)
}
