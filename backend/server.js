import express from "express"
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import User from "./src/models/UserModel.js";
import userController from "../backend/src/controllers/userController.js";

dotenv.config();
const app = express();
app.use(express.json());


app.post("/test-user", async (req, res) => {

    try {
        const testUser = new User({
            email: "test@example11212.com",
            password: "test-password",
            profile: {
                firstName: "test-name",
                lastName: "test-lastname"
            },
            skills: [{
                skillName: "Javascript",
                proficiency: 4,
                category: "technical"
            }]
        })

        const savedUser = await testUser.save();
        res.json({ message: "User created!", user: savedUser })

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})
app.get("/health", (req, res) => {
    res.send("Server is running");
})

app.post("/register", userController.register)
app.post("/login", userController.login)


connectDB();


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})