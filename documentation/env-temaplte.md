# Environment Variables Template

This is a template for configuring environment variables in your application.

## Table of Contents

- [Environment Variables Template](#environment-variables-template)
  - [Table of Contents](#table-of-contents)
    - [Port](#port)
    - [AWS Cognito Configuration](#aws-cognito-configuration)
      - [AWS Cognito Client ID](#aws-cognito-client-id)
      - [AWS Cognito Authority](#aws-cognito-authority)
    - [AWS Configuration](#aws-configuration)
      - [AWS Secret Access Key](#aws-secret-access-key)
      - [AWS Access Key ID](#aws-access-key-id)
      - [AWS Default Region](#aws-default-region)
      - [AWS Cognito User Pool ID](#aws-cognito-user-pool-id)

### Port

- Description: Server port. The default recommended value is `3001`.
- Expected Type: `number`

### AWS Cognito Configuration

#### AWS Cognito Client ID

- Description: The client ID for AWS Cognito.
- Example: `your-cognito-client-id`

#### AWS Cognito Authority

- Description: The authority URL for AWS Cognito.
- Example: `https://cognito-idp.AWS_DEFAULT_REGION.amazonaws.com/AWS_COGNITO_USER_POOL_ID`

### AWS Configuration

#### AWS Secret Access Key

- Description: The secret access key for AWS.
- Example: `your-secret-access-key`

#### AWS Access Key ID

- Description: The access key ID for AWS.
- Example: `your-access-key-id`

#### AWS Default Region

- Description: The default AWS region.
- Example: `us-east-1`

#### AWS Cognito User Pool ID

- Description: The user pool ID for AWS Cognito.
- Example: `your-cognito-user-pool-id`
