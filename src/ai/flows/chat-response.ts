// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview A Genkit flow for generating chat responses.
 *
 * - chatResponse - A function that generates a conversational response to a user query.
 * - ChatResponseInput - The input type for the chatResponse function.
 * - ChatResponseOutput - The return type for the chatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatResponseInputSchema = z.object({
  query: z.string().describe('The user query to respond to.'),
  styleGuide: z.string().describe('Style guide to evoke feeling of magic.'),
});
export type ChatResponseInput = z.infer<typeof ChatResponseInputSchema>;

const ChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI generated response to the query.'),
});
export type ChatResponseOutput = z.infer<typeof ChatResponseOutputSchema>;

export async function chatResponse(input: ChatResponseInput): Promise<ChatResponseOutput> {
  return chatResponseFlow(input);
}

const chatResponsePrompt = ai.definePrompt({
  name: 'chatResponsePrompt',
  input: {schema: ChatResponseInputSchema},
  output: {schema: ChatResponseOutputSchema},
  prompt: `You are Makama AI, a chatbot with a magical style.

  Your responses should follow this style guide: {{{styleGuide}}}

  Respond to the following query:
  {{query}}`,
});

const chatResponseFlow = ai.defineFlow(
  {
    name: 'chatResponseFlow',
    inputSchema: ChatResponseInputSchema,
    outputSchema: ChatResponseOutputSchema,
  },
  async input => {
    const {output} = await chatResponsePrompt(input);
    return output!;
  }
);
