package cmd

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

var (
	secretsProjectID string
	exportEnv        bool
	envToExport      string
)

// Project represents a project with its ID, name, and role.
type Project struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

// Secret represents a secret with multiple environment-specific values.
type Secret struct {
	Key    string `json:"key"`
	Values []struct {
		Value       string `json:"value"`
		Environment string `json:"environment"`
	} `json:"values"`
}

// getSecrets gets secrets for a given project using the provided token.
func getSecrets(token, projectID string) ([]Secret, error) {
	resp, err := api.Get(token, fmt.Sprintf("/projects/%s/secrets", projectID))
	if err != nil {
		return nil, fmt.Errorf("failed to get project secrets: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get secrets: %s", resp.Status)
	}

	var secretsResp struct {
		Secrets []Secret `json:"secrets"`
	}

	err = json.NewDecoder(resp.Body).Decode(&secretsResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse secrets response: %w", err)
	}

	return secretsResp.Secrets, nil
}

// showProjectSecrets prints all secrets and their environment-specific values for a project.
func showProjectSecrets(token, projectID string) {
	secrets, err := getSecrets(token, projectID)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Secrets for project:", projectID)
	for _, secret := range secrets {
		fmt.Printf("- %s:\n", secret.Key)
		for _, val := range secret.Values {
			fmt.Printf("  [%s] %s\n", val.Environment, val.Value)
		}
	}
}

// exportSecretsToEnvFile exports secrets for a specific environment to a .env file.
func exportSecretsToEnvFile(token, projectID, environment string) error {
	secrets, err := getSecrets(token, projectID)
	if err != nil {
		return err
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("# Secrets for project %s - Environment: %s\n\n", projectID, environment))

	for _, secret := range secrets {
		for _, val := range secret.Values {
			if val.Environment == environment {
				sb.WriteString(fmt.Sprintf("%s=%s\n", secret.Key, val.Value))
			}
		}
	}

	filename := fmt.Sprintf(".env.%s", environment)
	if err := os.WriteFile(filename, []byte(sb.String()), 0644); err != nil {
		return fmt.Errorf("failed to write .env file: %w", err)
	}

	return nil
}

// projectsCmd lists projects and secrets, or exports the secrets for a specified project.
var projectsCmd = &cobra.Command{
	Use:   "projects",
	Short: "List projects or show secrets for a project",

	Run: func(cmd *cobra.Command, args []string) {
		token, err := config.LoadAuthToken()
		if err != nil {
			return
		}

		// If a project ID is provided for secrets, export secrets to .env file for the specified environment
		if secretsProjectID != "" {
			if exportEnv {
				if err := exportSecretsToEnvFile(token, secretsProjectID, envToExport); err != nil {
					fmt.Printf("Failed to export secrets: %v\n", err)
				} else {
					fmt.Printf(".env.%s file created successfully!\n", envToExport)
				}
				return
			}
			// Otherwise, just show the secrets
			showProjectSecrets(token, secretsProjectID)
			return
		}

		resp, err := api.Get(token, "/projects")
		if err != nil {
			fmt.Println("Failed to get projects:", err)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			fmt.Printf("API error: %s\n", resp.Status)
			return
		}

		// Decode JSON response into a slice of Project structs
		var projects []Project
		err = json.NewDecoder(resp.Body).Decode(&projects)
		if err != nil {
			fmt.Println("Failed to parse projects:", err)
			return
		}

		if len(projects) == 0 {
			fmt.Println("You don't belong to any projects.")
			return
		}

		fmt.Println("Projects you belong to:")
		for _, p := range projects {
			fmt.Printf(" - %s (ID: %s, Role: %s)\n", p.Name, p.ID, p.Role)
		}
	},
}

func init() {
	projectsCmd.Flags().StringVarP(&secretsProjectID, "secrets", "s", "", "Show secrets for project by ID")
	projectsCmd.Flags().BoolVar(&exportEnv, "export-env", false, "Export project secrets to a .env file")
	projectsCmd.Flags().StringVar(&envToExport, "env", "development", "Environment to export secrets for (default: development)")

	rootCmd.AddCommand(projectsCmd)
}
