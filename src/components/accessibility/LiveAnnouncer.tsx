"use client";

import React from "react";
import { useAccessibility } from "@/lib/accessibilityContext";

export default function LiveAnnouncer() {
  const { liveMessage } = useAccessibility();

  if (!liveMessage) return null;

  return (
    <div
      role="status"
      aria-live={liveMessage.priority}
      aria-atomic="true"
      className="sr-only"
    >
      {liveMessage.text}
    </div>
  );
}
