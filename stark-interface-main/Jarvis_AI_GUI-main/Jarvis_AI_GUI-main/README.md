[README.md](https://github.com/user-attachments/files/23505480/README.md)
# 🤖 Jarvis AI - Iron Man Style Desktop Assistant (GUI Version)

An advanced **voice-enabled AI assistant** built using **Python, PyQt5, Hugging Face, and Speech Recognition** — designed in a **dark futuristic Iron-Man theme**.  
Jarvis can listen, think, and talk — just like a real AI companion 💬🎙️  

---

## 🧠 Features

✅ **Voice Recognition (Hands-free mode)** – Talk naturally, Jarvis listens & understands.  
✅ **AI Chat (via Hugging Face BlenderBot)** – Get smart, conversational responses offline.  
✅ **Text-to-Speech (Male voice)** – Jarvis replies in a natural human voice.  
✅ **Modern Dark GUI** – Styled like Iron Man’s JARVIS interface using PyQt5.  
✅ **Animated Waveform Visualization** – See Jarvis “listening” with smooth motion.  
✅ **Offline Commands** – Ask for time, date, jokes, Wikipedia summaries, and more.  
✅ **Extendable Codebase** – Add OpenAI or local LLMs for even smarter conversations.

---

## 🖥️ Technologies Used

| Component | Technology |
|------------|-------------|
| GUI | PyQt5 |
| Voice Recognition | SpeechRecognition |
| Voice Output | pyttsx3 |
| AI Chat | Hugging Face Transformers (BlenderBot) |
| Design | Dark Futuristic Theme + Wave Animation |

---

## ⚙️ Installation

### Step 1: Clone this Repository
```bash
git clone https://github.com/HasanIkbal/Jarvis_AI_GUI.git
cd Jarvis_AI_GUI
```

### Step 2: Create Virtual Environment
```bash
conda create -n jarvis_gui_env python=3.10
conda activate jarvis_gui_env
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

If `requirements.txt` is missing, install manually:
```bash
pip install pyqt5 pyttsx3 SpeechRecognition transformers torch torchvision torchaudio
```

---

## 🚀 Run the Assistant
```bash
python jarvis_gui.py
```

Jarvis will:
- Start listening 🎙️  
- Speak responses 🗣️  
- Display animations 🌀  

---

## 🎨 UI Assets

Ensure these files exist in the project folder:
```
wave.gif
bg_dark.jpg
mic_on.png
mic_off.png
```

You can use free Iron-Man or futuristic style images from:
- [https://www.pexels.com](https://www.pexels.com)
- [https://unsplash.com](https://unsplash.com)
- [https://icons8.com](https://icons8.com)

---

## 🧩 Folder Structure

```
Jarvis_AI_GUI/
│
├── jarvis_gui.py
├── requirements.txt
├── wave.gif
├── bg_dark.jpg
├── mic_on.png
├── mic_off.png
└── README.md
```

---

## 🧑‍💻 Developer

**👨‍💻 Hasan Ikbal**  
Full Stack & AI/ML Developer  
🌐 [worldwebmedia.in](https://worldwebmedia.in)  
💼 [LinkedIn](https://www.linkedin.com/in/hasan-ikbal)  
📧 hasanikbaL7814@gmail.com  

---

## 💡 Future Enhancements
- Integrate **OpenAI GPT-4 / GPT-5** for advanced AI responses  
- Add **personalization memory** (Jarvis remembers context)  
- Include **home automation controls** (IoT + voice)  
- Implement **emotion-based voice modulation**  

---

## 🏁 License

This project is open-source and available under the [MIT License](LICENSE).

---

> _“I am Jarvis, your personal AI assistant. Always ready to serve you, sir.”_ 🧠⚡
