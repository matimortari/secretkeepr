package cmd

import (
	"github.com/fatih/color"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Logout from your SecretKeepR account",

	Run: func(cmd *cobra.Command, args []string) {
		_, err := config.LoadAuthToken()
		if err != nil {
			color.Yellow("You're not logged in. No token found.")
			return
		}
		if err := config.ClearAuthToken(); err != nil {
			color.Red("Failed to logout: %v", err)
			return
		}

		color.Green("Successfully logged out. Your CLI token has been removed.")
	},
}

func init() {
	rootCmd.AddCommand(logoutCmd)
}
