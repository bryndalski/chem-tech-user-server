<h1 style="text-align:center">Labb app project - user server</h1>

### Table of contents

- [Table of contents](#table-of-contents)
- [Documentation](#documentation)
- [Description](#description)
- [Installation - development](#installation---development)
- [Installation - tests](#installation---tests)

### Documentation

- [Template for env file](documentation/env-temaplte.md)
- [User roles](documentation/user-roles.md)
- [User server API](documentation/user-server-api.md)
- [User server API - admin](documentation/user-server-api-admin.md)

❗️ **Remember - server is also equiped with build-in swagger documentation. You can access it by going to `/api/v1/docs` endpoint.**

### Description

This is a user server for labb app project. It is a part of backend architecture responsible for user management.

### Installation - development

1. Clone repository
2. Install dependencies `npm install` inside `server` directory
3. Create `.env` file in `docker` directory
4. Run `npm run start`

### Installation - tests

1. Clone repository
2. Install dependencies `npm install` inside `server` directory
3. Create `.env.test` file in `docker` directory
4. Run `npm run test`

Project supports test driven development. Tests are written in `jest` libraries.

**❗️ Please remember, you can not send request to test server. In order to send request to user server please follow [development instalation](#installation---development)**
