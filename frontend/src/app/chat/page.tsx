'use client'

import DialogueChat from '@/components/DialogueChat'
import { DialogueTree } from '@/components/types'

// Sebastian Nakamura dialogue data
const sebastianDialogue: DialogueTree = {
  characterName: 'Luna Anderson',
  characterInternalMonologue:
    'Another day, another pitch. I’ve been through worse than a sales pitch. But my time is precious, and I have little patience for distractions. Focus, Luna. What do they want?',
  steps: [
    {
      stepNumber: 1,
      characterInternalMonologue:
        'I’m feeling a bit guarded today. My past has taught me to be careful with whom I invest my energy. Let’s see how this conversation unfolds.',
      options: [
        {
          text: 'I understand that life can be unpredictable. Sometimes we need tools that help us navigate that uncertainty.',
          type: 'correct',
          characterResponse:
            "You know what they say, 'In the chaos, we find our clarity.' I appreciate someone who gets it.",
          saleProgress: 'progress',
        },
        {
          text: 'Have you ever thought about how a pen can help you express your thoughts?',
          type: 'mildly_wrong',
          characterResponse:
            'That’s... one way to look at it. But I’m not really in the mood for abstract ideas right now.',
          saleProgress: 'neutral',
        },
        {
          text: 'You should just buy a pen because everyone needs one, right?',
          type: 'very_wrong',
          characterResponse:
            'That’s a bit simplistic, don’t you think? I’m not just anyone.',
          saleProgress: 'regress',
        },
      ],
    },
    {
      stepNumber: 2,
      characterInternalMonologue:
        'I’ve changed careers and fought through a lot. This person needs to understand that my journey shapes my choices.',
      options: [
        {
          text: "As someone who's navigated major changes, I believe the right tools can make all the difference.",
          type: 'correct',
          characterResponse:
            "Seriously though, you've hit the nail on the head. I need things that enhance my new path.",
          saleProgress: 'progress',
        },
        {
          text: 'Don’t you think everyone has to adapt to their circumstances?',
          type: 'mildly_wrong',
          characterResponse:
            'That’s true, but it’s hard to connect with a general statement like that.',
          saleProgress: 'neutral',
        },
        {
          text: 'You just need to get on board and embrace change, right?',
          type: 'very_wrong',
          characterResponse:
            'It’s not that simple for everyone. Change can be terrifying.',
          saleProgress: 'regress',
        },
      ],
    },
    {
      stepNumber: 3,
      characterInternalMonologue:
        'I’ve fought my fears and emerged stronger, but that doesn’t mean I’m immune. I need to feel understood.',
      options: [
        {
          text: 'I believe that investing in something meaningful can help us face our fears.',
          type: 'correct',
          characterResponse:
            "You know what they say, 'The weapon of choice can change the battle.' I like where this is going.",
          saleProgress: 'progress',
        },
        {
          text: "Isn't it just about finding what works for you?",
          type: 'mildly_wrong',
          characterResponse:
            'That’s a bit vague. Finding what works isn’t always easy.',
          saleProgress: 'neutral',
        },
        {
          text: 'Just push through your fears; that’s the way to go!',
          type: 'very_wrong',
          characterResponse:
            'You’ve clearly never faced real fear. It’s not that simple.',
          saleProgress: 'regress',
        },
      ],
    },
    {
      stepNumber: 4,
      characterInternalMonologue:
        'I prefer conversations with substance. Let’s see if this person can keep up with my logical approach.',
      options: [
        {
          text: 'I think a pen should be a tool for clarity, a way to organize thoughts efficiently.',
          type: 'correct',
          characterResponse:
            'Exactly! Precision is key in communication. I appreciate your understanding.',
          saleProgress: 'progress',
        },
        {
          text: 'A pen is just a pen; you should just buy one!',
          type: 'mildly_wrong',
          characterResponse:
            'That’s a bit dismissive. I like to think deeper about my choices.',
          saleProgress: 'neutral',
        },
        {
          text: 'Why do you need to think so much about a simple purchase?',
          type: 'very_wrong',
          characterResponse:
            'It’s not just a purchase. It’s about intention and purpose.',
          saleProgress: 'regress',
        },
      ],
    },
    {
      stepNumber: 5,
      characterInternalMonologue:
        'My quirks are part of who I am. Let’s see if this person can appreciate that.',
      options: [
        {
          text: 'I believe every pilot has a lucky charm; this pen could be yours.',
          type: 'correct',
          characterResponse:
            "You know what they say, 'Every journey needs a little luck.' I like your perspective.",
          saleProgress: 'progress',
        },
        {
          text: 'Everyone has their little quirks, right? This pen is just a tool.',
          type: 'mildly_wrong',
          characterResponse:
            "That’s true, but my quirks are a big part of my identity. It's not just about utility.",
          saleProgress: 'neutral',
        },
        {
          text: 'Why would you care about a lucky charm in a pen?',
          type: 'very_wrong',
          characterResponse:
            'That’s just missing the point entirely. Luck matters to me.',
          saleProgress: 'regress',
        },
      ],
    },
  ],
  successEnding:
    "Luna smiles, her eyes reflecting a newfound trust. 'You know what they say, sometimes the right tool leads to unexpected journeys.' With the pen in hand, she feels ready for new adventures.",
  failureEnding:
    "Luna shakes her head, a look of disappointment spreading across her face. 'Seriously though, if you can't understand the depth of my choices, this won't work.' She turns away, leaving the pen behind.",
}

const sebastianImageUrl =
  'https://oaidalleapiprodscus.blob.core.windows.net/private/org-OECHLrXN1K3PkL3FFWX4DNVS/user-VzNM8KtAvi07MGtHSQ3JbBUx/img-kLHcj0NJ465IXn3EEbqSXdzx.png?st=2025-06-19T19%3A41%3A25Z&se=2025-06-19T21%3A41%3A25Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-19T08%3A10%3A26Z&ske=2025-06-20T08%3A10%3A26Z&sks=b&skv=2024-08-04&sig=2wGfOBptrt1Im2Vtz7Xhjz7DL6r2S9xhrIPT8vq74qo%3D'

export default function AgentPage() {
  const handleGameEnd = (result: 'success' | 'failure') => {
    console.log(`Game ended with result: ${result}`)
    // You can add additional logic here, like analytics or navigation
  }

  return (
    <DialogueChat
      dialogueTree={sebastianDialogue}
      characterImage={sebastianImageUrl}
      onGameEnd={handleGameEnd}
    />
  )
}
