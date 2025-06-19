# Character Generator with Dialogue System

A comprehensive character generator system for games with personality, demographics, and interactive dialogue trees.

## Features

- **Character Generation**: Generate detailed characters with personality traits, demographics, physical attributes, background, skills, and relationships
- **Dialogue Tree Generation**: Create interactive 5-step dialogue trees for each character
- **Image Generation**: Generate character images using AI (optional)
- **Multiple Generation Modes**: Generate single characters, multiple characters, or add dialogue to existing characters

## Installation

```bash
npm install
```

## Usage

### Basic Character Generation

Generate a single character:
```bash
npm run generate
```

Generate a single character without image:
```bash
npm run generate -- --skip-image
```

Generate multiple characters:
```bash
npm run generate-multiple
```

### Dialogue Generation

Generate a single character with dialogue tree:
```bash
npm run generate-with-dialogue
```

Generate multiple characters with dialogue trees:
```bash
npm run generate-multiple-with-dialogue -- --count=5
```

Add dialogue trees to existing characters:
```bash
npm run add-dialogue-to-existing
```

### Testing

Test the dialogue generation system:
```bash
npm run test-dialogue
```

## CLI Options

- `--skip-image`: Skip image generation
- `--with-dialogue`: Generate character with dialogue tree
- `--multiple`: Generate multiple characters
- `--count=N`: Number of characters to generate (default: 1)
- `--add-dialogue-to-existing`: Add dialogue to existing character files

## Character Structure

Each generated character includes:

- **Personality**: Type, traits, strengths, weaknesses, communication style
- **Demographics**: Age, gender, ethnicity, nationality, education, occupation
- **Physical Attributes**: Height, build, hair, eyes, distinctive features
- **Background**: Birthplace, family, childhood, life events, motivations
- **Skills**: Primary, secondary, hobbies, languages, special abilities
- **Relationships**: Family, friends, enemies, romantic, mentors, rivals
- **Game Elements**: Quirks, catchphrases, goals, conflicts, character arc
- **Dialogue Tree**: 5-step interactive dialogue for pen-selling scenario

## Dialogue Tree Structure

Each dialogue tree includes:

- **Character Internal Monologue**: Character's thoughts when approached
- **5 Steps**: Each with 3 dialogue options (correct, mildly wrong, very wrong)
- **Character Responses**: Authentic responses based on personality
- **Progress Tracking**: Indicates if sale is progressing or regressing
- **Endings**: Success and failure scenarios

## File Output

Characters are saved as JSON files in the `characters/` directory with the format:
```
characters/
├── Character_Name.json
├── Another_Character.json
└── ...
```

## Configuration

The system uses environment variables for API keys:

### OpenAI API Setup (Required for Dialogue Generation)

**Quick Setup:**
```bash
npm run setup
```
This will create a `.env` file template for you to fill in.

**Manual Setup:**
1. Get your OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a `.env` file in the project root:
   ```bash
   # Copy this to .env and replace with your actual API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Optional Configuration

You can also customize the OpenAI model settings:
```bash
# Optional: Model configuration (defaults to gpt-4)
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

**Note**: The dialogue generation feature requires a valid OpenAI API key to function. Without it, the system will throw an error.

## Error Handling

The dialogue generation includes:
- **Comprehensive Logging**: Detailed logs for token usage, API calls, and response validation
- **Token Management**: Automatic calculation of available response tokens to avoid 8192 token limit
- **JSON validation with retry logic** (up to 3 attempts)
- **Structure validation for dialogue trees**
- **Graceful error handling for API failures**
- **Skip logic for characters that already have dialogue**

### Token Optimization

The system includes tools to help manage token usage:

**Analyze character token usage:**
```bash
npm run token-analyze characters/Character_Name.json
```

**Analyze all characters:**
```bash
npm run token-analyze --analyze-all
```

**Token optimization features:**
- Automatic token estimation for character data
- Warnings when character data approaches token limits
- Suggestions for reducing verbose sections
- Automatic creation of optimized character versions
- Detailed logging of token usage during API calls

**Common token optimization strategies:**
- Keep life events to 2-3 key moments
- Limit family/friends to 2-3 most important
- Reduce hobbies to 3-4 main interests
- Keep secrets to 1-2 most impactful
- Use shorter descriptions for physical attributes

## Development

Build the project:
```bash
npm run build
```

Run in development mode:
```bash
npm run dev
```

## Features

### 🎭 Personality System
- **8 Personality Types**: Protagonist, Strategist, Rebel, Guardian, Mystic, Entertainer, Scholar, Survivor
- **Traits, Strengths & Weaknesses**: Each personality type has unique characteristics
- **Communication Styles**: How the character interacts with others
- **Decision Making**: Character's approach to choices
- **Social Preferences**: Extroverted, introverted, or selective

### 👥 Demographics
- **Age**: 16-85 years old
- **Gender**: Male, Female, Non-binary, Genderfluid, Agender
- **Ethnicity & Nationality**: Diverse cultural backgrounds
- **Education & Occupation**: Various career paths and educational levels
- **Socioeconomic Status**: From homeless to billionaire
- **Location**: Major cities across the world

### 🎨 Physical Attributes
- **Height, Build, Hair, Eyes**: Detailed physical descriptions
- **Distinctive Features**: Scars, tattoos, birthmarks, etc.
- **Clothing Style**: From casual to gothic to formal
- **Posture**: How the character carries themselves

### 📚 Background & History
- **Family Background**: Traditional, adopted, orphaned, etc.
- **Childhood**: Happy, tragic, privileged, neglected, etc.
- **Life Events**: Major events that shaped the character
- **Motivations, Fears, Dreams**: What drives and haunts them
- **Secrets**: Hidden aspects of their life

### ⚔️ Skills & Abilities
- **Primary Skills**: Combat, stealth, hacking, medicine, etc.
- **Secondary Skills**: Art, music, writing, leadership, etc.
- **Hobbies**: Personal interests and activities
- **Languages**: Multiple language proficiencies
- **Special Abilities**: Supernatural or extraordinary talents

### 🤝 Relationships
- **Family, Friends, Enemies**: Social connections
- **Romantic Life**: Relationship status and history
- **Mentors & Rivals**: Influential people in their life

### 🎯 Game Integration
- **Character Arc**: Hero's Journey, Redemption, Tragic Hero, etc.
- **Game Role**: Protagonist, Antagonist, Mentor, Sidekick, etc.
- **Difficulty Level**: Easy, Medium, Hard
- **Rarity**: Common, Uncommon, Rare, Legendary

### 🎪 Quirks & Personality
- **Quirks**: Unique behaviors and habits
- **Catchphrases**: Signature sayings
- **Goals & Conflicts**: What they want and what stands in their way

### 💾 File Management
- **Automatic Saving**: Characters are automatically saved to JSON files
- **Organized Storage**: Files are saved in the `../characters/` directory
- **Smart Naming**: Files are named after the character (sanitized for filesystem)
- **Batch Generation**: Generate multiple characters at once

## Architecture

- **`src/types.ts`**: TypeScript interfaces for all character attributes
- **`src/data.ts`**: Comprehensive data arrays for character generation
- **`src/CharacterGenerator.ts`**: Main class with generation and file saving logic
- **`src/index.ts`**: Entry point that runs the generator and saves to file
- **`src/generateMultiple.ts`**: Script for generating multiple characters at once

## Contributing

Feel free to add more personality types, traits, occupations, or any other character attributes to make the system even more comprehensive!

## License

ISC 