package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/fatih/color"
	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

type User struct {
	Name        string `json:"name"`
	Email       string `json:"email"`
	Memberships []struct {
		Role         string `json:"role"`
		Organization struct {
			Name string `json:"name"`
		} `json:"organization"`
	} `json:"memberships"`
}

var whoamiCmd = &cobra.Command{
	Use:   "whoami",
	Short: "Display information about the current user",

	Run: func(cmd *cobra.Command, args []string) {
		token, err := config.LoadAuthToken()
		if err != nil {
			color.Red("Failed to load authentication token: %v", err)
			return
		}

		resp, err := api.Get(token, "/user")
		if err != nil {
			color.Red("Failed to get user data: %v", err)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			color.Red("API error: %s\n%s", resp.Status, string(body))
			return
		}

		var user User
		err = json.NewDecoder(resp.Body).Decode(&user)
		if err != nil {
			color.Red("Failed to parse user data: %v", err)
			return
		}

		fmt.Printf("%s %s\n", color.CyanString("User:"), user.Name)
		fmt.Printf("%s %s\n", color.CyanString("Email:"), user.Email)
		color.Cyan("Organizations:")
		for _, m := range user.Memberships {
			fmt.Printf(" - %s (role: %s)\n", m.Organization.Name, m.Role)
		}
	},
}

func init() {
	rootCmd.AddCommand(whoamiCmd)
}
