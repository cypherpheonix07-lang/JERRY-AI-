import os
import requests
from dotenv import load_dotenv

load_dotenv()
AV_KEY = os.getenv("ALPHA_VANTAGE_KEY")
FINNHUB_KEY = os.getenv("FINNHUB_API_KEY")

STOCKS = {
    "RELIANCE": "RELIANCE",
    "TCS": "TCS",
        #"INFY": "NSE:INFY",
    "HDFC": "HDFCBANK",
    "ICICI": "ICICIBANK",
    "SBIN": "SBIN"
}

def get_stock_price(symbol):
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={AV_KEY}"
        data = requests.get(url).json()
        quote = data["Global Quote"]
        price = float(quote["05. price"])
        change = float(quote["09. change"])
        pct = float(quote["10. change percent"].replace('%', ''))
        emoji = "▲" if change > 0 else "▼" if change < 0 else "➖"
        return f"{symbol.split(':')[-1]}: ₹{price:.2f} {emoji} ({pct:.2f}%)"
    except Exception as e:
        print(f"Error fetching stock price for {symbol}: {e}")#for debugging
        # Fallback to Finnhub
        return get_stock_price_finnhub(symbol.replace("NSE:", "") + ".NS")

def get_stock_price_finnhub(symbol):
    try:
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_KEY}"
        data = requests.get(url).json()

        price = float(data["c"])
        change = float(data["d"])
        pct = float(data["dp"])
        emoji = "▲" if change > 0 else "▼" if change < 0 else "➖"

        return f"{symbol.replace('.NS','')}: ₹{price:.2f} {emoji} ({pct:.2f}%)"
    except Exception as e:
        print(f"Error fetching FINHUB stock price for {symbol}: {e}")#for debugging
        return f"{symbol}: ❌ Finnhub Error"



def get_gold_price_inr():
    try:
        url = f"https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=INR&apikey={AV_KEY}"
        data = requests.get(url).json()
        rate = float(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
        return f"Gold (24k): ₹{rate:.2f}/gm"
    except Exception as e:
        print(f"Error fetching gold price: {e}")#for debugging
        return "Gold: ⚠️ Error"

def get_market_data():
    lines = []
    for name, symbol in STOCKS.items():
        lines.append(get_stock_price(symbol))
    lines.append(get_gold_price_inr())
    return lines
