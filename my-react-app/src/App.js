import React, { useState, useRef } from 'react'
import { ThemeProvider } from './ThemeProvider'
import DarkModeToggle from './components/DarkModeToggle'
import TweetList from './components/Tweetlist'
import BranchSelector from './components/BranchSelector'
import { Button } from './ui/button'
import { Upload, Loader2 } from 'lucide-react'
import './App.scss'

function App() {
  const [tweets, setTweets] = useState([])
  const [likedTweets, setLikedTweets] = useState([])
  const [dislikedTweets, setDislikedTweets] = useState([])
  const [hasUploadedImage, setHasUploadedImage] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  // New state for branch tweet selection and loading indicator
  const [branchTweets, setBranchTweets] = useState([])
  const [isSelectingBranch, setIsSelectingBranch] = useState(false)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  
  const fileInputRef = useRef(null)

  const generateFakeTweet = async () => {
    try {
      const response = await fetch('http://localhost:8000/generate_fake_tweet')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const tweet = await response.json()
      // Keep only the latest 5 tweets
      setTweets(prev =>
        prev.length === 5 ? [tweet, ...prev.slice(0, -1)] : [tweet, ...prev]
      )
    } catch (error) {
      console.error('Error fetching the tweet:', error)
    }
  }

  // New function to generate branch tweets concurrently with a loading state
  const generateBranchTweets = async () => {
    try {
      setIsLoadingBranches(true)
      const responses = await Promise.all([
        fetch('http://localhost:8000/generate_fake_tweet'),
        fetch('http://localhost:8000/generate_fake_tweet'),
      ])
      const tweetsData = await Promise.all(responses.map(res => res.json()))
      setBranchTweets(tweetsData)
      setIsSelectingBranch(true)
    } catch (error) {
      console.error('Error generating branch tweets:', error)
    } finally {
      setIsLoadingBranches(false)
    }
  }

  const handleOpenFileDialog = () => {
    fileInputRef.current && fileInputRef.current.click()
  }

  const handleFileUpload = async event => {
    const file = event.target.files[0]
    if (!file) return

    setIsUploading(true)

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
      setHasUploadedImage(true)
      // After uploading, generate branch tweets
      generateBranchTweets()
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLike = tweetId => {
    setLikedTweets(prev => {
      if (prev.includes(tweetId)) {
        return prev.filter(id => id !== tweetId)
      } else {
        setDislikedTweets(prevDisliked =>
          prevDisliked.filter(id => id !== tweetId)
        )
        return [...prev, tweetId]
      }
    })
    // Call like endpoint
    fetch(`http://localhost:8000/like_tweet/${tweetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tweetId })
    })
      .then(res => res.json())
      .then(data => console.log('Like endpoint response', data))
      .catch(error => console.error('Error liking tweet:', error))
  }

  const handleDislike = tweetId => {
    setDislikedTweets(prev => {
      if (prev.includes(tweetId)) {
        return prev.filter(id => id !== tweetId)
      } else {
        setLikedTweets(prevLiked =>
          prevLiked.filter(id => id !== tweetId)
        )
        return [...prev, tweetId]
      }
    })
    // Call dislike endpoint
    fetch(`http://localhost:8000/dislike_tweet/${tweetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => console.log('Dislike endpoint response', data))
      .catch(error => console.error('Error disliking tweet:', error))
  }

  // Called when the user selects one of the branch tweets
  const handleBranchSelect = selectedTweet => {
    // When a branch tweet is selected, call the like logic
    handleLike(selectedTweet.tweet_id)
    // Add it to the timeline as the first tweet
    setTweets(prev => [selectedTweet, ...prev])
    // Exit branch selection mode so the timeline reappears
    setIsSelectingBranch(false)
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
                Generate Fake Tweet
              </Button>
            )}
            {!hasUploadedImage && (
              <Button
                variant="outline"
                onClick={handleOpenFileDialog}
                className="border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </Button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </header>
        <main className={`mx-auto w-full ${isSelectingBranch ? "max-w-2xl" : "max-w-xl"} p-4`}>
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-gray-500 dark:text-gray-400">Uploading image...</span>
            </div>
          ) : isLoadingBranches ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-gray-500 dark:text-gray-400">Generating initial tweets...</span>
            </div>
          ) : isSelectingBranch ? (
            <BranchSelector
              branchTweets={branchTweets}
              onSelect={handleBranchSelect}
            />
          ) : hasUploadedImage ? (
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
