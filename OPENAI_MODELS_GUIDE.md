# Cheap OpenAI Models with Large Context Windows

## Overview
This guide covers the most cost-effective OpenAI models that offer large context windows for applications requiring extensive text processing.

## Model Comparison

### 1. **GPT-4o-mini** ⭐ **BEST VALUE**
- **Context Window**: 128K tokens
- **Input Cost**: $0.15 per 1M tokens
- **Output Cost**: $0.60 per 1M tokens
- **Total Cost**: $0.75 per 1M tokens
- **Best for**: General tasks, cost-conscious applications, large context needs
- **Quality**: Good (slightly lower than GPT-4o but excellent for most use cases)

### 2. **GPT-4o** (Balanced Option)
- **Context Window**: 128K tokens
- **Input Cost**: $2.50 per 1M tokens
- **Output Cost**: $10.00 per 1M tokens
- **Total Cost**: $12.50 per 1M tokens
- **Best for**: High-quality responses with large context needs
- **Quality**: Excellent

### 3. **GPT-3.5-turbo** (Budget Option)
- **Context Window**: 16K tokens (standard) or 128K tokens (extended)
- **Input Cost**: $0.50 per 1M tokens (16K) / $1.50 per 1M tokens (128K)
- **Output Cost**: $1.50 per 1M tokens (16K) / $6.00 per 1M tokens (128K)
- **Total Cost**: $2.00 per 1M tokens (16K) / $7.50 per 1M tokens (128K)
- **Best for**: Simple tasks, basic text generation
- **Quality**: Good for simple tasks

### 4. **Claude 3 Haiku** (Alternative)
- **Context Window**: 200K tokens
- **Input Cost**: $0.25 per 1M tokens
- **Output Cost**: $1.25 per 1M tokens
- **Total Cost**: $1.50 per 1M tokens
- **Best for**: Very large context needs at reasonable cost
- **Quality**: Good

## Cost Comparison Examples

### For a typical dialogue generation (~2000 tokens):
- **GPT-4**: ~$0.06
- **GPT-4o**: ~$0.025
- **GPT-4o-mini**: ~$0.0003 (200x cheaper than GPT-4!)
- **GPT-3.5-turbo**: ~$0.001
- **Claude 3 Haiku**: ~$0.003

### For a large document analysis (~50K tokens):
- **GPT-4**: ~$1.50
- **GPT-4o**: ~$0.625
- **GPT-4o-mini**: ~$0.0075 (200x cheaper!)
- **GPT-3.5-turbo**: ~$0.025
- **Claude 3 Haiku**: ~$0.075

## Recommendations by Use Case

### 🎯 **Dialogue Generation** (Your Project)
- **Primary**: `gpt-4o-mini` - 200x cheaper, 128K context
- **Fallback**: `gpt-3.5-turbo` - Even cheaper for simple dialogue

### 🖼️ **Image Generation**
- **Primary**: `dall-e-3` - Best quality for character images
- **Budget**: `dall-e-2` - Cheaper alternative

### 📄 **Document Analysis**
- **Primary**: `gpt-4o-mini` - Large context, very cheap
- **Alternative**: `Claude 3 Haiku` - Even larger context (200K)

### 💬 **Chat Applications**
- **Primary**: `gpt-4o-mini` - Good balance of cost and quality
- **Premium**: `gpt-4o` - Higher quality when needed

## Implementation in Your Project

### 1. Update Environment Variables
```bash
# In your .env file
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

### 2. Updated Token Limits
Your project has been updated to use the 128K context window:
- **Old limit**: 8,192 tokens
- **New limit**: 128,000 tokens
- **Buffer**: 100 tokens for safety

### 3. Cost Optimization Features
- Automatic token calculation
- Warnings for large character data
- Optimization suggestions
- Detailed usage logging

## Migration Guide

### From GPT-4 to GPT-4o-mini:
1. **Update model name**: `gpt-4` → `gpt-4o-mini`
2. **Increase context window**: 8K → 128K tokens
3. **Monitor quality**: Slightly lower but still excellent
4. **Enjoy 200x cost savings**

### From GPT-3.5-turbo to GPT-4o-mini:
1. **Better quality**: GPT-4o-mini is more capable
2. **Same context window**: 128K tokens
3. **Slightly higher cost**: But much better quality

## Best Practices

### 1. **Model Selection**
- Start with `gpt-4o-mini` for most tasks
- Use `gpt-4o` only when you need maximum quality
- Consider `Claude 3 Haiku` for very large documents

### 2. **Cost Management**
- Monitor token usage with built-in logging
- Use token optimization tools
- Set reasonable `max_tokens` limits
- Batch similar requests when possible

### 3. **Quality Assurance**
- Test responses with different models
- Use temperature settings appropriately
- Implement retry logic for failed requests
- Validate outputs, especially JSON responses

## API Usage Examples

### Basic Chat Completion
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",  // Much cheaper than gpt-4
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" }
  ],
  temperature: 0.7,
  max_tokens: 2000
});
```

### Large Context Processing
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",  // 128K context window
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: largeDocument }
  ],
  temperature: 0.3,  // Lower for consistency
  max_tokens: 4000   // More tokens for longer responses
});
```

## Monitoring and Analytics

### Track Usage
- Monitor token consumption
- Track cost per request
- Analyze response quality
- Identify optimization opportunities

### Cost Alerts
- Set up usage limits
- Monitor daily/weekly costs
- Alert on unusual usage patterns
- Track cost per character generated

## Conclusion

**GPT-4o-mini is the clear winner** for most applications requiring large context windows. It offers:
- ✅ 128K context window
- ✅ 200x cost savings vs GPT-4
- ✅ Excellent quality for most tasks
- ✅ Reliable performance
- ✅ Easy migration path

For your character generator project, this change will dramatically reduce costs while maintaining or improving functionality. 