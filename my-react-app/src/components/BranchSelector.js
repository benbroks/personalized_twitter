import React, { useState } from 'react'
import Tweet from './Tweet'

export default function BranchSelector({ branchTweets, onSelect }) {
  const [selectedTweetId, setSelectedTweetId] = useState(null)

  const handleSelect = tweet => {
    setSelectedTweetId(tweet.tweet_id)
    // Delay to allow animation
    setTimeout(() => {
      onSelect(tweet)
    }, 500)
  }

  return (
    <div>
      <h2 className="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
        Please like one of these tweets to choose your path
      </h2>
      <div className="flex justify-around items-center h-full">
        {branchTweets.map((tweet, index) => {
          const baseOffset = index === 0 ? '-translate-x-10' : 'translate-x-10'
          const offsetClass = selectedTweetId === tweet.tweet_id ? 'translate-x-0' : baseOffset

          return (
            <div
              key={tweet.tweet_id}
              className={`w-1/2 transition-all duration-500 ${offsetClass}`}
            >
              <Tweet
                tweetData={tweet}
                generateFakeTweet={() => {}}
                onLike={() => handleSelect(tweet)}
                onDislike={() => {}}
                likedTweets={[]}
                dislikedTweets={[]}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
