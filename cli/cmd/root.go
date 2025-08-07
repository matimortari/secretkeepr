package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:           "secretkeepr",
	Short:         "Manage your secrets from the terminal",
	Long:          "SecretKeepR CLI lets you log in, manage projects, and sync secrets easily.",
	SilenceUsage:  true,
	SilenceErrors: true,
}

func Execute() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Fprintf(os.Stderr, "⚠️  Unexpected error: %v\n", r)
			os.Exit(1)
		}
	}()

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
