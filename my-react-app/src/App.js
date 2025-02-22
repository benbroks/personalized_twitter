// src/App.js
import React, { useState } from 'react'
import { ThemeProvider } from './ThemeProvider'
import DarkModeToggle from './components/DarkModeToggle'
import TweetList from './components/Tweetlist'
import { Button } from './ui/button'
import './App.scss' // or App.scss, which includes tailwind directives

function App() {
  const [tweets, setTweets] = useState([])

  const generateFakeTweet = async () => {
    try {
      const response = await fetch('http://localhost:8000/generate_fake_tweet')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const tweet = await response.json()
      // Keep only the latest 5 tweets
      setTweets((prev) =>
        prev.length === 5 ? [tweet, ...prev.slice(0, -1)] : [tweet, ...prev]
      )
    } catch (error) {
      console.error('Error fetching the tweet:', error)
    }
  }

  return (
    <ThemeProvider>
        {/*
        "font-sans" uses Inter (configured in tailwind.config.js),
        "bg-gray-50 dark:bg-neutral-950" for lighter in light mode, darker in dark mode
      */}
      <div className="font-sans min-h-screen bg-gray-50 dark:bg-neutral-950">
        <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Fake Tweet Generator
          </h1>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Button onClick={generateFakeTweet}>Generate Fake Tweet</Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-xl p-4">
          <TweetList tweets={tweets} />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
