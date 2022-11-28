import { Resolver, Query, Ctx, Arg, Mutation } from 'type-graphql';
import { Context } from '../../types/Context';
import { Post } from '../typeDefs/Post';
import { RegisterInput } from '../typeDefs/RegisterInput';
import { User } from '../typeDefs/User';
import { UserResponse } from '../typeDefs/UserResponse';
import { validateRegisterInput } from '../../util/validateRegisterInput';
import { hash, verify } from 'argon2';
import { Prisma } from '@prisma/client';
import { validateLoginInput } from '../../util/validateLoginInput';

// Stop using prisma

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie('sid');

        if (err) {
          console.log(err);
          resolve(false);
        }

        resolve(true);
      });
    });
  }

  @Query(() => User, { nullable: true })
  async currentUser(@Ctx() { req, prisma }: Context): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
    });

    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req, prisma }: Context
  ): Promise<UserResponse> {
    const errors = validateLoginInput(usernameOrEmail, password);

    if (errors) {
      return { errors };
    }

    // Run query based on whether the user entered their email or username
    const user = await prisma.user.findUnique({
      where: usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'Could not find a user with that username or email',
          },
        ],
      };
    }

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password is incorrect',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() { req, prisma }: Context
  ): Promise<UserResponse> {
    const { name, username, email, password, confirmPassword } = registerInput;
    const errors = validateRegisterInput(registerInput);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await hash(password);

    let user: User | null = null;

    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          username,
          password: hashedPassword,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          // e.meta --> { target: ['fieldName'] }
          if ((e.meta as any).target[0] === 'username') {
            return {
              errors: [
                {
                  field: 'username',
                  message: 'That username is already taken',
                },
              ],
            };
          }

          if ((e.meta as any).target[0] === 'email') {
            return {
              errors: [
                {
                  field: 'email',
                  message: 'An account is already associated with that email',
                },
              ],
            };
          }
        }
      }

      throw e;
    }

    req.session.userId = user.id;

    return { user };
  }
}
