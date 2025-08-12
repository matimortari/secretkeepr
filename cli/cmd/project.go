package cmd

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/fatih/color"
	"github.com/matimortari/secretkeepr/cli/internal/api"
	"github.com/matimortari/secretkeepr/cli/internal/config"
	"github.com/spf13/cobra"
)

type Member struct {
	ID     string `json:"id"`
	Role   string `json:"role"`
	UserID string `json:"userId"`
}

type Project struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Slug        string   `json:"slug"`
	Description string   `json:"description,omitempty"`
	OrgID       string   `json:"orgId,omitempty"`
	Members     []Member `json:"members,omitempty"`
	Role        string   `json:"role,omitempty"`
}

var (
	projectCreateName        string
	projectCreateOrgID       string
	projectCreateDescription string
	projectUpdateSlug        string
	projectUpdateName        string
	projectUpdateDescription string
)

// annotateProjectRoles sets the current user's role for each project based on membership info
func annotateProjectRoles(projects []Project, currentUserID string) {
	for i := range projects {
		for _, m := range projects[i].Members {
			if m.UserID == currentUserID {
				projects[i].Role = m.Role
				break
			}
		}
	}
}

func getCurrentUserID(token string) (string, error) {
	resp, err := api.Get(token, "/user")
	if err != nil {
		return "", fmt.Errorf("API error getting user info: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API error getting user info: %s", resp.Status)
	}

	var userInfo struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return "", fmt.Errorf("failed to decode user info: %w", err)
	}

	return userInfo.ID, nil
}

func getProjects(token string) ([]Project, error) {
	resp, err := api.Get(token, "/projects")
	if err != nil {
		return nil, fmt.Errorf("failed to get projects: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %s", resp.Status)
	}

	var projects []Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		return nil, fmt.Errorf("failed to parse projects: %w", err)
	}

	return projects, nil
}

func getProjectBySlug(token, slug string) (Project, error) {
	projects, err := getProjects(token)
	if err != nil {
		return Project{}, err
	}
	for _, p := range projects {
		if p.Slug == slug {
			return p, nil
		}
	}
	return Project{}, fmt.Errorf("project with slug %s not found", slug)
}

var projectCmd = &cobra.Command{
	Use:   "project",
	Short: "Manage projects: list, info, create, update",
	Long: `Manage your projects.

Commands:
  • list     List projects you belong to
  • info     Show project info by slug
  • create   Create a new project
  • update   Update an existing project by slug`,
}

var projectListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all projects you belong to",

	Run: func(cmd *cobra.Command, args []string) {
		token, err := config.LoadAuthToken()
		if err != nil {
			color.Red("Failed to load authentication token: %v", err)
			return
		}

		currentUserID, err := getCurrentUserID(token)
		if err != nil {
			color.Red("Failed to get current user ID: %v", err)
			return
		}

		projects, err := getProjects(token)
		if err != nil {
			color.Red("Failed to get projects: %v", err)
			return
		}
		if len(projects) == 0 {
			color.Yellow("You don't belong to any projects.")
			return
		}

		annotateProjectRoles(projects, currentUserID)

		color.Cyan("Projects you belong to:")
		for _, p := range projects {
			fmt.Printf("   %s %s\n", color.YellowString("Name:"), p.Name)
			fmt.Printf("   %s %s\n", color.YellowString("ID:"), p.ID)
			fmt.Printf("   %s %s\n", color.YellowString("Slug:"), p.Slug)
			if p.Role != "" {
				fmt.Printf("   %s %s\n", color.YellowString("Role:"), p.Role)
			}
			if p.Description != "" {
				fmt.Printf("   %s %s\n", color.YellowString("Description:"), p.Description)
			}
			fmt.Println()
		}
	},
}

var projectInfoCmd = &cobra.Command{
	Use:   "info",
	Short: "Show detailed info about a project",
	Args:  cobra.ExactArgs(1),

	Run: func(cmd *cobra.Command, args []string) {
		projectSlug := args[0]

		token, err := config.LoadAuthToken()
		if err != nil {
			color.Red("Failed to load authentication token: %v", err)
			return
		}

		currentUserID, err := getCurrentUserID(token)
		if err != nil {
			color.Red("Failed to get current user ID: %v", err)
			return
		}

		project, err := getProjectBySlug(token, projectSlug)
		if err != nil {
			color.Red("Failed to get project info: %v", err)
			return
		}

		annotateProjectRoles([]Project{project}, currentUserID)

		color.Cyan("Project Info:")
		fmt.Printf("   %s %s\n", color.YellowString("ID:"), project.ID)
		fmt.Printf("   %s %s\n", color.YellowString("Name:"), project.Name)
		fmt.Printf("   %s %s\n", color.YellowString("Slug:"), project.Slug)
		fmt.Printf("   %s %s\n", color.YellowString("Description:"), project.Description)
		if project.Role != "" {
			fmt.Printf("   %s %s\n", color.YellowString("Your Role:"), project.Role)
		}
	},
}

var projectCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a new project",

	Run: func(cmd *cobra.Command, args []string) {
		if projectCreateName == "" || projectCreateOrgID == "" {
			color.Red("Project name and organization ID are required.")
			cmd.Help()
			return
		}

		token, err := config.LoadAuthToken()
		if err != nil {
			color.Red("Failed to load authentication token: %v", err)
			return
		}

		bodyMap := map[string]string{
			"name":  projectCreateName,
			"orgId": projectCreateOrgID,
		}
		if projectCreateDescription != "" {
			bodyMap["description"] = projectCreateDescription
		}

		bodyJSON, _ := json.Marshal(bodyMap)
		resp, err := api.Post(token, "/projects", bodyJSON)
		if err != nil {
			color.Red("Failed to create project: %v", err)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
			color.Red("API error: %s", resp.Status)
			return
		}

		var respBody struct {
			Message    string  `json:"message"`
			NewProject Project `json:"newProject"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
			color.Red("Failed to decode response: %v", err)
			return
		}

		color.Green("Project created successfully!")
		fmt.Printf("ID: %s\nName: %s\nSlug: %s\nDescription: %s\n",
			respBody.NewProject.ID, respBody.NewProject.Name, respBody.NewProject.Slug, respBody.NewProject.Description)
	},
}

var projectUpdateCmd = &cobra.Command{
	Use:   "update",
	Short: "Update an existing project",

	Run: func(cmd *cobra.Command, args []string) {
		if projectUpdateSlug == "" {
			color.Red("Project slug is required.")
			cmd.Help()
			return
		}
		if projectUpdateName == "" {
			color.Red("Project name is required.")
			cmd.Help()
			return
		}

		token, err := config.LoadAuthToken()
		if err != nil {
			color.Red("Failed to load authentication token: %v", err)
			return
		}

		// Resolve slug to project ID
		project, err := getProjectBySlug(token, projectUpdateSlug)
		if err != nil {
			color.Red("Failed to find project by slug: %v", err)
			return
		}

		bodyMap := map[string]interface{}{
			"name": projectUpdateName,
		}
		if projectUpdateDescription != "" {
			bodyMap["description"] = projectUpdateDescription
		}

		bodyJSON, _ := json.Marshal(bodyMap)
		resp, err := api.Put(token, "/projects/"+project.ID, bodyJSON)
		if err != nil {
			color.Red("Failed to update project: %v", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			color.Red("API error: %s", resp.Status)
			return
		}

		var respBody struct {
			Message        string  `json:"message"`
			UpdatedProject Project `json:"updatedProject"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
			color.Red("Failed to decode response: %v", err)
			return
		}

		color.Green("Project updated successfully!")
		fmt.Printf("ID: %s\nName: %s\nSlug: %s\nDescription: %s\n",
			respBody.UpdatedProject.ID, respBody.UpdatedProject.Name, respBody.UpdatedProject.Slug, respBody.UpdatedProject.Description)
	},
}

func init() {
	projectCmd.AddCommand(projectListCmd)
	projectCmd.AddCommand(projectInfoCmd)

	projectCreateCmd.Flags().StringVarP(&projectCreateName, "name", "n", "", "Project name (required)")
	projectCreateCmd.Flags().StringVarP(&projectCreateOrgID, "org-id", "o", "", "Organization ID (required)")
	projectCreateCmd.Flags().StringVarP(&projectCreateDescription, "desc", "d", "", "Project description")
	projectCmd.AddCommand(projectCreateCmd)

	projectUpdateCmd.Flags().StringVarP(&projectUpdateSlug, "slug", "s", "", "Project slug (required)")
	projectUpdateCmd.Flags().StringVarP(&projectUpdateName, "name", "n", "", "New project name (required)")
	projectUpdateCmd.Flags().StringVarP(&projectUpdateDescription, "desc", "d", "", "New project description")
	projectCmd.AddCommand(projectUpdateCmd)

	rootCmd.AddCommand(projectCmd)
}
