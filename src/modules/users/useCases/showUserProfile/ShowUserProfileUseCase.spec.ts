/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to show the user's profile", async () => {
    const userData: ICreateUserDTO = {
      name: "user name",
      email: "username@email.com",
      password: "1234567",
    };

    await createUserUseCase.execute(userData);

    const token = await authenticateUserUseCase.execute({
      email: userData.email,
      password: userData.password,
    });

    const profile = await showUserProfileUseCase.execute(
      token.user.id as string
    );

    expect(profile).toHaveProperty("id");
  });

  it("Should not be able to show the profile from a non-existing user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("notId");
    }).rejects.toBeInstanceOf(AppError);
  });
});
