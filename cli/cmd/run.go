package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/fatih/color"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

var runProjectSlug string
var runEnv string

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Run a command with secrets from a SecretKeepR project",
	Long: `Fetch secrets from a SecretKeepR project environment and run a command
with those secrets available as environment variables.

Example:
  secretkeepr run --project my-project --env development -- npm run dev
`,
	Args: cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		if runProjectSlug == "" {
			color.Red("Error: --project flag is required")
			return
		}
		if runEnv == "" {
			runEnv = "development"
		}

		token, err := config.LoadAuthToken()
		if err != nil {
			color.Red("You're not logged in. Please run `secretkeepr login`.")
			return
		}

		project, err := getProjectBySlug(token, runProjectSlug)
		if err != nil {
			color.Red("Failed to find project by slug '%s': %v", runProjectSlug, err)
			return
		}

		color.Cyan("Fetching secrets from project %s (env: %s)...", project.Name, runEnv)
		secrets, err := fetchSecrets(token, project.ID, runEnv)
		if err != nil {
			color.Red("Failed to fetch secrets: %v", err)
			return
		}
		if len(secrets) == 0 {
			color.Yellow("No secrets found for environment %s", runEnv)
		}

		// Merge secrets with existing environment
		env := os.Environ()
		for k, v := range secrets {
			env = append(env, fmt.Sprintf("%s=%s", k, v))
		}

		c := exec.Command(args[0], args[1:]...)
		c.Env = env
		c.Stdout = os.Stdout
		c.Stderr = os.Stderr
		c.Stdin = os.Stdin

		color.Cyan("Running command: %s", strings.Join(args, " "))
		if err := c.Run(); err != nil {
			color.Red("Command failed: %v", err)
		}
	},
}

func init() {
	runCmd.Flags().StringVarP(&runProjectSlug, "project", "p", "", "Project slug to fetch secrets from")
	runCmd.Flags().StringVarP(&runEnv, "env", "e", "development", "Environment to fetch secrets from")

	_ = runCmd.MarkFlagRequired("project")

	rootCmd.AddCommand(runCmd)
}
