package cmd

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"

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
	Use:   "login",
	Short: "Login via browser to your SecretKeepR account",

	Run: func(cmd *cobra.Command, args []string) {
		_ = godotenv.Load()

		webURL := os.Getenv("WEB_URL")
		if webURL == "" {
			webURL = "https://secretkeepr.vercel.app"
		}

		if tokenFlag != "" {
			token := strings.TrimSpace(tokenFlag)
			if token == "" {
				fmt.Println("❌ Empty token provided.")
				return
			}
			if err := config.SaveToken(token); err != nil {
				fmt.Println("Failed to save token:", err)
				return
			}
			fmt.Println("✅ Authenticated via token flag")
			return
		}

		fmt.Println("Opening preferences page in your browser...")
		url := webURL + "/admin/preferences"
		if err := openBrowser(url); err != nil {
			fmt.Println("Couldn't open browser automatically. Please open manually:")
		}
		fmt.Println(url)
		fmt.Println("Please copy your CLI token and paste it below.")
		fmt.Print("CLI Token: ")

		reader := bufio.NewReader(os.Stdin)
		token, _ := reader.ReadString('\n')
		token = strings.TrimSpace(token)
		if token == "" {
			fmt.Println("❌ No token entered. Aborting.")
			return
		}

		if err := config.SaveToken(token); err != nil {
			fmt.Println("Failed to save token:", err)
			return
		}

		fmt.Println("✅ Authenticated successfully.")
	},
}

func init() {
	loginCmd.Flags().StringVar(&tokenFlag, "token", "", "Provide token directly without browser flow")
	rootCmd.AddCommand(loginCmd)
}
