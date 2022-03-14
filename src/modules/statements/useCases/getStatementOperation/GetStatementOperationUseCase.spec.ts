import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from '../../entities/Statement'
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { AppError } from "../../../../shared/errors/AppError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase

describe("Get Statement Operation", () => {
    
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
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

        const statement = await createStatementUseCase.execute({
            user_id: token.user.id as string,
            type: OperationType.DEPOSIT,
            amount: 400,
            description: "R$ 400,00 deposit operation",
        });

        const operation = await getStatementOperationUseCase.execute({
            user_id: token.user.id as string,
            statement_id: statement.id as string

        });       
        
        expect(operation).toHaveProperty("id");
        expect(operation.type).toEqual("deposit");
        
    });

    it("Should not be able to get balance with a non-existing user", () => {
        expect(async () => {
            await getStatementOperationUseCase.execute({
                user_id: "notId",
                statement_id: "notId"
            });
        }).rejects.toBeInstanceOf(AppError)
    });

})