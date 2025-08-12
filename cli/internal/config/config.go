package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// configFilePath returns the full path to the token file used by the CLI.
//
// The file is located at $HOME/.secretkeepr and is used to securely save and load the user's access token.
func configFilePath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("could not determine home directory: %w", err)
	}
	return filepath.Join(home, ".secretkeepr"), nil
}

// SaveToken writes the given token string to the configuration file.
//
// It trims whitespace and saves it via configFilePath(), allowing only its owner to read and write, and returns an error if the write operation fails.
func SaveToken(token string) error {
	token = strings.TrimSpace(token)
	path, err := configFilePath()
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(token), 0600)
}

// LoadAuthToken reads the authentication token from the configuration file.
//
// It trims any leading/trailing whitespace from the token, and prints a login prompt if the file does not exist or is inaccessible.
func LoadAuthToken() (string, error) {
	path, err := configFilePath()
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		fmt.Println("You're not logged in. Please run `secretkeepr login`.")
		return "", errors.New("authentication token not found")
	}
	return strings.TrimSpace(string(data)), nil
}
