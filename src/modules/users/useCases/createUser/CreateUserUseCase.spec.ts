/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "username",
      password: "1234",
      email: "username@email.com",
    });
    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a user if the email already exist", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "username1",
        password: "1234",
        email: "username@email.com",
      });

      await createUserUseCase.execute({
        name: "username2",
        password: "1234567",
        email: "username@email.com",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
