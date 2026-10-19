import React, { useEffect, useRef, useState } from 'react';
import { Film, Upload, Play, Download, RefreshCw } from 'lucide-react';

const REASSURING_MESSAGES = [
  'Uploading photo and initializing Veo 3.1 video pipeline...',
  'Analyzing scene depth, lighting, and educational subject matter...',
  'Synthesizing smooth temporal motion frames at 24fps...',
  'Refining visual details and rendering MP4 stream...',
];

export const VeoVideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    'Animate this educational science diagram with smooth cinematic camera motion and glowing particle flow'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');

  const [generating, setGenerating] = useState<boolean>(false);
  const [statusIdx, setStatusIdx] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create a clean default educational diagram image on mount so users can test immediately or upload their own photo
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 640;
    offscreen.height = 360;
    const ctx = offscreen.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 360);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(320, 180, 95, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(320, 180, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NECTA Science Atomic & Cellular Motion Diagram', 320, 325);
      const dataUrl = offscreen.toDataURL('image/png');
      setImagePreviewUrl(dataUrl);
      setImageBase64(dataUrl.split(',')[1] || '');
      setImageMimeType('image/png');
    }
  }, []);

  useEffect(() => {
    if (!generating) return;
    const timer = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % REASSURING_MESSAGES.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [generating]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const commaIdx = result.indexOf(',');
      if (commaIdx !== -1) {
        setImagePreviewUrl(result);
        setImageBase64(result.slice(commaIdx + 1));
        setImageMimeType(file.type || 'image/png');
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async () => {
    if (!imageBase64) {
      setErrorMsg('Please upload a photo first to animate into a video.');
      return;
    }
    setGenerating(true);
    setErrorMsg(null);
    setVideoUrl(null);
    setStatusIdx(0);

    try {
      // Step 1: Start Veo 3.1 video generation on server
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Animate this photo with smooth cinematic motion',
          imageBase64,
          imageMimeType,
          aspectRatio,
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.operationName) {
        throw new Error(
          startData.error || 'Unable to start Veo video generation. Please ensure a valid Gemini API key is configured.'
        );
      }

      const operationName: string = startData.operationName;

      // Step 2: Poll /api/video-status until done
      let isDone = false;
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 4000));
        const pollRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });
        const pollData = await pollRes.json();
        if (!pollRes.ok) {
          throw new Error(pollData.error || 'Error polling video generation status.');
        }
        if (pollData.done) {
          isDone = true;
          break;
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try again.');
      }

      // Step 3: Download completed video stream from /api/video-download
      const dlRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!dlRes.ok) {
        const errJson = await dlRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to download generated video.');
      }

      const videoBlob = await dlRes.blob();
      const objectUrl = URL.createObjectURL(videoBlob);
      setVideoUrl(objectUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Video generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="text-xs font-mono text-violet-700 font-semibold">
            VEO PHOTO-TO-VIDEO ANIMATION STUDIO · MODEL: veo-3.1-fast-generate-preview
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Animate Educational Photos &amp; Diagrams into Video
          </h2>
          <p className="text-xs text-slate-500">
            Upload any textbook diagram, lab photo, or illustration and generate an animated video in 16:9 (Landscape) or 9:16 (Portrait).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 6 Cols: Upload Photo + Prompt + Aspect Ratio */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              1. Upload Starting Photo (PNG / JPG / WebP)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo from Device</span>
              </button>
              <span className="text-xs text-slate-500">
                {imageBase64 ? 'Photo ready for Veo animation' : 'No photo selected'}
              </span>
            </div>

            {imagePreviewUrl && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2 flex justify-center">
                <img
                  src={imagePreviewUrl}
                  alt="Uploaded starting photo for Veo video generation"
                  referrerPolicy="no-referrer"
                  className="max-h-48 object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              2. Select Video Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  aspectRatio === '16:9'
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <span>16:9 Landscape (Widescreen)</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  aspectRatio === '9:16'
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <span>9:16 Portrait (Mobile Vertical)</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              3. Animation Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe how the uploaded photo should move and animate..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:border-violet-600"
            />
          </div>

          <button
            onClick={handleGenerateVideo}
            disabled={generating || !imageBase64}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Video with Veo 3.1...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Animate Photo into Video ({aspectRatio})</span>
              </>
            )}
          </button>
        </div>

        {/* Right 6 Cols: Video Output & Progress Viewport */}
        <div className="lg:col-span-6 bg-slate-950 text-white rounded-2xl p-5 min-h-[320px] flex flex-col items-center justify-center text-center space-y-4">
          {generating ? (
            <div className="space-y-3 max-w-sm">
              <div className="w-10 h-10 border-3 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">
                {REASSURING_MESSAGES[statusIdx]}
              </div>
              <p className="text-xs text-slate-400">
                Veo video generation typically takes 30–90 seconds. Please keep this tab open while we render your {aspectRatio} video.
              </p>
            </div>
          ) : videoUrl ? (
            <div className="w-full space-y-3">
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className={`mx-auto rounded-xl border border-slate-800 ${
                  aspectRatio === '9:16' ? 'max-h-[420px] aspect-[9/16]' : 'w-full aspect-video'
                }`}
              />
              <div className="flex justify-center">
                <a
                  href={videoUrl}
                  download={`elimika-veo-${aspectRatio.replace(':', 'x')}.mp4`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4 Video</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-w-sm">
              <Film className="w-10 h-10 text-violet-400 mx-auto" />
              <div className="text-sm font-bold text-white">
                Ready to Animate Your Photo ({aspectRatio})
              </div>
              <p className="text-xs text-slate-400">
                Upload a photo on the left, choose <strong>16:9</strong> or <strong>9:16</strong>, and click <strong>Animate Photo into Video</strong>.
              </p>
              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs text-left">
                  {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
