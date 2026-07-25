"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function ShareLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const shareUrl = `${window.location.origin}/s/${token}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowUrl(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "برنامه کلاس شنا",
          url: shareUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">کپی شد!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              کپی لینک شاگرد
            </>
          )}
        </button>
        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card active:scale-95"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
      {showUrl && (
        <div className="rounded-xl bg-muted/50 p-2 text-center">
          <p dir="ltr" className="text-xs text-muted-foreground select-all">{shareUrl}</p>
        </div>
      )}
    </div>
  );
}
