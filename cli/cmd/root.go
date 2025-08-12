package cmd

import (
	"os"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "secretkeepr",
	Short: "Manage your secrets from the terminal",
	Long:  "SecretKeepR CLI lets you log in to your account, manage projects, and sync secrets easily.",
}

// Execute runs the root command and handles any unexpected panics gracefully.
func Execute() {
	defer func() {
		if r := recover(); r != nil {
			color.New(color.FgRed).Fprintf(os.Stderr, "Unexpected error: %v\n", r)
			return
		}
	}()
	if err := rootCmd.Execute(); err != nil {
		color.New(color.FgRed).Fprintln(os.Stderr, err)
		return
	}
}
