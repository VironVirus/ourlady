"use client";

import { useState } from "react";
import { HeartIcon, ShareIcon } from "@/components/site-icons";

type NewsStoryActionsProps = {
  slug: string;
  title: string;
  initialLikes: number;
};

export function NewsStoryActions({
  slug,
  title,
  initialLikes
}: NewsStoryActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liking, setLiking] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLike() {
    if (liking) {
      return;
    }

    setLiking(true);
    setMessage("");

    try {
      const response = await fetch(`/api/news/${slug}/like`, {
        method: "POST"
      });
      const result = (await response.json()) as {
        likes?: number;
        error?: string;
      };

      if (!response.ok || typeof result.likes !== "number") {
        setMessage(result.error ?? "Unable to update the like right now.");
        return;
      }

      setLikes(result.likes);
      setMessage("Thank you for your support.");
    } catch {
      setMessage("Unable to update the like right now.");
    } finally {
      setLiking(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url
        });
        setMessage("Story shared.");
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessage("Story link copied.");
    } catch {
      setMessage("Unable to share right now.");
    }
  }

  return (
    <div className="story-actions-wrap">
      <div className="story-actions">
        <button type="button" className="button button--secondary" onClick={handleLike}>
          <HeartIcon className="icon" />
          {liking ? "Saving..." : `Like (${likes})`}
        </button>
        <button type="button" className="button button--secondary" onClick={handleShare}>
          <ShareIcon className="icon" />
          Share Story
        </button>
      </div>
      {message ? <p className="admin-hint">{message}</p> : null}
    </div>
  );
}
