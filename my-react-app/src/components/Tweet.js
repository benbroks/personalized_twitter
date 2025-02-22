// src/components/Tweet.js
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Avatar } from '../ui/avatar'
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import { cn } from '../lib/utils' // if you have a utility for merging classes

function Tweet({ tweetData, generateFakeTweet, onLike, onDislike, likedTweets, dislikedTweets }) {
  const { username = 'ben brooks', content = '' } = tweetData

  const isLiked = likedTweets.includes(tweetData.tweet_id)
  const isDisliked = dislikedTweets.includes(tweetData.tweet_id)

  const handleLike = () => {
    onLike(tweetData.tweet_id)
  }

  const handleDislike = () => {
    onDislike(tweetData.tweet_id)
  }

  return (
    <Card className="animate-fadeIn">
      <CardHeader className="gap-2">
        <div className="flex items-center gap-2">
          <Avatar
            src="https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
            alt="User Avatar"
          />
          <div>
            <CardTitle>{username}</CardTitle>
            <CardDescription>@{username.replace(/\s+/g, '').toLowerCase()}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="mb-4">{content}</p>
        <div className="flex gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 p-2 rounded-md transition-transform duration-200 hover:scale-110 focus:outline-none",
              // Active (Liked) State
              isLiked
                ? "border-blue-500 text-blue-500 dark:text-blue-400 dark:border-blue-400"
                // Inactive State
                : "border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-700"
            )}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={handleDislike}
            className={cn(
              "flex items-center gap-1 p-2 rounded-md transition-transform duration-200 hover:scale-110 focus:outline-none",
              // Active (Disliked) State
              isDisliked
                ? "border-red-500 text-red-500 dark:text-red-400 dark:border-red-400"
                // Inactive State
                : "border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-700"
            )}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>Dislike</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Tweet
