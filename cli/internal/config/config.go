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
func configFilePath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("could not determine home directory: %w", err)
	}
	return filepath.Join(home, ".secretkeepr"), nil
}

// SaveToken writes the given token string to the configuration file.
func SaveToken(token string) error {
	token = strings.TrimSpace(token)
	path, err := configFilePath()
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(token), 0600)
}

// LoadAuthToken reads the authentication token from the configuration file.
func LoadAuthToken() (string, error) {
	path, err := configFilePath()
	if err != nil {
		return "", err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return "", errors.New("authentication token not found")
	}
	return strings.TrimSpace(string(data)), nil
}

// ClearAuthToken deletes the stored CLI token from the configuration file.
func ClearAuthToken() error {
	path, err := configFilePath()
	if err != nil {
		return err
	}

	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to access token file: %w", err)
	}

	if err := os.Remove(path); err != nil {
		return fmt.Errorf("failed to remove token file: %w", err)
	}

	return nil
}

// ParseDotEnv reads key-value pairs from a .env file and returns them as a map.
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
