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


COLD_START_PROMPT = "Generate an extremely unique tweet that is meant to garner a reaction (either positive or negative). Keep it under 280 characters. DO NOT INCLUDE HASHTAGS. I'd prefer if you didn't include a question at the end."
COLD_START_PROMPT_PAIR = "Generate two tweets that are extremely different from each other. Keep them under 280 characters. DO NOT INCLUDE HASHTAGS. I'd prefer if you didn't include a question at the end of them."
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
    system_prompt = """
Generate an extremely unique tweet that is meant to garner a reaction (either positive or negative). It should be tailored to the interests of the user, as described below. Keep it under 280 characters. DO NOT INCLUDE HASHTAGS.
"""

    liked_tweets = "\n".join(
        [f"- {app.state.tweets[t].content}" for t in app.state.liked_tweets]
    )

    disliked_tweets = "\n".join(
        [f"- {app.state.tweets[t].content}" for t in app.state.disliked_tweets]
    )

    if app.state.user_description:
        system_prompt += (
            f"\n<user_description>{app.state.user_description}\n</user_description>"
        )

    if len(liked_tweets) > 0:
        system_prompt += f"\n<liked_tweets>\n{liked_tweets}\n</liked_tweets>"
    if len(disliked_tweets) > 0:
        system_prompt += f"\n<disliked_tweets>\n{disliked_tweets}\n</disliked_tweets>"

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
    prompt = warm_prompt()
    # if len(app.state.tweets) < 5:
    #     prompt = COLD_START_PROMPT
    # else:
    #     prompt = warm_prompt()
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
    tweet_object = Tweet(username="ben brooks", content=content, tweet_id=tweet_id)
    app.state.tweets[tweet_id] = tweet_object
    return tweet_object


@app.get("/generate_fake_tweet_pair", response_model=Tweet)
async def generate_fake_tweet_pair():
    if len(app.state.tweets) < 5:
        prompt = COLD_START_PROMPT_PAIR
    else:
        prompt = warm_prompt()
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        response_format=TweetPair,
        temperature=1.0,
    )
    print(completion.choices[0].message.content)

    tweet_id = str(uuid.uuid4())
    content = json.loads(completion.choices[0].message.content)
    tweet_object = Tweet(username="ben brooks", content=content, tweet_id=tweet_id)
    app.state.tweets[tweet_id] = tweet_object
    return tweet_object
