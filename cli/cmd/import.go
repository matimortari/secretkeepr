package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/fatih/color"
	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

var (
	importProjectSlug string
	importEnv         string
	importFile        string
)

func fetchSecrets(token, projectID, environment string) (map[string]string, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/projects/%s/secrets?environment=%s", api.BaseURL, projectID, environment), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %s", resp.Status)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var data struct {
		Secrets []struct {
			Key    string `json:"key"`
			Values []struct {
				Environment string `json:"environment"`
				Value       string `json:"value"`
			} `json:"values"`
		} `json:"secrets"`
	}

	if err := json.Unmarshal(bodyBytes, &data); err != nil {
		return nil, err
	}

	secrets := make(map[string]string)
	for _, secret := range data.Secrets {
		for _, val := range secret.Values {
			if strings.EqualFold(val.Environment, environment) {
				secrets[secret.Key] = val.Value
				break
			}
		}
	}

	return secrets, nil
}

func writeDotEnv(filename string, secrets map[string]string) error {
	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()

	for key, val := range secrets {
		line := fmt.Sprintf("%s=%s\n", key, val)
		if _, err := f.WriteString(line); err != nil {
			return err
		}
	}
	return nil
}

var importCmd = &cobra.Command{
	Use:   "import",
	Short: "Import secrets from a SecretKeepR project environment into a local .env file",
	Long: `Fetch secrets from a SecretKeepR project environment and save them to a local .env file.

You can specify:
  • The project slug (--project)
  • The environment to fetch (--env, defaults to "development")
  • The path to save the .env file (--file, defaults to ".env")

Example:
  secretkeepr import --project my-project --env production --file ./prod.env
`,

	Run: func(cmd *cobra.Command, args []string) {
		if importProjectSlug == "" {
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

		project, err := getProjectBySlug(token, importProjectSlug)
		if err != nil {
			color.Red("Failed to find project by slug '%s': %v", importProjectSlug, err)
			return
		}

		color.Cyan("Fetching secrets from project %s (env: %s)...", project.Name, importEnv)
		secrets, err := fetchSecrets(token, project.ID, importEnv)
		if err != nil {
			color.Red("Failed to fetch secrets: %v", err)
			return
		}
		if len(secrets) == 0 {
			color.Yellow("No secrets found for environment %s", importEnv)
			return
		}

		err = writeDotEnv(importFile, secrets)
		if err != nil {
			color.Red("Failed to write .env file: %v", err)
			return
		}

		color.Green("Secrets imported and saved to %s", importFile)
	},
}

func init() {
	importCmd.Flags().StringVarP(&importProjectSlug, "project", "p", "", "Project slug to import secrets from")
	importCmd.Flags().StringVarP(&importEnv, "env", "e", "development", "Environment to import secrets from")
	importCmd.Flags().StringVarP(&importFile, "file", "f", ".env", "Path to save .env file")

	_ = importCmd.MarkFlagRequired("project")

	rootCmd.AddCommand(importCmd)
}
