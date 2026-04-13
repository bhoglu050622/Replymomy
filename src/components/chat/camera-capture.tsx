"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Video, RotateCcw, Check, X, Circle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

type Mode = "photo" | "video";

export function CameraCapture({ open, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mode, setMode] = useState<Mode>("photo");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [captured, setCaptured] = useState<{ blob: Blob; type: "photo" | "video" } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startStream() {
    stopStream();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: mode === "video",
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  // Start/stop stream when open state changes
  useEffect(() => {
    if (open) {
      setCaptured(null);
      setPreviewUrl(null);
      startStream();
    } else {
      stopStream();
      if (countdownRef.current) clearTimeout(countdownRef.current);
    }
    return () => stopStream();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Restart stream when mode or facing changes (only if no captured preview)
  useEffect(() => {
    if (open && !captured) startStream();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, facing]);

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopStream();
        setCaptured({ blob, type: "photo" });
        setPreviewUrl(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.9
    );
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      stopStream();
      setCaptured({ blob, type: "video" });
      setPreviewUrl(URL.createObjectURL(blob));
      setRecording(false);
      setCountdown(0);
    };

    recorder.start(100);
    setRecording(true);

    // Countdown: 10 → 0
    let secs = 10;
    setCountdown(secs);
    const tick = () => {
      secs -= 1;
      setCountdown(secs);
      if (secs > 0) {
        countdownRef.current = setTimeout(tick, 1000);
      } else {
        stopRecording();
      }
    };
    countdownRef.current = setTimeout(tick, 1000);
  }

  function stopRecording() {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    recorderRef.current?.stop();
  }

  function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCaptured(null);
    setPreviewUrl(null);
    setRecording(false);
    setCountdown(0);
    startStream();
  }

  function useCapture() {
    if (!captured) return;
    const ext = captured.type === "photo" ? "jpg" : "webm";
    const mimeType = captured.type === "photo" ? "image/jpeg" : captured.blob.type;
    const file = new File([captured.blob], `${captured.type}_${Date.now()}.${ext}`, { type: mimeType });
    onCapture(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col bg-obsidian"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-label="Camera"
        >
          {/* Close button */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <button
              onClick={onClose}
              className="text-ivory/60 hover:text-ivory transition-colors"
              aria-label="Close camera"
            >
              <X className="size-6" />
            </button>
            {/* Mode tabs */}
            {!captured && (
              <div className="flex items-center gap-1 bg-smoke rounded-full p-1">
                {(["photo", "video"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { if (!recording) setMode(m); }}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-body-sm capitalize transition-colors",
                      mode === m ? "bg-champagne text-obsidian font-medium" : "text-ivory/60 hover:text-ivory"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
            {/* Flip camera */}
            {!captured && (
              <button
                onClick={() => setFacing((f) => f === "environment" ? "user" : "environment")}
                className="text-ivory/60 hover:text-ivory transition-colors"
                aria-label="Flip camera"
                disabled={recording}
              >
                <RotateCcw className="size-5" />
              </button>
            )}
          </div>

          {/* Camera view / preview */}
          <div className="flex-1 relative overflow-hidden bg-black">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-ivory/60 text-body-md text-center px-8">{error}</p>
              </div>
            ) : captured && previewUrl ? (
              captured.type === "photo" ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <video src={previewUrl} controls playsInline className="w-full h-full object-contain" />
              )
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
              />
            )}

            {/* Countdown overlay */}
            {recording && countdown > 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 px-4 py-2 bg-obsidian/70 rounded-full backdrop-blur-sm">
                  <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-ivory text-body-sm font-medium tabular-nums">{countdown}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="px-6 py-8 shrink-0 flex items-center justify-center gap-6">
            {captured ? (
              <>
                <Button variant="outline" onClick={retake} className="gap-2 rounded-full border-champagne/30 text-ivory">
                  <RotateCcw className="size-4" /> Retake
                </Button>
                <Button variant="gold" onClick={useCapture} className="gap-2 rounded-full px-8">
                  <Check className="size-4" /> Use
                </Button>
              </>
            ) : mode === "photo" ? (
              <button
                onClick={capturePhoto}
                disabled={!!error}
                className="size-16 rounded-full border-4 border-champagne bg-champagne/20 hover:bg-champagne/30 transition-colors flex items-center justify-center disabled:opacity-40"
                aria-label="Take photo"
              >
                <Camera className="size-7 text-champagne" />
              </button>
            ) : recording ? (
              <button
                onClick={stopRecording}
                className="size-16 rounded-full bg-red-500/20 border-4 border-red-500 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                aria-label="Stop recording"
              >
                <StopCircle className="size-7 text-red-400" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={!!error}
                className="size-16 rounded-full border-4 border-red-500 bg-red-500/20 hover:bg-red-500/30 transition-colors flex items-center justify-center disabled:opacity-40"
                aria-label="Start recording"
              >
                <Video className="size-7 text-red-400" />
              </button>
            )}
          </div>

          {mode === "video" && !captured && (
            <p className="text-center text-body-sm text-ivory/30 pb-4">
              {recording ? `Recording… stops at 10 seconds` : "Max 10 seconds"}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
