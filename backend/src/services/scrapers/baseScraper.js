import axios from 'axios';

class BaseScraper {
    constructor(sourceName, options = {}) {
        this.sourceName = sourceName;
        this.baseURL = options.baseURL || '';
        this.rateLimit = options.rateLimit || 1000; // ms between requests
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 10000;
        
        this.lastRequestTime = 0;
        this.requestCount = 0;
    }

    // Template method - subclasses implement these
    async fetchJobData(query) {
        throw new Error('fetchJobData must be implemented by subclass');
    }

    parseJobData(rawData) {
        throw new Error('parseJobData must be implemented by subclass');
    }

    // Core scraping workflow
    async scrape(query) {
        try {
            await this.enforceRateLimit();
            const rawData = await this.fetchJobData(query);
            return this.parseJobData(rawData);
        } catch (error) {
            console.error(`[${this.sourceName}] Scraping failed:`, error.message);
            throw error;
        }
    }

    // Rate limiting
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimit) {
            await this.sleep(this.rateLimit - timeSinceLastRequest);
        }
        
        this.lastRequestTime = Date.now();
        this.requestCount++;
    }

    // HTTP request with retry logic
    async makeRequest(url, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await axios({
                    url,
                    timeout: this.timeout,
                    ...options
                });
                return response.data;
            } catch (error) {
                lastError = error;
                
                if (attempt < this.maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.log(`[${this.sourceName}] Retry ${attempt} in ${delay}ms`);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }

    // Utility methods
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStats() {
        return {
            source: this.sourceName,
            requestCount: this.requestCount,
            lastRequest: new Date(this.lastRequestTime)
        };
    }
}

export default BaseScraper;