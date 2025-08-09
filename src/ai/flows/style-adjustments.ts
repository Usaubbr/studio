'use server';

/**
 * @fileOverview A style adjustment AI agent that dynamically adjusts the visual style of the chatbot.
 *
 * - adjustStyle - A function that handles the style adjustment process.
 * - StyleAdjustmentsInput - The input type for the adjustStyle function.
 * - StyleAdjustmentsOutput - The return type for the adjustStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleAdjustmentsInputSchema = z.object({
  userInput: z.string().describe('The user input to interpret for style adjustments.'),
});
export type StyleAdjustmentsInput = z.infer<typeof StyleAdjustmentsInputSchema>;

const StyleAdjustmentsOutputSchema = z.object({
  primaryColor: z.string().describe('The primary color for the chatbot.'),
  backgroundColor: z.string().describe('The background color for the chatbot.'),
  accentColor: z.string().describe('The accent color for the chatbot.'),
  fontHeadline: z.string().describe('The font for headlines and shorter text chunks.'),
  fontBody: z.string().describe('The font for larger bodies of text.'),
  iconography: z.string().describe('The style of icons to use.'),
  animation: z.string().describe('The animation style for new messages.'),
});
export type StyleAdjustmentsOutput = z.infer<typeof StyleAdjustmentsOutputSchema>;

export async function adjustStyle(input: StyleAdjustmentsInput): Promise<StyleAdjustmentsOutput> {
  return adjustStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleAdjustmentsPrompt',
  input: {schema: StyleAdjustmentsInputSchema},
  output: {schema: StyleAdjustmentsOutputSchema},
  prompt: `You are a style expert who can interpret user input and adjust the visual style of a chatbot to evoke a magical feel.\n\nBased on the following user input, suggest appropriate styles for the chatbot, including colors, fonts, iconography, and animation.\n\nUser Input: {{{userInput}}}\n\nConsider the following:\n* Primary color: A color to evoke mystery and magic.\n* Background color: A color for a sophisticated and magical feel.\n* Accent color: A color for highlights and interactive elements.\n* Font for headlines: A sans-serif font for headlines and shorter text chunks.\n* Font for body: A serif font for larger bodies of text.\n* Iconography: A whimsical style referencing magical items (stars, wands, hats).\n* Animation: Subtle transitions and shimmering effects to give a magical feel.\n\nOutput your style suggestions in JSON format.\n`,
});

const adjustStyleFlow = ai.defineFlow(
  {
    name: 'adjustStyleFlow',
    inputSchema: StyleAdjustmentsInputSchema,
    outputSchema: StyleAdjustmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
