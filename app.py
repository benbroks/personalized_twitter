from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import uuid
import json
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import base64
from faker import Faker

CONVERSATION_TOPICS = [
    "Travel Experiences",
    "Favorite Books or Authors",
    "Hobbies and Interests",
    "Food Culture",
    "Technology Trends",
    "Environmental Issues",
    "Sports News and Events",
    "Personal Growth Goals",
    "Historical Events or Figures",
    "Artistic Influences",
    "Future Career Aspirations",
    "Cultural Festivals Around the World",
    "Innovative Startups",
    "Mental Health Awareness",
    "Space Exploration Updates",
    "Social Media Impact on Society",
    "Fitness Routines",
    ".NET Framework vs Java",
    "AI Ethics Discussions",
    "Local Community Projects",
    "Pet Care Tips",
    "Philosophical Questions",
    "Upcoming Movie Releases",
    "Language Learning Experiences",
    "Gaming Industry Developments"
]

TONE_LIST = [
    "Amused",
    "Accusatory",
    "Angry",
    "Apathetic",
    "Apologetic",
    "Absurd",
    "Ambivalent",
    "Optimistic",
    "Acerbic",
    "Adoring",
    "Anxious",
    "Ardent",
    "Abashed",
    "Admiring",
    "Animated",
    "Appreciative",
    "Assertive",
    "Bitter",
    "Calm",
    "Formal",
    "Humorous",
    "Informal",
    "Pessimistic",
    "Aggressive"
]


load_dotenv()
open_ai_key = os.getenv("OPEN_AI_KEY")
client = OpenAI(api_key=open_ai_key)

# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

class Tweet(BaseModel):
    username: str
    content: str
    tweet_id: str


class TweetPair(BaseModel):
    tweet_1: str
    tweet_2: str


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
    app.state.user_description = None


def warm_prompt():
    import random
    random_topic = random.choice(CONVERSATION_TOPICS)
    random_tone = random.choice(TONE_LIST)
    system_prompt = f"""
Generate a controversial tweet through the lens of the user's interests as described below. Keep it under 280 characters. DO NOT INCLUDE HASHTAGS. DO NOT END THE TWEET WITH A QUESTION. DO NOT START THE TWEET WITH 'just'.

The tweet's uniqueness should be with respect to the tweet's listed below (if they exist).
    """

    transformed_tweets = []
    for id, v in app.state.tweets.items():
        if id in app.state.liked_tweets:
            transformed_tweets.append(f"- [USER LIKED] {v.content}")
        elif id in app.state.disliked_tweets:
            transformed_tweets.append(f"- [USER DISLIKED] {v.content}")
        else:
            transformed_tweets.append(f"- {v.content}")
    compiled_tweets = "\n".join(transformed_tweets)

    if app.state.user_description:
        system_prompt += (
            f"\n<user_description>{app.state.user_description}\n</user_description>"
        )
    
    if len(compiled_tweets) > 0:
        system_prompt += f"\n<former_tweets>\n{compiled_tweets}\n</former_tweets>"

    return system_prompt


@app.post("/submit_photo")
async def submit_photo(file: UploadFile = File(...)):
    try:
        # Define the upload folder relative to the current working directory
        upload_folder = os.path.join(os.getcwd(), "uploads")
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        # Sanitize the filename to remove any unsafe characters
        filename = secure_filename(file.filename)
        file_location = os.path.join(upload_folder, filename)

        # Save the uploaded file to the uploads directory
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())
        
        base64_image = encode_image(file_location)

        # Call OpenAI to summarize the picture
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Based on this photo, write a paragraph description about the person who submitted it.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            temperature=0.5,
        )
        summary = completion.choices[0].message.content
        app.state.user_description = summary
        print(summary)

        # Return a success response with the sanitized filename and summary
        return {"filename": filename, "summary": summary, "success": True}
    except Exception as e:
        return {"error": str(e), "success": False}


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
    prompt = warm_prompt()
    print(prompt)
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=1.0,
    )
    print(completion)

    tweet_id = str(uuid.uuid4())
    content = completion.choices[0].message.content
    fake = Faker()
    tweet_object = Tweet(username=fake.name(), content=content, tweet_id=tweet_id)
    app.state.tweets[tweet_id] = tweet_object
    return tweet_object
    
