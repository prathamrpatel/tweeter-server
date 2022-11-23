import { FieldError } from '../graphql/typeDefs/FieldError';
import { RegisterInput } from '../graphql/typeDefs/RegisterInput';

export function validateLoginInput(usernameOrEmail: string, password: string) {
  const errors: FieldError[] = [];

  if (usernameOrEmail.length === 0) {
    errors.push({
      field: 'usernameOrEmail',
      message: 'Please enter your email or username',
    });
  }

  if (password.length === 0) {
    errors.push({
      field: 'password',
      message: 'Please enter your password',
    });
  }

  return errors.length > 0 ? errors : null;
}
