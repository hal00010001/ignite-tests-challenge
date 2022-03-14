import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { OperationType } from '../../entities/Statement'
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase

describe("Get Balance", () => {
    
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    })

    it("Should be able to get balance", async () => {
        
        const userData: ICreateUserDTO = {
            name: "User Name",
            email: "username@email.com",
            password: "1234567"
        }

        await createUserUseCase.execute(userData);

        const token = await authenticateUserUseCase.execute({
            email: userData.email,
            password: userData.password
        });

        await createStatementUseCase.execute({
            user_id: token.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 400,
            description: "R$ 400,00 deposit operation",
        });

        const wallet = await getBalanceUseCase.execute({
            user_id: token.user.id as string
        })

        expect(wallet).toHaveProperty("balance");
        expect(wallet.balance).toEqual(400);
        
    });

    it("Should not be able to get balance with a non-existing user", () => {
        expect(async () => {
            await getBalanceUseCase.execute({
                user_id: "notId"
            });
        }).rejects.toBeInstanceOf(AppError)
    });

})