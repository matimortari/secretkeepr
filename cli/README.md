# SecretKeepR CLI 🕵️‍♂️

The SecretKeepR CLI allows you to manage your projects and secrets directly from the terminal.

## 🔧 Installation

You can build and install the CLI tool locally using Go. Make sure you have the following prerequisites:

- [Go 1.18+](https://golang.org/dl)
- [Git](https://git-scm.com/downloads) (if building from source)
- A valid [SecretKeepR](https://secretkeepr.vercel.app) account

The CLI saves the authentication token locally using its internal configuration system after login. Make sure your `GOPATH/bin` or Go bin directory is in your system's PATH.

### Option 1: Install directly via `go install`

```bash
go install github.com/matimortari/secretkeepr/cli@latest
```

### Option 2: Build from source

```bash
git clone https://github.com/matimortari/secretkeepr.git
cd secretkeepr/cli
go build -o secretkeepr.exe .
```

This will create the `secretkeepr.exe` binary in the current directory.

## 📜 Commands

The following commands are available in the SecretKeepR CLI:

```bash
secretkeepr login # Authenticate with your SecretKeepR account
secretkeepr whoami # Display currently authenticated user
secretkeepr project # Manage projects
secretkeepr import # Import secrets from a local file into a project
secretkeepr export # Export secrets from a project into a local file
secretkeepr run # Run a command with secrets from a project environment
```

### Project Commands

```bash
secretkeepr project list-all # List all projects you belong to
secretkeepr project list # Alias for list-all
secretkeepr project create -n <name> -o <orgId> -d <description> # Create a new project
secretkeepr project update -s <slug> -n <newName> -d <newDescription> # Update an existing project
```

#### Project Command Flags

```bash
-n, --name   Name of the project (required for create and update)
-o, --org-id Organization ID (required for create)
-d, --desc   Project description (optional)
-s, --slug   Project slug (required for update)
```

### Import Command

```bash
secretkeepr import --project <projectSlug> --env <environment> --file <filePath> # Import secrets from a file into a specified project and environment
```

#### Import Command Flags

```bash
-p, --project  Project slug to import secrets from (required)
-e, --env      Environment to import secrets from (optional, default: development)
-f, --file     Path to save .env file (optional, default: .env)
```

### Export Command

```bash
secretkeepr export --project <projectSlug> --env <environment> --file <filePath> # Export secrets to a file from a specified project and environment
```

#### Export Command Flags

```bash
-p, --project  Project slug to upload secrets to (required)
-e, --env      Environment for the secrets (optional, default: development)
-f, --file     Path to local .env file (optional, default: .env)
```

### Run Command

```bash
secretkeepr run --project <projectSlug> --env <environment> -- <command> # Run a terminal command with secrets injected from a project environment
```

#### Run Command Flags

```bash
-p, --project  Project slug to fetch secrets from (required)
-e, --env      Environment to fetch secrets from (optional, default: development)
--             Separator before the command to run (required)
```
