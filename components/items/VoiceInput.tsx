'use client'
import { useState, useRef } from 'react'

interface Props {
  onTranscript: (text: string) => void
}

export default function VoiceInput({ onTranscript }: Props) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  function start() {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  function stop() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      className={`w-9 h-9 rounded-card flex items-center justify-center transition-colors ${
        listening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-stone-100 text-text-muted hover:bg-stone-200'
      }`}
      aria-label={listening ? '停止录音' : '语音输入'}
    >
      🎤
    </button>
  )
}
