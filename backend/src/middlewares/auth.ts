import { User } from "../models/user";
import errorHandler from "../utils/utility-class";
import { tryCatch } from "./error";

export const adminOnly = tryCatch(
    async (req, res, next) => {
        const { id } = req.query

        if (!id) return next(new errorHandler("Login first please", 401));

        const user = await User.findById(id)
        if (!user)
            return next(new errorHandler('Invalid ID', 401))

        if (user.role !== 'admin')
            return next(new errorHandler('You are not Admin', 401))

        next();
    })