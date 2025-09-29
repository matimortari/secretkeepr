<div align="center">
<h1>
    <img src="public/logo-full-dark.png" alt="Logo" width="300" />
</h1>

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=matimortari_secretkeepr&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=matimortari_secretkeepr)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=matimortari_secretkeepr&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=matimortari_secretkeepr)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=matimortari_secretkeepr&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=matimortari_secretkeepr)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat&colorA=0d1117)](https://opensource.org/licenses/MIT)
[![Follow on GitHub](https://img.shields.io/github/followers/matimortari?label=Follow&style=social)](https://github.com/matimortari)

**SecretKeepR** is a secrets manager designed to help users and organizations **securely manage and share environment variables**. It provides access controls for managing projects, users, and encrypted secrets across multiple organizations. It also includes a **command-line interface** for easy interaction with your secrets and projects.

For CLI usage and setup, see the [CLI documentation](./cli/README.md).

[**Check it out!** 🔍](https://secretkeepr.vercel.app)

</div>

## 📦 Key Features

- **User Authentication:** Sign in with Google, GitHub, or GitLab accounts.
- **Multi-Tenant Architecture:** Support for multiple organizations, each with its own projects, members, and secrets.
- **Project-Based Secrets Management:** Create, manage, import, and export secrets within projects.
- **Role-Based Access Control:** Assign roles to members within organizations and control access to projects and secrets. Invite new members via the invitation system.
- **Audit Logs:** Track sensitive operations like secret changes and organization updates.
- **Encrypted Secrets:** Secrets are encrypted at rest and never exposed unencrypted beyond the UI.
- **CLI Integration:** Manage secrets and projects directly from your terminal with the SecretKeepR CLI.
- **Theme Toggle:** Switch between light and dark modes to suit your preference.

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

---

## 📄 License

MIT License

Copyright (c) 2025 Matheus Mortari

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
