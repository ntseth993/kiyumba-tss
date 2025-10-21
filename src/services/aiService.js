// AI Service for handling multiple AI provider integrations

// API Configuration
const AI_CONFIGS = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro'
  },
  chatgpt: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  },
  claude: {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-sonnet-20240229'
  }
};

/**
 * Call Google Gemini API
 */
async function callGeminiAPI(message, conversationHistory = []) {
  const config = AI_CONFIGS.gemini;
  
  if (!config.apiKey) {
    return getFallbackResponse('gemini', message);
  }

  try {
    const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return getFallbackResponse('gemini', message);
  }
}

/**
 * Call ChatGPT API
 */
async function callChatGPTAPI(message, conversationHistory = []) {
  const config = AI_CONFIGS.chatgpt;
  
  if (!config.apiKey) {
    return getFallbackResponse('chatgpt', message);
  }

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI study assistant for students. Provide clear, educational responses.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    return getFallbackResponse('chatgpt', message);
  }
}

/**
 * Call Claude API
 */
async function callClaudeAPI(message, conversationHistory = []) {
  const config = AI_CONFIGS.claude;
  
  if (!config.apiKey) {
    return getFallbackResponse('claude', message);
  }

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: message
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    return getFallbackResponse('claude', message);
  }
}

/**
 * Fallback responses when API is not configured or fails
 */
function getFallbackResponse(provider, message) {
  const responses = {
    gemini: `Hello! I'm Google Gemini AI. You asked: "${message}"\n\nI'm currently in demo mode. To enable full functionality, please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.\n\nIn the meantime, I can help you with:\n• Explaining concepts\n• Solving problems\n• Homework assistance\n• Study tips\n\nHow can I assist you today?`,
    
    chatgpt: `Hi! I'm ChatGPT. You mentioned: "${message}"\n\nI'm currently in demo mode. To enable full ChatGPT functionality, add your OpenAI API key to the .env file as VITE_OPENAI_API_KEY.\n\nI'm designed to help with:\n• Academic questions\n• Writing assistance\n• Problem-solving\n• Learning support\n\nWhat would you like to know?`,
    
    claude: `Hello! I'm Claude by Anthropic. Regarding: "${message}"\n\nI'm currently in demo mode. To unlock full capabilities, add your Claude API key to the .env file as VITE_CLAUDE_API_KEY.\n\nI can assist with:\n• Detailed explanations\n• Critical thinking\n• Academic research\n• Thoughtful discussions\n\nHow may I help you?`
  };

  return responses[provider] || "I'm here to help! What would you like to know?";
}

/**
 * Main function to get AI response
 */
export async function getAIResponse(message, provider = 'gemini', conversationHistory = []) {
  if (!message || !message.trim()) {
    return "Please provide a message for me to respond to.";
  }

  try {
    switch (provider) {
      case 'gemini':
        return await callGeminiAPI(message, conversationHistory);
      
      case 'chatgpt':
        return await callChatGPTAPI(message, conversationHistory);
      
      case 'claude':
        return await callClaudeAPI(message, conversationHistory);
      
      default:
        return getFallbackResponse(provider, message);
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    return "I apologize, but I encountered an error. Please try again or select a different AI provider.";
  }
}

/**
 * Check if API key is configured for a provider
 */
export function isAPIConfigured(provider) {
  return !!AI_CONFIGS[provider]?.apiKey;
}

/**
 * Get available AI providers
 */
export function getAvailableProviders() {
  return Object.keys(AI_CONFIGS).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    configured: isAPIConfigured(key)
  }));
}

export default {
  getAIResponse,
  isAPIConfigured,
  getAvailableProviders
};
