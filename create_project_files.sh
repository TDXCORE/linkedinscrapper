#!/bin/bash

# Create src/utils/validators.js
cat > src/utils/validators.js << 'VALIDATORS_EOF'
const validateInput = (input) => {
  const errors = [];
  
  if (!input.profileUrls || input.profileUrls.length === 0) {
    errors.push('At least one LinkedIn profile URL is required');
  }
  
  if (input.profileUrls) {
    input.profileUrls.forEach((url, index) => {
      if (!isValidLinkedInUrl(url)) {
        errors.push(`Invalid LinkedIn URL at index ${index}: ${url}`);
      }
    });
  }
  
  if (!input.geminiApiKey || input.geminiApiKey.length < 20) {
    errors.push('Valid Gemini Pro 2.5 API key is required');
  }
  
  if (!input.jigsawstackApiKey || input.jigsawstackApiKey.length < 20) {
    errors.push('Valid JigsawStack API key is required');
  }
  
  return errors;
};

const isValidLinkedInUrl = (url) => {
  try {
    const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return regex.test(url);
  } catch (error) {
    return false;
  }
};

const parseCount = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  const cleaned = text.replace(/[^\d.,KMB]/gi, '');
  
  if (cleaned.includes('500+')) return 500;
  
  const multipliers = { 
    K: 1000, 
    M: 1000000, 
    B: 1000000000 
  };
  
  const match = cleaned.match(/([0-9.,]+)([KMB]?)/i);
  
  if (match) {
    const [, number, suffix] = match;
    const baseNumber = parseFloat(number.replace(/,/g, ''));
    
    if (isNaN(baseNumber)) return 0;
    
    return Math.floor(baseNumber * (multipliers[suffix?.toUpperCase()] || 1));
  }
  
  return 0;
};

const extractHashtags = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const hashtags = text.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/g) || [];
  return hashtags.map(tag => tag.toLowerCase());
};

const extractMentions = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const mentions = text.match(/@[a-zA-Z0-9._-]+/g) || [];
  return mentions.map(mention => mention.substring(1));
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
};

module.exports = {
  validateInput,
  isValidLinkedInUrl,
  parseCount,
  extractHashtags,
  extractMentions,
  sleep,
  retryWithBackoff
};
VALIDATORS_EOF

echo "Created src/utils/validators.js"

# Create example-input.json
cat > example-input.json << 'EXAMPLE_EOF'
{
  "profileUrls": [
    "https://www.linkedin.com/in/example-profile-1",
    "https://www.linkedin.com/in/example-profile-2"
  ],
  "credentials": {
    "email": "your-linkedin-email@example.com",
    "password": "your-linkedin-password"
  },
  "geminiApiKey": "your-gemini-pro-25-api-key-here",
  "jigsawstackApiKey": "your-jigsawstack-api-key-here",
  "scrapingOptions": {
    "maxPostsPerProfile": 100,
    "includeMediaUrls": true,
    "useAiAnalysis": true,
    "delayBetweenRequests": 3000
  },
  "outputOptions": {
    "generateExcel": true,
    "saveToDataset": true,
    "excelFileName": "linkedin_profile_analysis.xlsx"
  }
}
EXAMPLE_EOF

echo "Created example-input.json"

