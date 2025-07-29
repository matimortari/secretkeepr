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

type Project struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

type Secret struct {
	Key    string `json:"key"`
	Values []struct {
		Value       string `json:"value"`
		Environment string `json:"environment"`
	} `json:"values"`
}

func getSecrets(token, projectID string) ([]Secret, error) {
	resp, err := api.Get(token, fmt.Sprintf("/projects/%s/secrets", projectID))
	if err != nil {
		return nil, fmt.Errorf("failed to get project secrets: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API error: %s", resp.Status)
	}

	var secretsResp struct {
		Secrets []Secret `json:"secrets"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&secretsResp); err != nil {
		return nil, fmt.Errorf("failed to parse secrets: %w", err)
	}

	return secretsResp.Secrets, nil
}

func showProjectData(token, projectID, projectName string) {
	secrets, err := getSecrets(token, projectID)
	if err != nil {
		fmt.Println("Failed to get project secrets:", err)
		return
	}

	fmt.Println("Secrets for project:", projectName)
	for _, secret := range secrets {
		fmt.Printf("- %s:\n", secret.Key)
		for _, val := range secret.Values {
			fmt.Printf("  [%s] %s\n", val.Environment, val.Value)
		}
	}
}

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

func fetchProjects(token string) ([]Project, error) {
	resp, err := api.Get(token, "/projects")
	if err != nil {
		return nil, fmt.Errorf("failed to get projects: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %s", resp.Status)
	}

	var projects []Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		return nil, fmt.Errorf("failed to parse projects: %w", err)
	}

	return projects, nil
}

var projectsCmd = &cobra.Command{
	Use:   "projects",
	Short: "List projects you belong to and manage secrets",

	Run: func(cmd *cobra.Command, args []string) {
		token, err := config.LoadAuthToken()
		if err != nil {
			return
		}

		projects, err := fetchProjects(token)
		if err != nil {
			fmt.Println(err)
			return
		}
		if secretsProjectID != "" {
			projectName := secretsProjectID
			for _, p := range projects {
				if p.ID == secretsProjectID {
					projectName = p.Name
					break
				}
			}
			if exportEnv {
				if err := exportSecretsToEnvFile(token, secretsProjectID, envToExport); err != nil {
					fmt.Printf("Failed to export secrets: %v\n", err)
				} else {
					fmt.Printf(".env.%s file created successfully!\n", envToExport)
				}
				return
			}

			showProjectData(token, secretsProjectID, projectName)
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
