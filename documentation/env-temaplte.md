# Template for env file

```
PORT=3001
AWS_COGNITO_CLIENT_ID
AWS_COGNITO_AUTHORITY
PREFIX=/api

```

1. Table of contents
   - [Port](#port)
   - [Prefix](#prefix)
   - [AWS_COGNITO_CLIENT_ID](#aws_cognito_client_id)
   - [AWS_COGNITO_AUTHORITY](#aws_cognito_authority)

### Port

Server port. Default recomanded value is `3001`

Expected type: `number`

### AWS_COGNITO_CLIENT_ID

Aws client id. Can be creaded in cognito console

Expected type: `string`

### AWS_COGNITO_AUTHORITY

Aws authority. Can be creaded in cognito console

Expected type: `string`

### Prefix

indicates API prefix. For example for prefix `/api` and endpoint `/users` the full endpoint will be `/api/v1/users`
