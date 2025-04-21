import { 
  CommentInput, 
  DimensionScores, 
  LLMJustification, 
  LLMSettings,
  Score
} from '../models/types';

interface EvaluationRequest {
  comment: CommentInput;
  prompt: string;
  settings: LLMSettings;
}

interface EvaluationResponse {
  scores: DimensionScores;
  justifications: LLMJustification;
  // For debugging - the full request details
  debug?: {
    systemPrompt: string;
    userPrompt: string;
    fullRequest: any;
  };
}

// Function to generate a system prompt with evaluation instructions
const generateSystemPrompt = () => {
  return `
UX Dimensions:
- Attractiveness: Overall impression, likability, and visual appeal
- Efficiency: Speed, responsiveness, and ability to complete tasks quickly
- Perspicuity: Clarity, ease of learning, and understandability
- Dependability: Reliability, predictability, and stability
- Stimulation: Excitement, interest, and motivation to use
- Novelty: Innovation, creativity, and uniqueness

Respond with a JSON object in this exact format:
{
  "scores": {
    "attractiveness": number (-3 to 3),
    "efficiency": number (-3 to 3),
    "perspicuity": number (-3 to 3),
    "dependability": number (-3 to 3),
    "stimulation": number (-3 to 3),
    "novelty": number (-3 to 3)
  },
  "justifications": {
    "attractiveness": "brief justification",
    "efficiency": "brief justification",
    "perspicuity": "brief justification",
    "dependability": "brief justification",
    "stimulation": "brief justification",
    "novelty": "brief justification"
  }
}`;
};

// Function to call the OpenAI API
const callLLMAPI = async (
  request: EvaluationRequest
): Promise<EvaluationResponse> => {
  const { comment, prompt, settings } = request;
  
  if (!settings.apiKey) {
    throw new Error('API key is required');
  }
  
  try {
    // For real implementation, this would call the actual OpenAI API
    // Example with fetch:
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Generate the system prompt
    const systemPrompt = generateSystemPrompt();
    // Generate the user prompt
    const userPrompt = `${prompt}\n\nComment: "${comment.text}"\nRating: ${comment.stars}/5 stars\nUser: ${comment.name}\nDate: ${comment.date}`;
    
    // Create the full request body
    const requestBody = {
      model: settings.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: settings.temperature || 0.7,
      max_tokens: settings.maxTokens || 1000
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from API');
    }
    
    // Parse JSON response
    const evaluationData = JSON.parse(content) as EvaluationResponse;
    
    // Validate response format
    validateResponse(evaluationData);
    
    // Add debug information
    evaluationData.debug = {
      systemPrompt,
      userPrompt,
      fullRequest: requestBody
    };
    
    return evaluationData;
  } catch (error) {
    console.error('LLM API Error:', error);
    // Return fallback mock data if in development environment
    if (process.env.NODE_ENV === 'development') {
      return generateFallbackResponse(comment, prompt, settings);
    }
    throw error;
  }
};

// Validate that the response has the correct format
const validateResponse = (response: any): void => {
  if (!response.scores || !response.justifications) {
    throw new Error('Invalid response format: missing scores or justifications');
  }
  
  const dimensions = [
    'attractiveness', 
    'efficiency', 
    'perspicuity', 
    'dependability', 
    'stimulation', 
    'novelty'
  ];
  
  for (const dim of dimensions) {
    if (response.scores[dim] === undefined) {
      throw new Error(`Invalid response format: missing score for ${dim}`);
    }
    
    if (response.justifications[dim] === undefined) {
      throw new Error(`Invalid response format: missing justification for ${dim}`);
    }
    
    // Ensure scores are valid (-3 to 3) and explicitly cast to number
    let score = response.scores[dim];
    // Handle string score values which might come from API
    if (typeof score === 'string') {
      score = parseFloat(score);
    }
    
    // Ensure the score is within valid range and is an integer
    if (typeof score !== 'number' || isNaN(score) || score < -3 || score > 3 || !Number.isInteger(score)) {
      // Clamp and round the score to ensure it's within valid range
      response.scores[dim] = Math.max(-3, Math.min(3, Math.round(typeof score === 'number' ? score : 0))) as Score;
    } else {
      // Explicitly cast to Score type
      response.scores[dim] = score as Score;
    }
  }
};

// Generate a fallback response for development/testing
const generateFallbackResponse = (comment: CommentInput, prompt: string, settings: LLMSettings): EvaluationResponse => {
  // Create a mock response based on the star rating to make it somewhat realistic
  const starScoreMap: Record<number, number> = {
    1: -2,
    2: -1,
    3: 0,
    4: 1,
    5: 2
  };
  
  const baseScore = starScoreMap[comment.stars] || 0;
  
  // Add some variation
  const getScore = (): Score => {
    const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    return Math.max(-3, Math.min(3, baseScore + variation)) as Score;
  };
  
  const scores: DimensionScores = {
    attractiveness: getScore(),
    efficiency: getScore(),
    perspicuity: getScore(),
    dependability: getScore(),
    stimulation: getScore(),
    novelty: getScore()
  };
  
  const getSentiment = (score: number): string => {
    if (score >= 2) return 'very positive';
    if (score >= 1) return 'positive';
    if (score === 0) return 'neutral';
    if (score >= -2) return 'negative';
    return 'very negative';
  };
  
  const justifications: LLMJustification = {
    attractiveness: `The comment suggests a ${getSentiment(scores.attractiveness)} impression of the app's attractiveness.`,
    efficiency: `Based on the ${comment.stars}-star rating, the app's efficiency appears ${getSentiment(scores.efficiency)}.`,
    perspicuity: `The user finds the app ${getSentiment(scores.perspicuity)} in terms of clarity and understandability.`,
    dependability: `The comment indicates ${getSentiment(scores.dependability)} reliability and predictability.`,
    stimulation: `The user's interest and motivation to use the app is ${getSentiment(scores.stimulation)}.`,
    novelty: `The innovation and creativity of the app is rated as ${getSentiment(scores.novelty)}.`
  };
  
  // Generate the system prompt
  const systemPrompt = generateSystemPrompt();
  // Generate the user prompt
  const userPrompt = `${prompt}\n\nComment: "${comment.text}"\nRating: ${comment.stars}/5 stars\nUser: ${comment.name}\nDate: ${comment.date}`;
  
  // Create the full request body (for debugging)
  const requestBody = {
    model: settings.model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: settings.temperature || 0.7,
    max_tokens: settings.maxTokens || 1000
  };
  
  return { 
    scores, 
    justifications,
    debug: {
      systemPrompt,
      userPrompt,
      fullRequest: requestBody
    }
  };
};

// Evaluate multiple comments with a single prompt
export const evaluateComments = async (
  comments: CommentInput[],
  prompt: string,
  settings: LLMSettings
): Promise<EvaluationResponse[]> => {
  // Process each comment sequentially 
  // This could be made parallel but may hit API rate limits
  const results: EvaluationResponse[] = [];
  
  for (const comment of comments) {
    const result = await callLLMAPI({ comment, prompt, settings });
    results.push(result);
  }
  
  return results;
};

// Evaluate a single comment
export const evaluateComment = async (
  comment: CommentInput,
  prompt: string,
  settings: LLMSettings
): Promise<EvaluationResponse> => {
  return await callLLMAPI({ comment, prompt, settings });
};
