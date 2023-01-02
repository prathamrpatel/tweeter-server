import { FieldError } from '../graphql/typeDefs/FieldError';
import { RegisterInput } from '../graphql/typeDefs/RegisterInput';

export function validateRegisterInput(registerInput: RegisterInput) {
  const { name, username, email, password, confirmPassword } = registerInput;
  const errors: FieldError[] = [];

  if (name.length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required',
    });
  }

  if (username.length === 0) {
    errors.push({
      field: 'username',
      message: 'Username is required',
    });
  }

  if (email.length === 0) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  } else {
    if (!email.includes('@')) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email',
      });
    }
  }

  // Change to 8 in production
  const required_length = process.env.NODE_ENV === 'production' ? 8 : 5;
  if (password.length < required_length) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 5 characters long',
    });
  } else {
    if (confirmPassword !== password) {
      errors.push({
        field: 'confirmPassword',
        message: 'Passwords do not match',
      });
    }
  }

  return errors.length > 0 ? errors : null;
}
