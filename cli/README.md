# SecretKeepR CLI

The SecretKeepR CLI allows you to manage your projects and secrets directly from the terminal.

## Installation

You can build and install the CLI tool locally using Go. Make sure you have [Go 1.18](https://golang.org/dl) or later installed on your system, and [Git](https://git-scm.com/downloads) if you choose to build from source.

The CLI saves the authentication token locally using its internal configuration system after login.

### Option 1: Install directly via `go install`

```bash
go install github.com/matimortari/secretkeepr/cli@latest
```

Make sure your `GOPATH/bin` or Go bin directory is in your system's PATH.

### Option 2: Build from source

```bash
git clone https://github.com/matimortari/secretkeepr.git
cd secretkeepr/cli
go build -o secretkeepr.exe .
```

This will create the `secretkeepr.exe` executable in the current directory.

## Commands

- `login` Open the browser to authenticate and save your token locally.

- `whoami` Display the currently authenticated user.

- `projects` List your projects. Use --secrets <project-id> to view secrets in a project. Add --export-env and --env <env> to export secrets to a .env.<env> file.

- `import` Import secrets from a local .env file into a specific project environment.

- `help` Display help information for the CLI.
