import express from "express"
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import User from "./src/models/UserModel.js";
import routes from './src/routes/index.js';

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

app.use('/api', routes);



// In backend/server.js - add this temporary route
app.get('/test-scraper', async (req, res) => {
    try {
        const IndeedScraper = (await import('./src/services/scrapers/indeedScraper.js')).default;
        const scraper = new IndeedScraper();
        
        const jobs = await scraper.scrape({
            keywords: 'developer',
            location: 'Mumbai'
        });
        
        res.json({ 
            success: true, 
            jobCount: jobs.length, 
            jobs: jobs.slice(0, 10) // First 10 jobs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


connectDB();


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})