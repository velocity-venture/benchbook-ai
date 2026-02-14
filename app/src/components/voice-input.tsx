"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  enabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  enabled = false,
  placeholder = "Click to start voice input",
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!enabled || !isSupported) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Voice Input Button */}
      <button
        onClick={toggleRecording}
        className={cn(
          "flex items-center justify-center p-3 rounded-lg border transition-all duration-200",
          isRecording
            ? "bg-red-500 hover:bg-red-600 border-red-400 voice-recording"
            : "bg-slate-800 hover:bg-slate-700 border-slate-600",
          "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        )}
        title={isRecording ? "Stop recording" : "Start voice input"}
      >
        {isRecording ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-slate-300" />
        )}
      </button>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">Recording...</span>
          </div>
          <Volume2 className="w-4 h-4 text-red-400" />
        </div>
      )}

      {/* Interim Transcript */}
      {transcript && isRecording && (
        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <p className="text-amber-400 text-sm italic">
            "{transcript}"
          </p>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && (
        <p className="text-xs text-slate-500 text-center">
          {placeholder}
        </p>
      )}
    </div>
  );
};

// Voice-enabled input wrapper
interface VoiceEnabledInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  voiceEnabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const VoiceEnabledInput: React.FC<VoiceEnabledInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  voiceEnabled = false,
  className,
  children,
}) => {
  const handleVoiceTranscript = (transcript: string) => {
    // Append to existing value or replace if empty
    const newValue = value ? `${value} ${transcript}` : transcript;
    onChange(newValue.trim());
    
    // Auto-submit if transcript ends with a question mark or period
    if (onSubmit && /[.?!]$/.test(transcript.trim())) {
      setTimeout(onSubmit, 500);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Input */}
      {children}
      
      {/* Voice Input */}
      <VoiceInput
        enabled={voiceEnabled}
        onTranscript={handleVoiceTranscript}
        placeholder="Speak your question"
      />
    </div>
  );
};