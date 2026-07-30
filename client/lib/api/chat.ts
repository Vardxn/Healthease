/**
 * API client for interacting with the HealthEase AI Chat backend
 */

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  msg?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Sends a message to the AI Chat endpoint
 */
export async function askQuestion(message: string, history: ChatMessagePayload[]): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real app, you would pass the JWT token here
        'Authorization': `Bearer demo-token-placeholder`
      },
      body: JSON.stringify({
        message,
        conversationHistory: history
      })
    });

    const data: ChatResponse = await response.json();

    if (!data.success) {
      throw new Error(data.msg || 'Failed to get response from AI');
    }

    return data.reply || 'Sorry, I am unable to process that right now.';
  } catch (error: any) {
    console.error('API Chat Error:', error);
    throw new Error(error.message || 'Network error occurred');
  }
}
