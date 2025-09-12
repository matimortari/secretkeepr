package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/fatih/color"
	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

var (
	exportProjectSlug string
	exportEnv         string
	exportFile        string
)

func uploadSecret(token, projectID, key, environment, value string) error {
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
		return fmt.Errorf("API error: %s", resp.Status)
	}

	return nil
}

var exportCmd = &cobra.Command{
	Use:     "export",
	Aliases: []string{"e"},
	Short:   "Export secrets from a local .env file to a SecretKeepR project environment",
	Long: `Export secrets stored in a local .env file into a specified SecretKeepR project environment.

You can specify:
  • The project slug (--project)
  • The environment to export to (--env, defaults to "development")
  • The path to the local .env file (--file, defaults to ".env")

Example:
  secretkeepr export --project my-project --env production --file ./prod.env
`,

	Run: func(cmd *cobra.Command, args []string) {
		token, err := config.LoadAuthToken()
		if err != nil {
			color.Red("Failed to load authentication token: %v", err)
			return
		}

		project, err := getProjectBySlug(token, exportProjectSlug)
		if err != nil {
			color.Red("Failed to find project by slug '%s': %v", exportProjectSlug, err)
			return
		}

		secrets, err := config.ParseDotEnv(exportFile)
		if err != nil {
			color.Red("Failed to parse .env file: %v", err)
			return
		}
		if len(secrets) == 0 {
			color.Yellow("No secrets found in %s", exportFile)
			return
		}

		color.Cyan("Uploading secrets to project %s (env: %s):", project.Name, exportEnv)
		for key, value := range secrets {
			if err := uploadSecret(token, project.ID, key, exportEnv, value); err != nil {
				color.Red("Failed to upload %s: %v", key, err)
			} else {
				color.Green("Uploaded %s", key)
			}
		}

		color.Cyan("Export completed.")
	},
}

func init() {
	exportCmd.Flags().StringVarP(&exportProjectSlug, "project", "p", "", "Project slug to upload secrets to")
	exportCmd.Flags().StringVarP(&exportEnv, "env", "e", "development", "Environment for the secrets")
	exportCmd.Flags().StringVarP(&exportFile, "file", "f", ".env", "Path to local .env file")

	_ = exportCmd.MarkFlagRequired("project")

	rootCmd.AddCommand(exportCmd)
}
