package config

import (
	"bufio"
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

// ParseDotEnv reads key=value pairs from a .env file and returns them as a map.
//
// It reads the file line by line, ignoring comments and blank lines, and returns an error if the file cannot be read or if the contents are invalid.
func ParseDotEnv(filename string) (map[string]string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	secrets := make(map[string]string)
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.Trim(strings.TrimSpace(parts[1]), `"'`)
		if key != "" && value != "" {
			secrets[key] = value
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return secrets, nil
}
