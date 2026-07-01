import os

CHAT_LOG_FILE = os.path.join("DATA", "chat_log.txt")

#memo = {}
conversation_history = []#stores entire conversation history in memory

def load_conversation_history():
    if os.path.exists(CHAT_LOG_FILE):
        with open(CHAT_LOG_FILE, "r", encoding="utf-8") as file:
            lines = file.readlines()

            user, jarvis = "", ""
            for line in lines:
                if line.startswith("You:"):
                    user = line.replace("You:", "").strip()
                elif line.startswith("Jarvis:"):
                    jarvis = line.replace("Jarvis:", "").strip()
                    if user and jarvis:
                        conversation_history.append({"user": user, "jarvis": jarvis})
                        user, jarvis = "", ""

# Save memory to file
def save_conversation_history():
    with open(CHAT_LOG_FILE, "w", encoding="utf-8") as file:
        for item in conversation_history:
            file.write(f"You: {item['user']}\nJarvis: {item['jarvis']}\n\n")


#########                               ######### 
import json
MEMORY_FILE = os.path.join("DATA", "memory.json")

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "r") as file:
            return json.load(file)
    return {}

def save_memory(memory):
    with open(MEMORY_FILE, "w") as file:
        json.dump(memory, file, indent=4)

def remember(key, value):
    memory = load_memory()
    memory[key.lower()] = value
    save_memory(memory)

def recall(key):
    memory = load_memory()
    return memory.get(key.lower(), "I don't remember that yet.")