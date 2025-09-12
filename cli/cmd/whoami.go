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

type Organization struct {
	Name string `json:"name"`
}

type UserOrganization struct {
	Role         string       `json:"role"`
	Organization Organization `json:"organization"`
}

type User struct {
	Name          string             `json:"name"`
	Email         string             `json:"email"`
	Organizations []UserOrganization `json:"organizations"`
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
		if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
			color.Red("Failed to parse user data: %v", err)
			return
		}

		/* Output */
		fmt.Println()
		fmt.Printf("%s %s\n", color.YellowString("User:"), user.Name)
		fmt.Printf("%s %s\n", color.YellowString("Email:"), user.Email)
		fmt.Println()

		if len(user.Organizations) == 0 {
			color.Yellow("No organizations found.")
		} else {
			fmt.Println(color.YellowString("Organizations:"))
			for _, o := range user.Organizations {
				fmt.Printf("  • %s (role: %s)\n", color.CyanString(o.Organization.Name), o.Role)
			}
		}
		fmt.Println()
	},
}

func init() {
	rootCmd.AddCommand(whoamiCmd)
}
