import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

export type AIProvider = 'gemini' | 'openrouter' | 'groq'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

class GeminiProvider {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async complete(messages: AIMessage[], model: string = 'gemini-2.0-flash-exp'): Promise<AIResponse> {
    const genAI = this.client.getGenerativeModel({ model })

    // Combine messages into a single prompt for Gemini
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n')

    const result = await genAI.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return {
      content: text,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      }
    }
  }
}

class OpenRouterProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'AI Todo App',
      },
    })
  }

  async complete(messages: AIMessage[], model: string = 'openai/gpt-4o-mini'): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content,
      })),
    })

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    }
  }
}

class GroqProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey,
    })
  }

  async complete(messages: AIMessage[], model: string = 'llama-3.3-70b-versatile'): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
        content: m.content,
      })),
    })

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    }
  }
}

export class AIService {
  private provider: GeminiProvider | OpenRouterProvider | GroqProvider

  constructor(provider: AIProvider, apiKey: string) {
    switch (provider) {
      case 'gemini':
        this.provider = new GeminiProvider(apiKey)
        break
      case 'openrouter':
        this.provider = new OpenRouterProvider(apiKey)
        break
      case 'groq':
        this.provider = new GroqProvider(apiKey)
        break
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }

  async complete(messages: AIMessage[], model?: string): Promise<AIResponse> {
    return this.provider.complete(messages, model)
  }
}

// Factory function to create AI service with environment variables
export function createAIService(
  provider?: AIProvider,
  customApiKey?: string,
  model?: string
): AIService | null {
  const selectedProvider = provider || (process.env.GEMINI_API_KEY ? 'gemini' :
                                         process.env.OPENROUTER_API_KEY ? 'openrouter' :
                                         process.env.GROQ_API_KEY ? 'groq' : null)

  if (!selectedProvider) {
    return null
  }

  const apiKey = customApiKey ||
                 (selectedProvider === 'gemini' ? process.env.GEMINI_API_KEY :
                  selectedProvider === 'openrouter' ? process.env.OPENROUTER_API_KEY :
                  selectedProvider === 'groq' ? process.env.GROQ_API_KEY : '')

  if (!apiKey) {
    return null
  }

  return new AIService(selectedProvider, apiKey)
}
