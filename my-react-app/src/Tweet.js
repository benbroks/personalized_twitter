// Tweet.js
import React, { useState } from 'react';

function Tweet({ tweetData, generateFakeTweet }) {
    const handleLike = async () => {
        try {
            const response = await fetch(`http://localhost:8000/like_tweet/${tweetData.tweet_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tweetId: tweetData.id }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            await generateFakeTweet();
        } catch (error) {
            console.error('Error liking the tweet:', error);
        }
    };

    const handleDislike = async () => {
        try {
            const response = await fetch(`http://localhost:8000/dislike_tweet/${tweetData.tweet_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            await generateFakeTweet();
        } catch (error) {
            console.error('Error disliking the tweet:', error);
        }
    };

    return (
        <div className="tweet">
            <h3>{tweetData.username}</h3>
            <p>{tweetData.content}</p>
            <div>
                <button onClick={handleLike}>Like</button>
                <button onClick={handleDislike}>Dislike</button>
            </div>
        </div>
    );
}

export default Tweet;