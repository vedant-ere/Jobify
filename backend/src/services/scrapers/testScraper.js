// backend/src/services/scrapers/testScraper.js
import IndeedScraper from './indeedScraper.js';

const testIndeedScraper = async () => {
    console.log('🧪 Testing Indeed Scraper...\n');

    const scraper = new IndeedScraper();

    try {
        // Test 1: Simple search
        console.log('📋 Test 1: Basic job search');
        const jobs = await scraper.scrape({
            keywords: 'javascript developer',
            location: 'Mumbai'
        });

        if (jobs && jobs.length > 0) {
            console.log(`✅ SUCCESS: Found ${jobs.length} jobs`);
            console.log('\n📝 Sample jobs:');
            
            jobs.slice(0, 5).forEach((job, index) => {
                console.log(`${index + 1}. ${job.title}`);
            });
        } else {
            console.log('❌ FAILED: No jobs found');
        }

        // Show scraper stats
        console.log('\n📊 Scraper Stats:', scraper.getStats());

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

// Run test if file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testIndeedScraper();
}

export { testIndeedScraper };