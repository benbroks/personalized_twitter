from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import uuid
import os
from dotenv import load_dotenv

class Tweet(BaseModel):
    username: str
    content: str
    tweet_id: str

load_dotenv()
open_ai_key = os.getenv("OPEN_AI_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    app.state.liked_tweets = set()
    app.state.disliked_tweets = set()
    app.state.tweets = {}


@app.post("/like_tweet/{tweet_id}")
async def like_tweet(tweet_id: str):
    try:
        app.state.liked_tweets.add(tweet_id)
        if tweet_id in app.state.disliked_tweets:
            app.state.disliked_tweets.remove(tweet_id)
        return {"tweet_id": tweet_id, "success": True}
    except Exception:
        return {"tweet_id": tweet_id, "success": False}
    
@app.post("/dislike_tweet/{tweet_id}")
async def dislike_tweet(tweet_id: str):
    try:
        app.state.disliked_tweets.add(tweet_id)
        if tweet_id in app.state.liked_tweets:
            app.state.liked_tweets.remove(tweet_id)
        return {"tweet_id": tweet_id, "success": True}
    except Exception:
        return {"tweet_id": tweet_id, "success": False}



@app.get("/generate_fake_tweet", response_model=Tweet)
async def generate_fake_tweet():

    client = OpenAI(api_key=open_ai_key)
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": "write a really funny tweet! it should be under 280 characters. don't include hashtags!"
            }
        ]
    )
    print(completion)

    tweet_id = str(uuid.uuid4())
    content = completion.choices[0].message.content
    tweet_object = Tweet(username="ben brooks", content=content, tweet_id=tweet_id)
    app.state.tweets[tweet_id] = tweet_object
    return tweet_object


