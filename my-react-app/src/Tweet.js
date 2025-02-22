// Tweet.js
import React from 'react';

function Tweet({ tweetData }) {
    return (
        <div className="tweet">
            <h3>{tweetData.username}</h3>
            <p>{tweetData.content}</p>
        </div>
    );
}

export default Tweet;