package cmd

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"runtime"

	"github.com/matimortari/secretkeepr/cli/internal/api"
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
		fmt.Println("Opening user preferences in browser...")
		openBrowser(api.BaseURL + "/admin/preferences")
		fmt.Print("Please enter your CLI token: ")
		reader := bufio.NewReader(os.Stdin)
		token, _ := reader.ReadString('\n')
		if err := config.SaveToken(token); err != nil {
			fmt.Println("Failed to save token:", err)
			return
		}

		fmt.Println("✅ Authenticated")
	},
}

func init() {
	rootCmd.AddCommand(loginCmd)
}
