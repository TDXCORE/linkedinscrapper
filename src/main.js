const Apify = require('apify');
const ScraperEngine = require('./core/scraper-engine');
const ExcelGenerator = require('./exporters/excel-generator');

Apify.main(async () => {
    console.log('Starting LinkedIn Profile Scraper Actor...');
    
    try {
        // Get input data
        const input = await Apify.getInput();
        
        // Validate required inputs
        if (!input || !input.profileUrls || !Array.isArray(input.profileUrls) || input.profileUrls.length === 0) {
            throw new Error('profileUrls is required and must be a non-empty array');
        }
        
        if (!input.geminiApiKey) {
            throw new Error('geminiApiKey is required for AI analysis');
        }
        
        if (!input.jigsawstackApiKey) {
            throw new Error('jigsawstackApiKey is required for proxy rotation');
        }
        
        console.log(`Processing ${input.profileUrls.length} LinkedIn profiles...`);
        
        // Initialize scraper engine
        const scraperEngine = new ScraperEngine({
            geminiApiKey: input.geminiApiKey,
            jigsawstackApiKey: input.jigsawstackApiKey,
            credentials: input.credentials,
            scrapingOptions: input.scrapingOptions || {},
            outputOptions: input.outputOptions || {}
        });
        
        // Process all profiles
        const results = [];
        for (let i = 0; i < input.profileUrls.length; i++) {
            const profileUrl = input.profileUrls[i];
            console.log(`[${i + 1}/${input.profileUrls.length}] Processing: ${profileUrl}`);
            
            try {
                const profileData = await scraperEngine.scrapeProfile(profileUrl);
                results.push(profileData);
                
                // Save to dataset
                if (input.outputOptions?.saveToDataset !== false) {
                    await Apify.pushData(profileData);
                }
                
                console.log(`✓ Successfully processed: ${profileData.profile?.name || 'Unknown'}`);
            } catch (error) {
                console.error(`✗ Error processing ${profileUrl}:`, error.message);
                results.push({
                    profileUrl,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Add delay between profiles to avoid rate limiting
            if (i < input.profileUrls.length - 1) {
                const delay = input.scrapingOptions?.delayBetweenRequests || 3000;
                console.log(`Waiting ${delay}ms before next profile...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        // Generate Excel report if requested
        if (input.outputOptions?.generateExcel !== false) {
            console.log('Generating Excel report...');
            try {
                const excelGenerator = new ExcelGenerator();
                const excelBuffer = await excelGenerator.generate(results);
                
                const fileName = input.outputOptions?.excelFileName || 
                                `linkedin_analysis_${new Date().toISOString().slice(0, 10)}.xlsx`;
                
                await Apify.setValue(fileName, excelBuffer, { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                console.log(`✓ Excel report saved: ${fileName}`);
            } catch (error) {
                console.error('Error generating Excel report:', error.message);
            }
        }
        
        // Summary
        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;
        
        console.log('\n=== SCRAPING SUMMARY ===');
        console.log(`Total profiles: ${results.length}`);
        console.log(`Successful: ${successful}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success rate: ${((successful / results.length) * 100).toFixed(1)}%`);
        
        // Save final summary to dataset
        await Apify.pushData({
            summary: {
                totalProfiles: results.length,
                successful,
                failed,
                successRate: (successful / results.length) * 100,
                processingTime: new Date().toISOString(),
                actorVersion: '1.0.0'
            }
        });
        
        console.log('LinkedIn Profile Scraper completed successfully!');
        
    } catch (error) {
        console.error('Actor failed:', error);
        throw error;
    }
});