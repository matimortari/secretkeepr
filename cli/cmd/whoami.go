package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

// User represents the structure of the logged-in user returned by the API.
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

// whoamiCmd displays information about the current logged-in user.
var whoamiCmd = &cobra.Command{
	Use:   "whoami",
	Short: "Show your current logged in user",

	Run: func(cmd *cobra.Command, args []string) {
		token, err := config.LoadAuthToken()
		if err != nil {
			return
		}

		resp, err := api.Get(token, "/user")
		if err != nil {
			fmt.Println("Failed to get user data:", err)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != 200 {
			fmt.Printf("API error: %s\n", resp.Status)
			return
		}

		// Decode JSON response into User struct
		var user User
		err = json.NewDecoder(resp.Body).Decode(&user)
		if err != nil {
			fmt.Println("Failed to parse user data:", err)
			return
		}

		fmt.Printf("✅ Logged in as: %s (%s)\n\n", user.Name, user.Email)
		fmt.Println("Organizations:")
		for _, m := range user.Memberships {
			fmt.Printf(" - %s (role: %s)\n", m.Organization.Name, m.Role)
		}
	},
}

func init() {
	rootCmd.AddCommand(whoamiCmd)
}
