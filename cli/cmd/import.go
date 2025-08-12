package cmd

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/fatih/color"
	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

var (
	importProjectID string
	importEnv       string
	importFile      string
)

func parseDotEnv(filename string) (map[string]string, error) {
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

func importSecret(token, projectID, key, environment, value string) error {
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
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("API error: %s", resp.Status)
	}

	return nil
}

var importCmd = &cobra.Command{
	Use:   "import",
	Short: "Import secrets from a .env file in a SecretKeepR project",
	Long: `Import secrets stored in a .env file into a specified SecretKeepR project environment.

You can specify:
  • The project ID (--project)
  • The environment to import to (--env, defaults to "development")
  • The path to the .env file (--file, defaults to ".env")

Example:
  secretkeepr import --project abc123 --env production --file ./prod.env`,

	Run: func(cmd *cobra.Command, args []string) {
		if importProjectID == "" {
			color.Red("Error: --project flag is required")
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
			color.Red("Failed to load authentication token: %v", err)
			return
		}

		secrets, err := parseDotEnv(importFile)
		if err != nil {
			color.Red("Failed to parse .env file: %v", err)
			return
		}
		if len(secrets) == 0 {
			color.Yellow("No secrets found in %s", importFile)
			return
		}

		color.Cyan("Importing secrets into project %s (env: %s):", importProjectID, importEnv)
		for key, value := range secrets {
			err := importSecret(token, importProjectID, key, importEnv, value)
			if err != nil {
				color.Red("%s: %v", key, err)
			} else {
				color.Green("%s", key)
			}
		}

		color.Cyan("Import completed.")
	},
}

func init() {
	importCmd.Flags().StringVarP(&importProjectID, "project", "p", "", "Project ID to import secrets into")
	importCmd.Flags().StringVarP(&importEnv, "env", "e", "development", "Environment for the secrets")
	importCmd.Flags().StringVarP(&importFile, "file", "f", ".env", "Path to .env file")

	_ = importCmd.MarkFlagRequired("project")

	rootCmd.AddCommand(importCmd)
}
