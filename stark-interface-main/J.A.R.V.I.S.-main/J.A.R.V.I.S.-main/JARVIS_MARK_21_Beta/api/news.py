# api/news.py

import requests, os
from dotenv import load_dotenv

load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def get_newsapi_articles():
    try:
        url = f"https://newsapi.org/v2/top-headlines?category=technology&country=us&apiKey={NEWS_API_KEY}"
        #url = f"https://newsapi.org/v2/everything?q=technology&sortBy=publishedAt&language=en&apiKey={NEWS_API_KEY}"
        # for EVERYTHING endpoint
        res = requests.get(url).json()

        if res.get("status") != "ok":
            raise Exception("NewsAPI error")

        articles = []
        for item in res["articles"][:5]:
            articles.append(f"• {item['title']} ({item['source']['name']})")
        return articles
    except:
        raise Exception("NewsAPI failed")

def get_hackernews_articles():
    try:
        ids = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json").json()
        articles = []
        for story_id in ids[:5]:
            story = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json").json()
            title = story.get("title", "No title")
            articles.append(f"• {title} (HackerNews)")
        return articles
    except:
        return ["⚠️ Couldn't load backup news either."]
