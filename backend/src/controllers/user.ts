import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { newUserRequest } from "../types/types";
import { tryCatch } from "../middlewares/error";
import errorHandler from "../utils/utility-class";

export const newUser = tryCatch(
    async (
        req: Request<{}, {}, newUserRequest>,
        res: Response,
        next: NextFunction
    ) => {
        const { name, email, photo, _id, dob, gender } = req.body;

        let user = await User.findById(_id);
        if (user) return res.status(200).json({
            success: true,
            message:`Welcome ${user.name}`

        })

        if (!_id || !name || !email || !photo || !gender || !dob) {
            return next(new errorHandler('Please add all fields', 400))
        }
        user = await User.create({
            name, email, photo, _id, dob, gender
        })

        return res.status(201).json({
            success: true,
            message: `Welcome ${user.name}`
        })
    }
)

export const getAllUsers = tryCatch(
    async (req, res, next) => {
        const users = await User.find({});
        return res.status(200).json({
            success: true,
            users,
        })
    }
)

export const getUser = tryCatch(
    async (req, res, next) => {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) return next(new errorHandler('Invalid Id', 400))

        return res.status(200).json({
            success: true,
            message:`Welcome Back ${user.name}`,
            user,
        })
    })


export const deleteUser = tryCatch(
    async (req, res, next) => {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) return next(new errorHandler('Invalid Id', 400))

        await user.deleteOne();
        return res.status(200).json({
            success: true,
            message: 'User deleted !'
        })
    })