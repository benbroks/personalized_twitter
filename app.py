from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import uuid
import os
from dotenv import load_dotenv

COLD_START_PROMPT = "Generate an extremely unique tweet. Keep it under 280 characters. DO NOT INCLUDE HASHTAGS. I'd prefer if you didn't include a question at the end."

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

def warm_prompt():
    system_prompt = """
Generate a unique tweet that is tailored to the interests of the user. Keep it under 280 characters. DO NOT INCLUDE HASHTAGS.
Check out a list of example liked and disliked tweets to cater to the user. With 10% probability, please generate something completely different from the likes and dislikes.
"""

    liked_tweets = "\n".join([
        f"- {app.state.tweets[t].content}" for t in app.state.liked_tweets
    ])

    disliked_tweets = "\n".join([
        f"- {app.state.tweets[t].content}" for t in app.state.disliked_tweets
    ])

    if len(liked_tweets) > 0:
        system_prompt += f"\nLIKED TWEETS:\n{liked_tweets}"
    if len(disliked_tweets) > 0:
        system_prompt += f"\nDISLIKED TWEETS\n{disliked_tweets}"

    return system_prompt



@app.post("/like_tweet/{tweet_id}")
async def like_tweet(tweet_id: str):
    try:
        app.state.liked_tweets.add(tweet_id)
        if tweet_id in app.state.disliked_tweets:
            app.state.disliked_tweets.remove(tweet_id)
        print(warm_prompt())
        return {"tweet_id": tweet_id, "success": True}
    except Exception:
        return {"tweet_id": tweet_id, "success": False}
    
@app.post("/dislike_tweet/{tweet_id}")
async def dislike_tweet(tweet_id: str):
    try:
        app.state.disliked_tweets.add(tweet_id)
        if tweet_id in app.state.liked_tweets:
            app.state.liked_tweets.remove(tweet_id)
        print(warm_prompt())
        return {"tweet_id": tweet_id, "success": True}
    except Exception:
        return {"tweet_id": tweet_id, "success": False}



@app.get("/generate_fake_tweet", response_model=Tweet)
async def generate_fake_tweet():

    client = OpenAI(api_key=open_ai_key)
    if len(app.state.tweets) < 5:
        prompt = COLD_START_PROMPT
    else:
        prompt = warm_prompt()
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=1.0
    )
    print(completion)

    tweet_id = str(uuid.uuid4())
    content = completion.choices[0].message.content
    tweet_object = Tweet(username="ben brooks", content=content, tweet_id=tweet_id)
    app.state.tweets[tweet_id] = tweet_object
    return tweet_object


