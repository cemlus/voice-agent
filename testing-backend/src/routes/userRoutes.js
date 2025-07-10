import { Router } from "express";

// import { User } from "../models/user.js"; // Adjust the path as necessary
import User from "../models/user.js"; // Fixed import

const userRouter = Router();

userRouter.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.post("/", async (req, res) => {
    const { userId, name, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({
            userId,
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        const newUser = new User({ userId, name, email, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.put("/:userId", async (req, res) => {
    const { userId } = req.params;
    const { name, email, password } = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { name, email, password },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.delete("/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const deletedUser = await User.findOneAndDelete({ userId });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;
