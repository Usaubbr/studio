"use server";

import { chatResponse } from "@/ai/flows/chat-response";
import { adjustStyle } from "@/ai/flows/style-adjustments";
import type { StyleAdjustmentsOutput } from "@/ai/flows/style-adjustments";

export async function getAiResponse(query: string) {
  const styleGuide = "A magical, whimsical, and mysterious tone. Be helpful but enigmatic.";
  try {
    const result = await chatResponse({ query, styleGuide });
    return result.response;
  } catch (e) {
    console.error(e);
    return "Oops! My magic spell failed. Could you try asking again?";
  }
}

export async function getAiStyle(userInput: string): Promise<StyleAdjustmentsOutput | null> {
  try {
    const result = await adjustStyle({ userInput });
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
}
