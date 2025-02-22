import React, { useState, useRef } from 'react'
import { ThemeProvider } from './ThemeProvider'
import DarkModeToggle from './components/DarkModeToggle'
import TweetList from './components/Tweetlist'
import { Button } from './ui/button'
import { Upload } from 'lucide-react'
import './App.scss'

function App() {
  const [tweets, setTweets] = useState([])
  const [tweetPair, setTweetPair] = useState(null)
  const [likedTweets, setLikedTweets] = useState([])
  const [dislikedTweets, setDislikedTweets] = useState([])
  const [hasUploadedImage, setHasUploadedImage] = useState(false)
  const fileInputRef = useRef(null)

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

  const handleOpenFileDialog = () => {
    fileInputRef.current && fileInputRef.current.click()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/submit_photo', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Upload successful', data)
      // When the image uploads successfully, update our flag.
      setHasUploadedImage(true)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleLike = (tweetId) => {
    setLikedTweets((prev) => {
      if (prev.includes(tweetId)) {
        return prev.filter((id) => id !== tweetId)
      } else {
        setDislikedTweets((prevDisliked) =>
          prevDisliked.filter((id) => id !== tweetId)
        )
        return [...prev, tweetId]
      }
    })
  }

  const handleDislike = (tweetId) => {
    setDislikedTweets((prev) => {
      if (prev.includes(tweetId)) {
        return prev.filter((id) => id !== tweetId)
      } else {
        setLikedTweets((prevLiked) =>
          prevLiked.filter((id) => id !== tweetId)
        )
        return [...prev, tweetId]
      }
    })
  }

  return (
    <ThemeProvider>
      <div className="font-sans min-h-screen bg-gray-50 dark:bg-neutral-950">
        <header className="flex items-center justify-between border-b p-4 border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Twitter Slop
          </h1>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            {hasUploadedImage && (
              <Button
                variant="outline"
                onClick={generateFakeTweet}
                className="border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                Sloppy Slop
              </Button>
            )}
            {!hasUploadedImage && (

            <Button
              variant="outline"
              onClick={handleOpenFileDialog}
              className="border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </Button>
            )}
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl p-4">
          {hasUploadedImage ? (
            <TweetList
              tweets={tweets}
              generateFakeTweet={generateFakeTweet}
              onLike={handleLike}
              onDislike={handleDislike}
              likedTweets={likedTweets}
              dislikedTweets={dislikedTweets}
            />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Upload an image to start Slopping
            </p>
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
