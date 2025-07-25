package cmd

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"runtime"

	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	}
	if err != nil {
		fmt.Println("Please open the following URL:", url)
	}
}

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login via browser to your SecretKeepR account",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Opening login page in browser...")

		// openBrowser("http://localhost:3000/admin/preferences")
		openBrowser("https://secretkeepr.vercel.app/admin/preferences")

		// Ask user to paste token manually (simulate device flow)
		fmt.Print("Paste the token you received after logging in: ")
		reader := bufio.NewReader(os.Stdin)
		token, _ := reader.ReadString('\n')

		// Save token to config
		if err := config.SaveToken(token); err != nil {
			fmt.Println("Failed to save token:", err)
			return
		}

		fmt.Println("✅ Logged in successfully!")
	},
}

func init() {
	rootCmd.AddCommand(loginCmd)
}
