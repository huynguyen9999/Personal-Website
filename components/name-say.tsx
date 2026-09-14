"use client";

import { useEffect, useState } from "react";

const spoken = "Huy Nguyễn";

export function NameSay() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
  }, []);

  function play() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = "vi-VN";
    utterance.rate = 0.86;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="name-say">
      <p className="name-say__ipa" lang="en">
        <span>hwee</span>
        <span aria-hidden="true">·</span>
        <span>nwin</span>
      </p>
      <p className="name-say__hint">Huy is “hwee”. Nguyen is “nwin”.</p>
      <button
        className="name-say__play"
        type="button"
        onClick={play}
        aria-label="Play pronunciation of Huy Nguyen"
        aria-pressed={speaking}
        disabled={!supported}
      >
        {supported
          ? speaking
            ? "Speaking…"
            : "Click to hear a robot say it"
          : "Pronunciation is unavailable in this browser"}
      </button>
    </div>
  );
}
