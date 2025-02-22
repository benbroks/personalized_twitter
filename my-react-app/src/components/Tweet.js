// src/components/Tweet.js
import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card'
import { Avatar } from '../ui/avatar'
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'

function Tweet({ tweetData }) {
  const { username = 'ben brooks', content = '' } = tweetData

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
            <CardDescription>
              @{username.replace(/\s+/g, '').toLowerCase()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="mb-4">{content}</p>
        <div className="flex gap-2">
          {/**
           * Borderless buttons with color that adapts to light/dark mode.
           * text-gray-700 in light mode, text-gray-200 in dark mode.
           * Icons inherit that color. They also scale on hover.
           */}
          <button className="
            flex items-center gap-1 p-2 
            bg-transparent border-none 
            text-gray-700 dark:text-gray-200 
            transition-transform duration-200 
            hover:scale-110 
            focus:outline-none
          ">
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </button>

          <button className="
            flex items-center gap-1 p-2 
            bg-transparent border-none 
            text-gray-700 dark:text-gray-200 
            transition-transform duration-200 
            hover:scale-110 
            focus:outline-none
          ">
            <ThumbsDown className="h-4 w-4" />
            <span>Dislike</span>
          </button>

          <button className="
            flex items-center gap-1 p-2 
            bg-transparent border-none 
            text-gray-700 dark:text-gray-200 
            transition-transform duration-200 
            hover:scale-110 
            focus:outline-none
          ">
            <MessageSquare className="h-4 w-4" />
            <span>Reply</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Tweet
