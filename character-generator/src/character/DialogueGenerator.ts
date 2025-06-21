import { DetailedCharacter, DialogueTree, DialogueStep, DialogueOption } from '../types';
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

🎭 YOUR TASK:

IMPORTANT: Focus on SPECIFIC character traits, not generic personality types. Use concrete details from their background, skills, relationships, quirks, and life experiences.

🔍 CHARACTER ANALYSIS APPROACH:
- Pick 2-3 specific character traits to focus on (e.g., their childhood trauma, specific fears, unique skills, relationship issues, or distinctive quirks)
- Use their exact communication style, decision-making patterns, and social preferences
- Reference their specific life events, motivations, and secrets
- Incorporate their actual catchphrases, goals, and conflicts

Begin with a brief internal monologue that reflects the character's specific emotional state and background when approached by someone trying to sell them a pen.

Construct a 5-step dialogue tree where each step focuses on different aspects of the character's unique persona:

The player is presented with 3 dialogue options:

✅ CORRECT option: Subtly resonates with the character's specific values, background, or communication style. Should NOT be obvious - it should feel like a natural, empathetic response that shows understanding of their unique situation.

❌ MILDLY WRONG option: Tone-deaf or misses the mark slightly. Could be too generic, ignores their specific background, or uses the wrong communication approach for their personality.

❌ VERY WRONG option: Completely alienates the character by contradicting their core values, triggering their fears, or ignoring their specific life experiences.

🎯 DIALOGUE FOCUS AREAS (choose different ones for each step):
- Step 1: Their current emotional state and immediate reaction
- Step 2: Their background/life experiences and how it affects their perspective
- Step 3: Their specific fears, motivations, or goals
- Step 4: Their communication style and social preferences
- Step 5: Their unique quirks, catchphrases, or distinctive personality traits

💡 OPTION DESIGN PRINCIPLES:
- Make the "correct" option subtle and character-specific, not obviously "salesy"
- The correct option should feel like a natural, empathetic response that shows deep understanding of their unique situation
- Wrong options should sound reasonable but miss subtle character-specific cues
- Use the character's actual language patterns, catchphrases, and communication style
- Reference their specific background, skills, relationships, or life events
- Make wrong options feel plausible but miss the mark in character-specific ways
- Avoid obvious "good vs bad" choices - all options should sound reasonable to someone who doesn't know the character well
- The correct choice should require understanding of their specific fears, motivations, or life experiences

🧾 REQUIRED JSON OUTPUT FORMAT:
{
  "characterName": "Character Name",
  "characterInternalMonologue": "Brief internal monologue reflecting their specific background and current state",
  "steps": [
    {
      "stepNumber": 1,
      "characterInternalMonologue": "Character's specific thoughts based on their unique traits",
      "options": [
        {
          "text": "Player dialogue option",
          "type": "correct",
          "characterResponse": "Character's response using their specific communication style",
          "saleProgress": "progress"
        },
        {
          "text": "Player dialogue option",
          "type": "mildly_wrong",
          "characterResponse": "Character's response showing slight disconnect",
          "saleProgress": "neutral"
        },
        {
          "text": "Player dialogue option",
          "type": "very_wrong",
          "characterResponse": "Character's response showing major disconnect",
          "saleProgress": "regress"
        }
      ]
    }
  ],
  "successEnding": "Brief success ending reflecting their specific personality",
  "failureEnding": "Brief failure ending reflecting their specific personality"
}

IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.`;

  private log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    if (data) {
      // Data logging removed
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private async callOpenAI(character: DetailedCharacter): Promise<string> {
    const focusedSummary = this.createFocusedCharacterSummary(character);
    const optionGuidance = this.getDialogueOptionGuidance(character);
    const userPrompt = `🔮 INPUT:
Character Persona:

${focusedSummary}

${optionGuidance}

FULL CHARACTER DATA (for reference):
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

  public async generateDialogueTree(character: DetailedCharacter, maxRetries: number = 2): Promise<DialogueTree> {
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

  public async generateAndSaveDialogueTree(character: DetailedCharacter): Promise<string> {
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

  // Create a focused character summary highlighting specific traits for dialogue
  private createFocusedCharacterSummary(character: DetailedCharacter): string {
    const focusAreas = [
      'personality.traits',
      'personality.strengths', 
      'personality.weaknesses',
      'background.childhood',
      'background.lifeEvents',
      'background.motivations',
      'background.fears',
      'background.dreams',
      'background.secrets',
      'skills.primary',
      'skills.hobbies',
      'relationships.family',
      'relationships.friends',
      'relationships.enemies',
      'quirks',
      'catchphrases',
      'goals',
      'conflicts'
    ];

    // Randomly select 3-4 focus areas to emphasize
    const shuffled = [...focusAreas].sort(() => 0.5 - Math.random());
    const selectedFocus = shuffled.slice(0, Math.min(4, shuffled.length));

    let summary = `🎭 CHARACTER FOCUS: ${character.name}\n\n`;
    summary += `📋 BASIC INFO:\n`;
    summary += `- Age: ${character.demographics.age}, ${character.demographics.occupation}\n`;
    summary += `- Location: ${character.demographics.location}\n`;
    summary += `- Communication Style: ${character.personality.communicationStyle}\n`;
    summary += `- Social Preference: ${character.personality.socialPreference}\n\n`;

    summary += `🎯 FOCUS TRAITS (use these for dialogue):\n`;
    
    selectedFocus.forEach(area => {
      const [category, subcategory] = area.split('.');
      const value = character[category as keyof DetailedCharacter];
      
      if (typeof value === 'object' && value !== null) {
        const subValue = (value as any)[subcategory];
        if (Array.isArray(subValue) && subValue.length > 0) {
          summary += `- ${subcategory}: ${subValue.join(', ')}\n`;
        } else if (typeof subValue === 'string') {
          summary += `- ${subcategory}: ${subValue}\n`;
        }
      } else if (Array.isArray(value) && value.length > 0) {
        summary += `- ${category}: ${value.join(', ')}\n`;
      }
    });

    summary += `\n💬 DISTINCTIVE ELEMENTS:\n`;
    if (character.catchphrases.length > 0) {
      summary += `- Catchphrases: ${character.catchphrases.join(', ')}\n`;
    }
    if (character.quirks.length > 0) {
      summary += `- Quirks: ${character.quirks.join(', ')}\n`;
    }
    if (character.background.secrets.length > 0) {
      summary += `- Secrets: ${character.background.secrets.join(', ')}\n`;
    }

    return summary;
  }

  // Provide specific guidance for creating nuanced dialogue options
  private getDialogueOptionGuidance(character: DetailedCharacter): string {
    const guidance = `
🎯 DIALOGUE OPTION STRATEGY FOR ${character.name}:

CORRECT OPTIONS should:
- Reference their specific background (${character.background.childhood}, ${character.background.lifeEvents.slice(0, 2).join(', ')})
- Align with their communication style (${character.personality.communicationStyle})
- Show understanding of their fears (${character.background.fears.slice(0, 2).join(', ')}) or goals (${character.goals.slice(0, 2).join(', ')})
- Use language patterns that match their personality type (${character.personality.type})
- Feel natural and empathetic, not salesy

MILDLY WRONG OPTIONS should:
- Be too generic or ignore their specific background
- Use the wrong communication approach for their personality
- Miss subtle cues about their social preferences (${character.personality.socialPreference})
- Feel slightly tone-deaf to their unique situation

VERY WRONG OPTIONS should:
- Contradict their core values or trigger their fears
- Ignore their specific life experiences or background
- Use communication styles that clash with their personality
- Feel completely disconnected from their unique character traits

Remember: All options should sound reasonable, but only the correct one truly connects with ${character.name}'s specific persona.`;

    return guidance;
  }
} 