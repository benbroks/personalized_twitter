// src/components/TweetList.js
import React from 'react'
import Tweet from './Tweet'

function TweetList({ tweets, generateFakeTweet, onLike, onDislike, likedTweets, dislikedTweets }) {
    if (!tweets.length) {
    return (
      <p className="mt-4 text-center text-gray-500 dark:text-gray-400">
        No tweets yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {tweets.map((tweet, index) => (
        <Tweet 
          key={index} 
          tweetData={tweet} 
          generateFakeTweet={generateFakeTweet}
          onLike={onLike}
          onDislike={onDislike}
          likedTweets={likedTweets}
          dislikedTweets={dislikedTweets}
        />
      ))}
    </div>
  )
}

export default TweetList
