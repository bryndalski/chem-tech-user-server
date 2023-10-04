import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

export interface ICognitoLoginInterface {
  userType: 'admin' | 'user' | 'guest' | 'system_admin' | 'no_role';
}

export const CognitoLogin = async ({
  userType = 'no_role',
}: ICognitoLoginInterface) =>
  new Promise((resolve) => {
    const userPool = new CognitoUserPool({
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
    });

    const cognitoUser = new CognitoUser({
      Username: `${process.env.AWS_COGNITO_FAKE_USER_LOGIN}_${userType}@test.com`,
      Pool: userPool,
    });

    const authenticationDetails = new AuthenticationDetails({
      Username: `${process.env.AWS_COGNITO_FAKE_USER_LOGIN}_${userType}@test.com`,
      Password: process.env.AWS_COGNITO_FAKE_USER_PASSWORD,
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve(session.getAccessToken().getJwtToken());
      },
      onFailure: (err: any) => {
        // eslint-disable-next-line no-console
        console.log(err);
        resolve(err);
      },
    });
  });
