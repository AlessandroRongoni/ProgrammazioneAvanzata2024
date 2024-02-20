import { Request, Response, NextFunction } from "express";
import { findUser } from "../db/queries/user_queries";
import { MessageFactory } from "../status/messages_factory";
import { CustomStatusCodes, Messages400 } from "../status/status_codes";
import { getJwtEmail } from "../utils/jwt_utils";

var statusMessage: MessageFactory = new MessageFactory();

const isNonNegativeNumber = (value: any): boolean => !isNaN(value) && value >= 0;
const isEmailValid = (email: string): boolean => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

export const checkTokensBody = async (req: Request, res: Response, next: NextFunction) => {
    const { tokens } = req.body;
    if (isNonNegativeNumber(tokens)) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, isNaN(tokens) ? Messages400.NotANumber : Messages400.NegativeTokens);
    }
};

export const checkPassword = (req: Request, res: Response, next: NextFunction) => {
    const password = req.body.password;
    const expression: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/i;

    if (password.length != 0) {
        if (isNaN(password)) {
            let checker: boolean = expression.test(password);
            if (checker) {
                next();
            } else {
                statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordCheck);
            }
        } else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.IsANumber);
        }
    } else {

        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordEmpty);
    }
};

export const checkPasswordMatch = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length != 0) {
        if (user[0].password == req.body.password) {
            next();
        } else {
            statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.PasswordNotMatch);
        }
        
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};

export const checkEmail = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
        return statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EmailEmpty);
    }
    if (isEmailValid(email)) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.EmailCheck);
    }
};

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length != 0) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};

export const checkUserNotRegistered = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await findUser(req.body.email);
    if (user.length == 0) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UnauthorizedUser);
    }
};

export const checkUserJwt = async (req: Request, res: Response, next: NextFunction) => {
    let jwtUserEmail = getJwtEmail(req);
    const user: any = await findUser(jwtUserEmail);
    if (user.length != 0) {
        next();
    } else {
        statusMessage.getStatusMessage(CustomStatusCodes.BAD_REQUEST, res, Messages400.UserNotFound);
    }
};
