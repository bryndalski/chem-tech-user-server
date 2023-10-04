import { CognitoLogin, ICognitoLoginInterface } from './cognitoLogin';

describe('Cognito login - function test', () => {
  describe('testing login and password match', () => {
    it.each(['admin', 'user', 'guest', 'system_admin', 'no_role'])(
      `token if login succeeded for user with role %s`,
      async (userType: string) => {
        const cognitoToken = await CognitoLogin({
          userType,
        } as ICognitoLoginInterface);
        expect(typeof cognitoToken).toBe('string');
      },
    );
  });
});
