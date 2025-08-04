# SecretKeepR 🗝️

SecretKeepR is a secrets manager designed to help users and organizations securely manage and share environment variables. It provides access controls for managing projects, users, and encrypted secrets across multiple organizations. It also includes a command-line interface (CLI) for easy interaction with your secrets and projects.

For detailed instructions on building and using the command-line interface, see [`cli/README.md`](./cli/README.md).

[**Check it out!** 🔍](https://secretkeepr.vercel.app)

## 📦 Key Features

- **User Authentication:** Sign in with Google, GitHub, or GitLab accounts.
- **Multi-Tenant Architecture:** Support for multiple organizations, each with its own projects, members, and secrets.
- **Project-Based Secrets Management:** Create, manage, import, and export secrets within projects.
- **Role-Based Access Control:** Assign roles to members within organizations and control access to projects and secrets. Invite new members to your organization via the invitation system.
- **Audit Logs:** Track sensitive operations like secret changes and organization updates.
- **Encrypted Secrets:** Secrets are encrypted at rest and never exposed unencrypted beyond the UI.
- **CLI Integration:** Manage secrets and projects directly from your terminal with the command-line tool for SecretKeepR.

## 🛠️ Stack

- **Nuxt.js** with **Vue** composition API and **Nitro** server engine.
- **OAuth** authentication with Google, GitHub, or GitLab via **nuxt-auth-utils**.
- **Prisma** for **PostgreSQL** database management.
- **Pinia** for state management.
- **Zod** for schema validation.
- **TypeScript**.
- **ESLint**.
- **Tailwind CSS**.
- **Framer Motion** via **@vueuse/motion**.
- **Go** for CLI development using **Cobra**.
- **Vercel** for deployment, blob storage and website analytics.

## 📬 Contact

Feel free to reach out to discuss collaboration opportunities or to say hello!

- [**My Email**](mailto:matheus.felipe.19rt@gmail.com)
- [**My LinkedIn Profile**](https://www.linkedin.com/in/matheus-mortari-19rt)
- [**My GitHub Profile**](https://github.com/matimortari)
