// App.js
import React, { useState, useEffect } from 'react';
import Tweet from './Tweet';

function App() {
    const [tweets, setTweets] = useState([]);

    const generateFakeTweet = async () => {
        try {
            const response = await fetch('http://localhost:8000/generate_fake_tweet');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const tweet = await response.json();
            setTweets([tweet, ...tweets]);
        } catch (error) {
            console.error('Error fetching the tweet:', error);
        }
    };

    return (
        <div>
            <h1>Fake Tweet Generator</h1>
            <button onClick={generateFakeTweet}>Generate Fake Tweet</button>
            <div>
                {tweets.map((tweet, index) => (
                    <Tweet key={index} tweetData={tweet} />
                ))}
            </div>
        </div>
    );
}

export default App;