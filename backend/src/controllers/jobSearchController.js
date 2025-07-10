import { searchJobsTheirStack } from "../services/jobSearchService.js";

export const handleJobSearch = async (req, res) => {
    try {
        const filters = req.body;

        if (!filters.posted_at_max_age_days && !filters.posted_at_gte && !filters.company_name_or) {
            return res.status(400).json({ error: "At least one required filter must be provided." });
        }

        const jobs = await searchJobsTheirStack(filters)

        res.status(200).json(jobs)
    } catch(err){
        console.error("TheirStack job search failed", err.message)
        res.status(500).json({ error: 'Job search failed' });
    }
}