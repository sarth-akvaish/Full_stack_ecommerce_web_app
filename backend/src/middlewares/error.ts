import { NextFunction, Request, Response } from "express";
import errorHandler from "../utils/utility-class";
import { controllerType } from "../types/types";

export const errorMiddleware = (
    err: errorHandler,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    err.message ||= "";
    err.statusCode ||= 500;

    if (err.name === 'CastError')
        err.message = "Invalid Id"

    return res.status(400).json({
        success: false,
        message: err.message,
    })
}


export const tryCatch = (func: controllerType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(func(req, res, next)).catch(next);
    }
}
// tryCatch()