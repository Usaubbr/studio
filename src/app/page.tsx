"use client";

import type { FC } from "react";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, RotateCcw, SendHorizontal, Sparkles, User, Wand2 } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getAiResponse, getAiStyle } from "@/app/actions";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { StyleAdjustmentsOutput } from "@/ai/flows/style-adjustments";

const ChatMessage: FC<{ message: Message }> = ({ message }) => {
  const isAssistant = message.role === "assistant";
  return (
    <div
      className={cn(
        "flex items-start gap-4",
        !isAssistant && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isAssistant ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
        )}
      >
        {isAssistant ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
      </div>
      <Card
        className={cn(
          "relative max-w-[80%] overflow-hidden rounded-2xl",
          isAssistant
            ? "rounded-bl-none bg-primary/10"
            : "rounded-br-none bg-card"
        )}
      >
        <CardContent className="p-4 text-foreground/90">
          <p className="prose prose-invert prose-p:leading-relaxed">{message.content}</p>
        </CardContent>
        {isAssistant && (
           <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        )}
      </Card>
    </div>
  );
};


const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

const styleFormSchema = z.object({
  prompt: z.string().min(3, "Prompt is too short."),
});

const DynamicFontLoader: FC<{ fonts: { headline?: string, body?: string } }> = ({ fonts }) => {
  const [head, setHead] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHead(document.head);
  }, []);

  if (!head) return null;

  const fontLinks = Object.values(fonts)
    .filter(Boolean)
    .map(font => {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${font!.replace(/ /g, '+')}&display=swap`;
      return <link key={font} href={fontUrl} rel="stylesheet" />;
    });

  return createPortal(fontLinks, head);
};


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStyleSheetOpen, setIsStyleSheetOpen] = useState(false);
  const { toast } = useToast();
  
  const [dynamicStyles, setDynamicStyles] = useState({
    '--font-headline': "'Belleza'",
    '--font-body': "'Alegreya'",
  });
  const [dynamicFonts, setDynamicFonts] = useState<{ headline?: string, body?: string }>({
    headline: 'Belleza',
    body: 'Alegreya'
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const chatForm = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  const styleForm = useForm<z.infer<typeof styleFormSchema>>({
    resolver: zodResolver(styleFormSchema),
    defaultValues: { prompt: "" },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReset = () => {
    setMessages([]);
    toast({
      title: "Chat Reset",
      description: "The conversation has been cleared.",
    });
  };

  const handleChatSubmit = async (values: z.infer<typeof chatFormSchema>) => {
    setIsLoading(true);
    const userMessage: Message = { role: "user", content: values.message };
    setMessages((prev) => [...prev, userMessage]);
    chatForm.reset();

    try {
      const response = await getAiResponse(values.message);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleSubmit = async (values: z.infer<typeof styleFormSchema>) => {
    setIsLoading(true);
    toast({
      title: "Conjuring new styles...",
      description: "Please wait while we weave some magic.",
    });
    try {
      const result: StyleAdjustmentsOutput | null = await getAiStyle(values.prompt);
      if (result) {
        setDynamicStyles({
          '--primary': result.primaryColor,
          '--background': result.backgroundColor,
          '--accent': result.accentColor,
          '--font-headline': `'${result.fontHeadline}'`,
          '--font-body': `'${result.fontBody}'`,
        });
        setDynamicFonts({ headline: result.fontHeadline, body: result.fontBody });
        styleForm.reset();
        setIsStyleSheetOpen(false);
        toast({
          title: "Style Updated!",
          description: "The chatbot has a new magical look.",
        });
      } else {
        throw new Error("AI did not return styles.");
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Style Magic Failed",
        description: "Could not apply the new style. Please try a different prompt.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <DynamicFontLoader fonts={dynamicFonts} />
    <div style={dynamicStyles as React.CSSProperties} className="flex h-screen w-full flex-col bg-background transition-colors duration-500">
      <header className="flex h-20 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold tracking-wider text-foreground">
            Makama AI
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <Sheet open={isStyleSheetOpen} onOpenChange={setIsStyleSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Adjust Style">
                <Wand2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-headline">Enchant the UI</SheetTitle>
                <SheetDescription className="font-body">
                  Describe a magical theme, and watch the UI transform. Try "enchanted forest at twilight" or "celestial starlight".
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <Form {...styleForm}>
                  <form onSubmit={styleForm.handleSubmit(handleStyleSubmit)} className="space-y-4">
                     <FormField
                      control={styleForm.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Your magical prompt..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Cast Style Spell
                    </Button>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={handleReset} variant="ghost" size="icon" aria-label="Reset Chat">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="container mx-auto max-w-3xl space-y-8 p-4 md:p-8">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground">
                <p className="font-headline text-lg">The magic begins now.</p>
                <p>What secrets do you wish to uncover?</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
          </div>
        </ScrollArea>
      </main>

      <footer className="shrink-0 border-t p-4">
        <div className="container mx-auto max-w-3xl">
          <Form {...chatForm}>
            <form
              onSubmit={chatForm.handleSubmit(handleChatSubmit)}
              className="flex items-start gap-4"
            >
              <FormField
                control={chatForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="Ask a magical question..."
                        className="min-h-0 resize-none rounded-2xl border-2"
                        rows={1}
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            chatForm.handleSubmit(handleChatSubmit)();
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isLoading} aria-label="Send Message" className="h-12 w-12 shrink-0 rounded-full">
                <SendHorizontal />
              </Button>
            </form>
          </Form>
        </div>
      </footer>
    </div>
    </>
  );
}
