package cmd

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

var (
	importProjectID string
	importEnv       string
	importFile      string
)

// parseDotEnv reads key-value pairs from a .env file into a map.
func parseDotEnv(filename string) (map[string]string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	secrets := make(map[string]string)
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := scanner.Text()
		line = strings.TrimSpace(line)

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

// postSecret sends a single secret to the API for a given project and environment.
func postSecret(token, projectID, key, environment, value string) error {
	payload := map[string]any{
		"key": key,
		"values": []map[string]string{
			{
				"environment": environment,
				"value":       value,
			},
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := api.Post(token, fmt.Sprintf("/projects/%s/secrets", projectID), bodyBytes)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return fmt.Errorf("API returned status: %s", resp.Status)
	}

	return nil
}

// importCmd imports secrets from a .env file into a given project/environment.
var importCmd = &cobra.Command{
	Use:   "import",
	Short: "Import secrets from a local .env file into a SecretKeepR project environment",

	Run: func(cmd *cobra.Command, args []string) {
		if importProjectID == "" {
			fmt.Println("Error: --project is required")
			return
		}
		if importEnv == "" {
			importEnv = "development"
		}
		if importFile == "" {
			importFile = ".env"
		}

		token, err := config.LoadAuthToken()
		if err != nil {
			return
		}

		secrets, err := parseDotEnv(importFile)
		if err != nil {
			fmt.Printf("Failed to parse .env file: %v\n", err)
			return
		}

		if len(secrets) == 0 {
			fmt.Println("No secrets found in .env file.")
			return
		}

		fmt.Printf("Importing secrets into project %s (env: %s):\n", importProjectID, importEnv)
		for key, value := range secrets {
			err := postSecret(token, importProjectID, key, importEnv, value)
			if err != nil {
				fmt.Printf("❌ %s: %v\n", key, err)
			} else {
				fmt.Printf("✅ %s\n", key)
			}
		}

		fmt.Println("Import completed.")
	},
}

func init() {
	importCmd.Flags().StringVarP(&importProjectID, "project", "p", "", "Project ID to import secrets into")
	importCmd.Flags().StringVarP(&importEnv, "env", "e", "development", "Environment for the secrets")
	importCmd.Flags().StringVarP(&importFile, "file", "f", ".env", "Path to .env file")

	rootCmd.AddCommand(importCmd)
}
