"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SegmentType = "voice" | "sound" | "visual" | "whisper";

type Segment = {
  id: string;
  text: string;
  delay: number;
  kind: SegmentType;
  speak?: boolean;
  cue?: "knock-soft" | "knock-hard" | "suspense" | "heartbeat" | "glitch";
};

const segments: Segment[] = [
  {
    id: "line-1",
    text: "Raat ke do baje mere kamre ke darwaze pe kisi ne knock kiya…",
    delay: 600,
    kind: "voice",
    speak: true
  },
  {
    id: "pause-1",
    text: " ",
    delay: 1000,
    kind: "voice",
    speak: false
  },
  {
    id: "line-2",
    text: "Main akela tha ghar mein.",
    delay: 0,
    kind: "voice",
    speak: true
  },
  {
    id: "knock-soft",
    text: "(soft knock knock)",
    delay: 300,
    kind: "sound",
    cue: "knock-soft"
  },
  {
    id: "line-3",
    text: "Pehle laga hawa hogi… lekin phir knock fir se hua — is baar zyada zor se.",
    delay: 800,
    kind: "voice",
    speak: true
  },
  {
    id: "knock-hard",
    text: "(knock knock — louder)",
    delay: 200,
    kind: "sound",
    cue: "knock-hard"
  },
  {
    id: "visual-1",
    text: "CAMERA: Dark hallway • Flickering light • Something barely moves.",
    delay: 700,
    kind: "visual"
  },
  {
    id: "line-4",
    text: "Main ne flashlight uthayi, aur darwaze ke paas gaya.",
    delay: 900,
    kind: "voice",
    speak: true
  },
  {
    id: "suspense",
    text: "(low suspense hum rising)",
    delay: 200,
    kind: "sound",
    cue: "suspense"
  },
  {
    id: "line-5",
    text: "Andar se awaaz aayi… ek ladki ki halki si fusi hui aawaz —",
    delay: 900,
    kind: "voice",
    speak: true
  },
  {
    id: "whisper",
    text: "“Please… madad karo…”",
    delay: 600,
    kind: "whisper",
    speak: true
  },
  {
    id: "line-6",
    text: "Darwaza kholte hi ek thandi hawa ka jhonka aaya… lekin koi nahi tha.",
    delay: 1200,
    kind: "voice",
    speak: true
  },
  {
    id: "visual-2",
    text: "CAMERA PAN: Empty hallway • drifting cold haze.",
    delay: 400,
    kind: "visual"
  },
  {
    id: "line-7",
    text: "Sirf floor pe ek purani polaroid photo padhi thi… meri.",
    delay: 1000,
    kind: "voice",
    speak: true
  },
  {
    id: "heartbeat",
    text: "(heartbeat — close, heavy)",
    delay: 200,
    kind: "sound",
    cue: "heartbeat"
  },
  {
    id: "line-8",
    text: "Lekin us photo mein main darwaze ke bahar khada tha.",
    delay: 900,
    kind: "voice",
    speak: true
  },
  {
    id: "pause-2",
    text: " ",
    delay: 1100,
    kind: "voice",
    speak: false
  },
  {
    id: "line-9",
    text: "Mujhe ab tak samajh nahi aaya… us raat knock kisne kiya tha — main to andar tha.",
    delay: 900,
    kind: "voice",
    speak: true
  },
  {
    id: "glitch",
    text: "(glitch • lights cut to blackout)",
    delay: 0,
    kind: "sound",
    cue: "glitch"
  }
];

const totalDuration = segments.reduce((sum, segment) => sum + Math.max(segment.delay, 0), 0);

export default function Page() {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const lineCount = useMemo(() => segments.length, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => {
      window.clearTimeout(timer);
    });
    timers.current = [];
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    speechRef.current = null;
  }, []);

  const warmupAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const context = new AudioCtx();
      audioContextRef.current = context;
      if (context.state === "suspended") {
        await context.resume().catch(() => undefined);
      }
    } else if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume().catch(() => undefined);
    }
  }, []);

  const playCue = useCallback(
    async (cue: Segment["cue"]) => {
      if (!cue) return;
      await warmupAudio();
      const context = audioContextRef.current;
      if (!context) return;
      const now = context.currentTime;

      const makePercussive = (freq: number, decays: number[]) => {
        const osc = context.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        const gain = context.createGain();
        gain.gain.setValueAtTime(0.0, now);
        decays.forEach((val, index) => {
          const t = now + index * 0.03;
          gain.gain.linearRampToValueAtTime(val, t);
        });
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain).connect(context.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      };

      switch (cue) {
        case "knock-soft":
          makePercussive(180, [0.6, 0.12]);
          break;
        case "knock-hard":
          makePercussive(160, [0.9, 0.25]);
          break;
        case "suspense": {
          const osc = context.createOscillator();
          osc.type = "sawtooth";
          const gain = context.createGain();
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
          gain.gain.linearRampToValueAtTime(0.2, now + 3.3);
          gain.gain.exponentialRampToValueAtTime(0.00001, now + 4.5);

          osc.frequency.setValueAtTime(54, now);
          osc.frequency.linearRampToValueAtTime(44, now + 3.5);
          osc.frequency.linearRampToValueAtTime(20, now + 4.2);
          osc.connect(gain).connect(context.destination);
          osc.start(now);
          osc.stop(now + 4.6);
          break;
        }
        case "heartbeat": {
          const beat = () => {
            const gain = context.createGain();
            const osc = context.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(55, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.connect(gain).connect(context.destination);
            osc.start(now);
            osc.stop(now + 0.35);
          };
          beat();
          const secondBeat = context.createOscillator();
          const secondGain = context.createGain();
          secondBeat.type = "sine";
          secondBeat.frequency.setValueAtTime(48, now + 0.28);
          secondGain.gain.setValueAtTime(0.0001, now + 0.28);
          secondGain.gain.exponentialRampToValueAtTime(0.3, now + 0.31);
          secondGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
          secondBeat.connect(secondGain).connect(context.destination);
          secondBeat.start(now + 0.28);
          secondBeat.stop(now + 0.62);
          break;
        }
        case "glitch": {
          const length = 0.12;
          const buffer = context.createBuffer(1, context.sampleRate * length, context.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i += 1) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = context.createBufferSource();
          const gain = context.createGain();
          gain.gain.setValueAtTime(0.6, now);
          gain.gain.linearRampToValueAtTime(0.0001, now + length);
          noise.buffer = buffer;
          noise.playbackRate.setValueAtTime(1.8, now);
          noise.connect(gain).connect(context.destination);
          noise.start(now);
          noise.stop(now + length);
          break;
        }
        default:
          break;
      }
    },
    [warmupAudio]
  );

  const speak = useCallback((text: string) => {
    if (!text.trim()) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    cancelSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.pitch = 0.75;
    utterance.rate = 0.8;
    utterance.volume = 0.95;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [cancelSpeech]);

  const runSequence = useCallback(async () => {
    setIsComplete(false);
    setVisibleIds([]);
    setProgress(0);
    setIsPlaying(true);
    await warmupAudio();
    cancelSpeech();

    let accumulatedDelay = 0;

    segments.forEach((segment, index) => {
      accumulatedDelay += segment.delay;
      const timer = window.setTimeout(() => {
        setVisibleIds((prev) => (prev.includes(segment.id) ? prev : [...prev, segment.id]));
        if (segment.kind === "sound" && segment.cue) {
          void playCue(segment.cue);
        }
        if (segment.speak) {
          speak(segment.text.replace(/[“”"']/g, "").trim());
        }
        setProgress((index + 1) / lineCount);
        if (index === segments.length - 1) {
          const finalTimer = window.setTimeout(() => {
            setIsComplete(true);
            setIsPlaying(false);
          }, 800);
          timers.current.push(finalTimer);
        }
      }, accumulatedDelay);
      timers.current.push(timer);
    });
  }, [cancelSpeech, lineCount, playCue, speak, warmupAudio]);

  useEffect(() => {
    return () => {
      clearTimers();
      cancelSpeech();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, [cancelSpeech, clearTimers]);

  const handlePlay = useCallback(() => {
    clearTimers();
    runSequence().catch(() => {
      setIsPlaying(false);
    });
  }, [clearTimers, runSequence]);

  const visibleSegments = useMemo(
    () => segments.filter((segment) => visibleIds.includes(segment.id)),
    [visibleIds]
  );

  return (
    <>
      <div className="noise" />
      <div className="flicker" />
      <main>
        <section className="scene">
          <div className="controls">
            <button className="play" onClick={handlePlay} disabled={isPlaying}>
              {isPlaying ? "Playing…" : visibleIds.length ? "Replay Sequence" : "Play The Knock"}
            </button>
            <div
              className="timeline"
              style={
                {
                  "--progress": progress.toFixed(3)
                } as React.CSSProperties
              }
            />
          </div>
          <div className="prompt">
            {visibleSegments.map((segment) => (
              <p
                key={segment.id}
                className={`line ${segment.kind}`}
                style={{
                  animationDelay: "0ms"
                }}
              >
                {segment.text}
              </p>
            ))}
          </div>
          {isComplete ? (
            <p className="final-text">👁️ Sometimes… the one knocking isn’t outside.</p>
          ) : null}
        </section>
      </main>
    </>
  );
}
