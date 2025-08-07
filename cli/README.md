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

This will create the `secretkeepr.exe` binary in the current directory. You can move it to a directory in your PATH for easier access.

## 📜 Commands

The following commands are available in the SecretKeepR CLI:

```bash
login # Open browser to authenticate and save token locally
whoami # Display currently authenticated user
projects # List your projects
projects --secrets <project-id> # View secrets in a project
projects --export-env --env <env> # Export secrets to a .env.<env> file
import --env <env> # Import secrets from a local .env file into a specific project
help # Display help information for the CLI
```
