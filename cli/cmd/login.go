package cmd

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"github.com/fatih/color"
	"github.com/joho/godotenv"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

func openBrowser(url string) error {
	switch runtime.GOOS {
	case "linux":
		return exec.Command("xdg-open", url).Start()
	case "windows":
		return exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		return exec.Command("open", url).Start()
	default:
		return fmt.Errorf("unsupported platform")
	}
}

var tokenFlag string

var loginCmd = &cobra.Command{
	Use:   "login [token]",
	Short: "Login to your SecretKeepR account",
	Long: `Authenticate your CLI with SecretKeepR.
	
You can:
  • Provide your CLI token directly:   secretkeepr login <token>
  • Use the flag:                      secretkeepr login --token <token>
  • Or follow the browser flow to copy it from your dashboard.`,

	Run: func(cmd *cobra.Command, args []string) {
		_ = godotenv.Load()

		// Case 1: Token via positional argument
		if len(args) > 0 {
			handleToken(strings.TrimSpace(args[0]))
			return
		}

		// Case 2: Token via --token flag
		if tokenFlag != "" {
			handleToken(strings.TrimSpace(tokenFlag))
			return
		}

		// Case 3: Browser flow
		webURL := os.Getenv("WEB_URL")
		if webURL == "" {
			webURL = "https://secretkeepr.vercel.app"
		}
		url := webURL + "/admin/preferences"

		color.Cyan("Opening SecretKeepR preferences in browser: %s", url)
		if err := openBrowser(url); err != nil {
			color.Yellow("Couldn't open browser automatically. Open the link above manually.")
		}
		fmt.Println("Paste your CLI token from the dashboard below.")
		fmt.Print("CLI Token: ")

		reader := bufio.NewReader(os.Stdin)
		token, _ := reader.ReadString('\n')
		handleToken(strings.TrimSpace(token))
	},
}

func handleToken(token string) {
	if token == "" {
		color.Red("No token entered. Aborting.")
		os.Exit(1)
	}
	if err := config.SaveToken(token); err != nil {
		color.Red("Failed to save token: %v", err)
		os.Exit(1)
	}
	color.Green("Authenticated successfully.")
}

func init() {
	loginCmd.Flags().StringVarP(&tokenFlag, "token", "t", "", "Provide CLI token directly without browser flow")
	rootCmd.AddCommand(loginCmd)
}
