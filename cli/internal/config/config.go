package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// configFilePath returns the full path to the token file used by the CLI.
//
// The file is located at $HOME/.secretkeepr and is used to securely save and load the user's access token.
// It is hidden and stored with permissions that restrict access to the current user only.
func configFilePath() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".secretkeepr")
}

// SaveToken writes the given token string to the configuration file.
//
// The token is trimmed of whitespace and saved to $HOME/.secretkeepr, allowing only the file owner to read and write.
// It returns an error if the write operation fails.
func SaveToken(token string) error {
	token = strings.TrimSpace(token)
	return os.WriteFile(configFilePath(), []byte(token), 0600)
}

// LoadToken reads and returns the token from the configuration file.
//
// It trims any leading or trailing whitespace from the token content.
// It returns an error if the file does not exist or is inaccessible.
func LoadToken() (string, error) {
	data, err := os.ReadFile(configFilePath())
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(data)), nil
}

// LoadAuthToken loads the authentication token from the configuration file.
//
// It returns an error if the token cannot be loaded, indicating that the user is not logged in.
func LoadAuthToken() (string, error) {
	token, err := LoadToken()
	if err != nil {
		fmt.Println("You're not logged in. Please run `secretkeepr login`.")
		return "", err
	}
	return token, nil
}
