import { Character, DialogueTree, DialogueStep, DialogueOption } from './types';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class DialogueGenerator {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  private readonly systemPrompt = `JSON Dialogue Tree System Prompt
You are a branching narrative designer for a dialogue-based game. The player must sell a pen to a character by navigating a 5-step dialogue tree. The goal is to understand and adapt to the character's unique personality, communication style, and emotional needs.
You will be given a detailed character persona. Based on this, generate a 5-step interactive dialogue with the specified JSON structure.

🎭 YOUR TASK:

Begin with a brief internal monologue or description of the character's emotional state when approached by someone trying to sell them a pen. Frame this in their voice or perspective.
Construct a 5-step dialogue tree. At each step:

The player is presented with 3 dialogue options:

✅ One correct option: resonates with the character's values and communication style, and brings the player closer to making the sale.
❌ One mildly wrong option: tone-deaf or irrelevant.
❌ One very wrong option: alienates or frustrates the character.

Follow each option with the character's reaction/response and a signal of whether the sale is progressing or regressing.

Use the character's:
Personality traits
Communication style
Pain points and motivations
Social preferences and life experiences
Fears, quirks, and goals
to craft responses that feel authentic and emotionally reactive.

After the 5th step:
If the player consistently picked correct responses: return a short "Sale Success" ending showing the character accepting the pen.
If the player failed: return a "Sale Failed" ending where the character walks away or shuts down.

🧾 REQUIRED JSON OUTPUT FORMAT:
{
  "characterName": "Character Name",
  "characterInternalMonologue": "Brief internal monologue in character's voice",
  "steps": [
    {
      "stepNumber": 1,
      "characterInternalMonologue": "Character's thoughts at this step",
      "options": [
        {
          "text": "Player dialogue option",
          "type": "correct",
          "characterResponse": "Character's response",
          "saleProgress": "progress"
        },
        {
          "text": "Player dialogue option",
          "type": "mildly_wrong",
          "characterResponse": "Character's response",
          "saleProgress": "neutral"
        },
        {
          "text": "Player dialogue option",
          "type": "very_wrong",
          "characterResponse": "Character's response",
          "saleProgress": "regress"
        }
      ]
    }
  ],
  "successEnding": "Brief success ending",
  "failureEnding": "Brief failure ending"
}

IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.`;

  private log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private async callOpenAI(character: Character): Promise<string> {
    const userPrompt = `🔮 INPUT:
Character Persona:

${JSON.stringify(character, null, 2)}`;

    const fullPrompt = `${this.systemPrompt}\n\n${userPrompt}`;
    
    // Calculate token estimates
    const systemTokens = this.estimateTokens(this.systemPrompt);
    const userTokens = this.estimateTokens(userPrompt);
    const totalInputTokens = systemTokens + userTokens;
    
    this.log(`📊 Token Analysis for ${character.name}:`);
    this.log(`  System prompt tokens: ~${systemTokens}`);
    this.log(`  User prompt tokens: ~${userTokens}`);
    this.log(`  Total input tokens: ~${totalInputTokens}`);
    
    // Calculate safe max_tokens (leave room for response)
    const maxResponseTokens = Math.min(
      parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
      128000 - totalInputTokens - 100 // Leave 100 token buffer for 128K context window
    );
    
    this.log(`  Available response tokens: ~${maxResponseTokens}`);
    
    if (maxResponseTokens < 500) {
      this.log(`⚠️  WARNING: Very limited response tokens available. Consider reducing character data size.`);
    }

    try {
      this.log(`🚀 Making OpenAI API call for ${character.name}...`);
      
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
        max_tokens: maxResponseTokens
      });

      const response = completion.choices[0]?.message?.content;
      const usage = completion.usage;
      
      this.log(`✅ API Response received for ${character.name}:`);
      this.log(`  Prompt tokens used: ${usage?.prompt_tokens}`);
      this.log(`  Completion tokens used: ${usage?.completion_tokens}`);
      this.log(`  Total tokens used: ${usage?.total_tokens}`);
      
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      // Check for incomplete JSON
      const responseTokens = this.estimateTokens(response);
      this.log(`  Response length: ${response.length} characters (~${responseTokens} tokens)`);
      
      if (!response.trim().endsWith('}')) {
        this.log(`⚠️  WARNING: Response appears to be truncated. Last 50 chars: "${response.slice(-50)}"`);
      }

      return response;
    } catch (error) {
      this.log(`❌ OpenAI API error for ${character.name}:`);
      if (error instanceof Error) {
        this.log(`  Error message: ${error.message}`);
        
        // Check for specific token-related errors
        if (error.message.includes('maximum context length') || error.message.includes('8192') || error.message.includes('128000')) {
          this.log(`  🔧 SUGGESTION: This is a token limit error. Try reducing character data or using a shorter system prompt.`);
        }
        
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI API');
    }
  }

  private isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  private validateDialogueTree(data: any): data is DialogueTree {
    return (
      typeof data === 'object' &&
      typeof data.characterName === 'string' &&
      typeof data.characterInternalMonologue === 'string' &&
      Array.isArray(data.steps) &&
      data.steps.length === 5 &&
      typeof data.successEnding === 'string' &&
      typeof data.failureEnding === 'string' &&
      data.steps.every((step: any) => 
        typeof step.stepNumber === 'number' &&
        typeof step.characterInternalMonologue === 'string' &&
        Array.isArray(step.options) &&
        step.options.length === 3 &&
        step.options.every((option: any) =>
          typeof option.text === 'string' &&
          ['correct', 'mildly_wrong', 'very_wrong'].includes(option.type) &&
          typeof option.characterResponse === 'string' &&
          ['progress', 'regress', 'neutral'].includes(option.saleProgress)
        )
      )
    );
  }

  public async generateDialogueTree(character: Character, maxRetries: number = 2): Promise<DialogueTree> {
    let attempts = 0;
    let lastError: string = '';

    this.log(`🎭 Starting dialogue generation for ${character.name}`);

    while (attempts <= maxRetries) {
      try {
        this.log(`📝 Attempt ${attempts + 1} for ${character.name}`);
        
        const response = await this.callOpenAI(character);
        
        this.log(`🔍 Validating JSON response for ${character.name}...`);
        
        if (!this.isValidJSON(response)) {
          this.log(`❌ Invalid JSON response for ${character.name}:`);
          this.log(`  Response preview: ${response.substring(0, 200)}...`);
          throw new Error('Response is not valid JSON');
        }

        const dialogueData = JSON.parse(response);
        
        this.log(`🔍 Validating dialogue tree structure for ${character.name}...`);
        
        if (!this.validateDialogueTree(dialogueData)) {
          this.log(`❌ Invalid dialogue tree structure for ${character.name}:`);
          this.log(`  Received data:`, dialogueData);
          throw new Error('Dialogue tree structure is invalid');
        }

        this.log(`✅ Successfully generated dialogue tree for ${character.name}`);
        return dialogueData as DialogueTree;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        attempts++;
        
        this.log(`❌ Attempt ${attempts} failed for ${character.name}: ${lastError}`);
        
        if (attempts > maxRetries) {
          this.log(`💥 All ${maxRetries + 1} attempts failed for ${character.name}`);
          throw new Error(`Failed to generate dialogue tree after ${maxRetries + 1} attempts. Last error: ${lastError}`);
        }
        
        this.log(`⏳ Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    throw new Error('Unexpected error in dialogue generation');
  }

  public async generateAndSaveDialogueTree(character: Character): Promise<string> {
    try {
      this.log(`💾 Starting dialogue generation and save for ${character.name}`);
      
      const dialogueTree = await this.generateDialogueTree(character);
      
      // Add dialogue tree to character
      character.dialogueTree = dialogueTree;
      
      // Save updated character to file
      const charactersDir = path.join(__dirname, '..', '..', 'characters');
      if (!fs.existsSync(charactersDir)) {
        fs.mkdirSync(charactersDir, { recursive: true });
      }

      const sanitizedName = this.sanitizeFilename(character.name);
      const filename = `${sanitizedName}.json`;
      const filepath = path.join(charactersDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(character, null, 2), 'utf8');
      
      this.log(`✅ Successfully saved ${character.name} to ${filepath}`);
      return filepath;
    } catch (error) {
      this.log(`❌ Error generating and saving dialogue tree for ${character.name}: ${error}`);
      throw new Error(`Error generating and saving dialogue tree: ${error}`);
    }
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s/g, '_');
  }
} 