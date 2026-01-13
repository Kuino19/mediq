'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';
import type { Message } from "@/lib/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getHospitals } from "./actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialMessages: Message[] = [
  { id: '1', text: "Hello! I'm the KinetiQ virtual assistant. How can I help you today?", sender: 'bot' }
];

// The hardcoded script for the conversation
const script = [
  // Question 1
  "Thank you. What is your full name?",
  // Question 2
  "Nice to meet you. Which clinic are you in today (e.g., General, Pediatrics, etc.)?",
  // Question 3
  "Got it. Please describe your symptoms in a few words.",
  // Question 4
  "Thank you for sharing. Have you visited this hospital in the last 6 months?",
  // Final Message
  "Thank you for the information. A doctor will be with you shortly. Please have a seat in the waiting area."
];

const getHardcodedResponse = (userMessagesCount: number): string => {
  // We base the response on the number of *user* messages already sent.
  const responseIndex = userMessagesCount - 1;

  if (responseIndex >= 0 && responseIndex < script.length) {
    return script[responseIndex];
  }

  // Default to the final message if the conversation goes beyond the script.
  return script[script.length - 1];
};


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [conversationId] = useState(() => uuidv4());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueResult, setQueueResult] = useState<{
    position: number;
    estimatedWaitMinutes: number;
    triageCode: string;
  } | null>(null);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [hospitals, setHospitals] = useState<{ id: number, name: string }[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");

  useEffect(() => {
    // Fetch hospitals on mount
    getHospitals().then(setHospitals).catch(console.error);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Text-to-Speech Function
  const speakText = (text: string) => {
    if (!isSpeechEnabled || typeof window === 'undefined') return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: Set voice, pitch, rate here if needed
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices.find(voice => voice.lang.includes('en')) || null;

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmitToQueue = async () => {
    if (!selectedHospitalId) {
      alert("Please select a hospital");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: undefined, // Anonymous user
          guestName,
          guestContact,
          hospitalId: parseInt(selectedHospitalId),
          conversationId,
          messages: messages.map(m => ({ text: m.text, sender: m.sender })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit consultation');
      }

      const data = await response.json();

      // Redirect to patient queue dashboard
      if (data.queueId) {
        window.location.href = `/patient/queue/${data.queueId}`;
      } else {
        // Fallback: show success card
        setQueueResult({
          position: data.position,
          estimatedWaitMinutes: data.estimatedWaitMinutes,
          triageCode: data.triageCode,
        });
      }

    } catch (error) {
      console.error('Error submitting to queue:', error);
      alert('Failed to submit consultation. Please try again.');
      setIsSubmitting(false);
      setShowGuestDialog(false);
    }
  };


  // Voice-to-Text Function
  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };


  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    // 1. Add user's message to state
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputValue,
      sender: 'user',
    };

    // Update messages with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Clear input immediately
    setInputValue("");

    // 2. Add a loading message
    const loadingMessage: Message = {
      id: 'loading',
      text: 'Thinking...',
      sender: 'bot',
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // 3. Call AI API with retry logic
      let retries = 3;
      let botResponseText = '';

      while (retries > 0) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updatedMessages }),
          });

          if (response.status === 429) {
            // Rate limit hit, wait and retry
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
            botResponseText = "I'm currently handling many requests. Please try again in a moment.";
            break;
          }

          if (!response.ok) {
            throw new Error('Failed to get AI response');
          }

          const data = await response.json();
          botResponseText = data.text;
          break;

        } catch (error) {
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          botResponseText = "I apologize, but I'm having trouble connecting. Please try again.";
        }
      }

      // 4. Replace loading message with actual response
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: botResponseText,
        sender: 'bot',
      };

      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(botMessage));

      // Speak the response
      speakText(botResponseText);

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove loading message and show error
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              title={isSpeechEnabled ? "Mute Text-to-Speech" : "Enable Text-to-Speech"}
            >
              {isSpeechEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
            <Button asChild><Link href="/register">Register</Link></Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col py-4">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl w-full mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-4",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-base shadow-sm flex items-center gap-3",
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-background rounded-bl-none"
                )}
              >
                <p>{message.text}</p>
              </div>
              {message.sender === 'user' && (
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback className="bg-secondary text-secondary-foreground"><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />

          {/* Queue Result Display */}
          {queueResult && (
            <Card className="mt-6 border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Successfully Added to Queue!
                </CardTitle>
                <CardDescription>Your consultation has been submitted to the doctor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Queue Position</p>
                    <p className="text-3xl font-bold text-primary">#{queueResult.position}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Estimated Wait</p>
                    <p className="text-3xl font-bold">{queueResult.estimatedWaitMinutes}m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <p className={cn(
                      "text-2xl font-bold uppercase",
                      queueResult.triageCode === 'red' && "text-red-500",
                      queueResult.triageCode === 'yellow' && "text-yellow-500",
                      queueResult.triageCode === 'green' && "text-green-500"
                    )}>{queueResult.triageCode}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Please wait in the waiting area. You'll be called when it's your turn.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="border-t bg-background">
          <div className="p-4 max-w-4xl w-full mx-auto space-y-4">
            {/* Submit to Queue Button */}
            {!queueResult && messages.length > 3 && (
              <Dialog open={showGuestDialog} onOpenChange={setShowGuestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    Submit for Doctor Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enter Your Details</DialogTitle>
                    <DialogDescription>
                      Please provide your details so we can add you to the correct queue.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="col-span-3"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contact" className="text-right">
                        Contact
                      </Label>
                      <Input
                        id="contact"
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        className="col-span-3"
                        placeholder="Phone or Email"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hospital" className="text-right">
                        Hospital
                      </Label>
                      <div className="col-span-3">
                        <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Hospital" />
                          </SelectTrigger>
                          <SelectContent>
                            {hospitals.map(hospital => (
                              <SelectItem key={hospital.id} value={hospital.id.toString()}>
                                {hospital.name} ({hospital.address})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmitToQueue} disabled={isSubmitting || !guestName || !selectedHospitalId}>
                      {isSubmitting ? 'Submitting...' : 'Join Queue'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Chat Input Form */}
            {!queueResult && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex w-full items-center space-x-4"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn("h-12 w-12", isListening && "text-red-500 animate-pulse")}
                  onClick={handleVoiceInput}
                  title="Speak"
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Describe your symptoms..."}
                  className="h-12 text-base"
                />
                <Button type="submit" size="icon" className="h-12 w-12" disabled={!inputValue.trim()}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Basic polyfill for crypto.randomUUID
if (typeof window !== 'undefined' && typeof crypto.randomUUID === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crypto.randomUUID = uuidv4 as any;
}
