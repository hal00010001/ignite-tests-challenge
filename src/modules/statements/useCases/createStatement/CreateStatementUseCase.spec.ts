import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

import { OperationType } from "../../entities/Statement"
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase

describe("Create Statement", () => {

    beforeEach(() => {
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    });
    it("Should be able to create a deposit statement", async () => {
        const userData: ICreateUserDTO = {
            name: "User Name",
            email: "username@email.com",
            password: "1234567"
        }

        await createUserUseCase.execute(userData);

        const token = await authenticateUserUseCase.execute({
            email: userData.email,
            password: userData.password,
        })

        const statement = await createStatementUseCase.execute({
            user_id: token.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 400,
            description: "R$ 400,00 deposit operation",
        })

        expect(statement).toHaveProperty("id");
        expect(statement.amount).toEqual(400);
    });

    it("Should be able to create a withdraw statement", async () => {
        const userData: ICreateUserDTO = {
            name: "User Name",
            email: "username@email.com",
            password: "1234567"
        }

        await createUserUseCase.execute(userData);

        const token = await authenticateUserUseCase.execute({
            email: userData.email,
            password: userData.password,
        })

        const statement = await createStatementUseCase.execute({
            user_id: token.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 400,
            description: "R$ 400,00 deposit operation",
        })

        const withdraw = await createStatementUseCase.execute({
            user_id: token.user.id as string,
            type: OperationType.WITHDRAW,
            amount: 200,
            description: "R$ 200,00 withdraw operation",
        })

        expect(statement).toHaveProperty("id");
        expect(withdraw).toHaveProperty("id");
        expect(withdraw.amount).toEqual(200);
    });

    it("Should be able to make a transfer to another user", async () => {
        const userData1: ICreateUserDTO = {
            name: "User Name 1",
            email: "username1@email.com",
            password: "1234567"
        }
        
        const userData2: ICreateUserDTO = {
            name: "User Name 2",
            email: "username2@email.com",
            password: "1234567"
        }

        await createUserUseCase.execute(userData1);
        await createUserUseCase.execute(userData2);

        const token1 = await authenticateUserUseCase.execute({
            email: userData1.email,
            password: userData1.password,
        });

        const token2 = await authenticateUserUseCase.execute({
            email: userData2.email,
            password: userData2.password,
        });

        const statementUser1 = await createStatementUseCase.execute({
            user_id: token1.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 400,
            description: "R$ 400,00 deposit operation",
        })

        const withdrawUser1 = await createStatementUseCase.execute({
            user_id: token1.user.id as string,
            type: OperationType.WITHDRAW,
            amount: 100,
            description: "R$ 100,00 withdraw operation",
        })

        const statementUser2 = await createStatementUseCase.execute({
            user_id: token2.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 100,
            description: "R$ 100,00 deposit operation",
        })

        expect(statementUser1).toHaveProperty("id");
        expect(withdrawUser1).toHaveProperty("id");
        expect(statementUser2).toHaveProperty("id");
        expect(withdrawUser1.amount).toEqual(100);
        expect(statementUser2.amount).toEqual(100);
    });

    it("Should not be able to create a deposit statement with a non-existing user", () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "notId",
                type: OperationType.DEPOSIT,
                amount: 400,
                description: "R$ 400,00 deposit operation",
            })
        }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not be able to create a withdraw statement with a non-existing user", () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "notId",
                type: OperationType.WITHDRAW,
                amount: 400,
                description: "R$ 400,00 deposit operation",
            })
        }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not be able to create a withdraw statement when the user doesn't have funds", () => {
        expect(async () => {
            const userData: ICreateUserDTO = {
                name: "User Name",
                email: "username@email.com",
                password: "1234567"
            }
    
            await createUserUseCase.execute(userData);
    
            const token = await authenticateUserUseCase.execute({
                email: userData.email,
                password: userData.password,
            })
    
            await createStatementUseCase.execute({
                user_id: token.user.id as string,
                type: OperationType.DEPOSIT,
                amount: 100,
                description: "R$ 400,00 deposit operation",
            })

            await createStatementUseCase.execute({
                user_id: token.user.id as string,
                type: OperationType.WITHDRAW,
                amount: 400,
                description: "R$ 400,00 deposit operation",
            })
        }).rejects.toBeInstanceOf(AppError)
    });

})