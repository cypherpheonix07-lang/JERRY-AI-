# jarvis_gui.py
import sys
import os
import speech_recognition as sr
from PyQt5.QtWidgets import (
    QApplication, QWidget, QLabel, QVBoxLayout, QHBoxLayout,
    QTextEdit, QPushButton, QGraphicsDropShadowEffect
)
from PyQt5.QtGui import QFont, QPalette, QColor, QMovie, QIcon
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QSize, QPropertyAnimation, QRect
import pyttsx3
from datetime import datetime
import webbrowser
import torch
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration

# Model to use (adjust if you changed model)
MODEL_NAME = "facebook/blenderbot-400M-distill"

# ---------- AI Worker (background) ----------
class AIWorker(QThread):
    finished = pyqtSignal(str)

    def __init__(self, text, tokenizer, model, device):
        super().__init__()
        self.text = text
        self.tokenizer = tokenizer
        self.model = model
        self.device = device

    def run(self):
        try:
            inputs = self.tokenizer([self.text], return_tensors="pt", padding=True).to(self.device)
            with torch.no_grad():
                output_ids = self.model.generate(**inputs, max_new_tokens=120, do_sample=True, top_p=0.9)
            reply = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
            self.finished.emit(reply)
        except Exception as e:
            self.finished.emit(f"AI error: {str(e)}")

# ---------- Main GUI ----------
class JarvisWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.asset_path = os.path.join(os.path.dirname(__file__), "assets")
        self.setWindowTitle("J.A.R.V.I.S — Intelligent Assistant")
        self.setGeometry(140, 60, 1100, 720)
        self.initUI()
        self.initVoice()
        self.recognizer = sr.Recognizer()
        self.mic = sr.Microphone()
        # load small model (may take time)
        self.append_message("Jarvis", "Loading AI model... please wait.")
        self.speak("Loading AI model. Please wait.")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            self.tokenizer = BlenderbotTokenizer.from_pretrained(MODEL_NAME)
            self.model = BlenderbotForConditionalGeneration.from_pretrained(MODEL_NAME).to(self.device)
            self.append_message("Jarvis", "Model loaded. Ready.")
            self.speak("Model loaded. I am ready.")
        except Exception as e:
            self.append_message("Jarvis", f"Model load failed: {e}")
            self.speak("Model failed to load.")
            self.tokenizer = None
            self.model = None

    def initUI(self):
        # Dark theme palette
        palette = QPalette()
        palette.setColor(QPalette.Window, QColor("#060606"))
        palette.setColor(QPalette.Base, QColor("#0f0f0f"))
        palette.setColor(QPalette.Text, QColor("#00f3ff"))
        self.setPalette(palette)

        main_layout = QVBoxLayout()
        header = QLabel("🧠 J.A.R.V.I.S — Intelligent Assistant")
        header.setFont(QFont("Consolas", 20, QFont.Bold))
        header.setAlignment(Qt.AlignCenter)
        header.setStyleSheet("color: #00f3ff; margin: 8px;")

        # Chat display
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.setStyleSheet(
            "background-color: #070707; color: #c7ffff; font-family: Consolas; font-size: 15px; padding:10px; border-radius:8px;"
        )

        # Input area container
        bottom_layout = QHBoxLayout()

        # Input area
        self.input_box = QTextEdit()
        self.input_box.setFixedHeight(70)
        self.input_box.setStyleSheet(
            "background-color: #0b0b0b; color: white; font-family: Consolas; font-size:14px; border: 1px solid #0b5f6b; border-radius:8px;"
        )

        # Right side controls: mic + send + ai buttons stacked vertically
        controls_layout = QVBoxLayout()
        controls_layout.setAlignment(Qt.AlignTop)

        # Mic button with icon
        self.mic_button = QPushButton()
        self.mic_button.setCursor(Qt.PointingHandCursor)
        mic_off = os.path.join(self.asset_path, "mic_off.png")
        mic_on = os.path.join(self.asset_path, "mic_on.png")
        if os.path.exists(mic_off):
            self.mic_button.setIcon(QIcon(mic_off))
            self.mic_button.setIconSize(QSize(48, 48))
        else:
            self.mic_button.setText("🎤")

        # style mic button
        self.mic_button.setFixedSize(70, 70)
        self.mic_button.setStyleSheet("""
            QPushButton { background-color: #071212; border-radius: 35px; border: 2px solid #00f3ff; }
            QPushButton:hover { border: 2px solid #07ffff; }
        """)

        # Add drop shadow effect for glow
        self.mic_shadow = QGraphicsDropShadowEffect(blurRadius=0, xOffset=0, yOffset=0)
        self.mic_shadow.setColor(QColor("#ff0033"))  # red glow when active
        self.mic_button.setGraphicsEffect(self.mic_shadow)

        # Send button
        self.send_button = QPushButton("Send")
        self.send_button.setFixedHeight(44)
        # AI button (force typed input to AI)
        self.ai_button = QPushButton("AI Reply")
        self.ai_button.setFixedHeight(44)

        # style send/ai
        btn_style = """
            QPushButton {
                background-color: #00f3ff; color: black; font-weight: bold; border-radius: 8px; padding: 8px 12px;
            }
            QPushButton:hover { background-color: #2affff; }
        """
        self.send_button.setStyleSheet(btn_style)
        self.ai_button.setStyleSheet(btn_style)

        # Animated waveform GIF label (hidden by default)
        self.wave_label = QLabel()
        wave_gif = os.path.join(self.asset_path, "wave.gif")
        if os.path.exists(wave_gif):
            self.wave_movie = QMovie(wave_gif)
            self.wave_movie.setScaledSize(QSize(320, 80))
            self.wave_label.setMovie(self.wave_movie)
            self.wave_label.setVisible(False)
        else:
            self.wave_label = QLabel("...listening...")
            self.wave_label.setStyleSheet("color:#ff6b6b;")

        # assemble controls
        controls_layout.addWidget(self.mic_button)
        controls_layout.addWidget(self.wave_label)
        controls_layout.addWidget(self.send_button)
        controls_layout.addWidget(self.ai_button)
        controls_layout.addStretch()

        bottom_layout.addWidget(self.input_box, 1)
        bottom_layout.addLayout(controls_layout)

        # Put all together
        main_layout.addWidget(header)
        main_layout.addWidget(self.chat_display, 1)
        main_layout.addLayout(bottom_layout)
        self.setLayout(main_layout)

        # Connect signals
        self.send_button.clicked.connect(self.handle_text_input)
        self.ai_button.clicked.connect(self.handle_text_ai)
        self.mic_button.clicked.connect(self.handle_voice_input)

        # Prepare mic glow animation (pulsing)
        self._mic_anim = QPropertyAnimation(self.mic_shadow, b"blurRadius", self)
        self._mic_anim.setStartValue(0)
        self._mic_anim.setEndValue(30)
        self._mic_anim.setDuration(700)
        self._mic_anim.setLoopCount(-1)

    def initVoice(self):
        self.engine = pyttsx3.init()
        voices = self.engine.getProperty("voices")
        # try to select a male voice
        for v in voices:
            if "male" in v.name.lower() or "david" in v.name.lower():
                self.engine.setProperty('voice', v.id)
                break
        self.engine.setProperty('rate', 165)

    def speak(self, text):
        # simple speak (blocks briefly)
        print("Jarvis:", text)
        self.engine.say(text)
        self.engine.runAndWait()

    def append_message(self, sender, message):
        if sender.lower() == "jarvis":
            self.chat_display.append(f"<div style='color:#7fffd4'><b>{sender}:</b> {message}</div>")
        else:
            self.chat_display.append(f"<div style='color:#00bfff'><b>{sender}:</b> {message}</div>")

    # ---------- input handlers ----------
    def handle_text_input(self):
        user_input = self.input_box.toPlainText().strip()
        if not user_input:
            return
        self.append_message("You", user_input)
        self.input_box.clear()
        if self.is_simple_command(user_input):
            resp = self.simple_command_response(user_input)
            self.append_message("Jarvis", resp)
            self.speak(resp)
        else:
            self.append_message("Jarvis", "Thinking...")
            self.start_ai_worker(user_input)

    def handle_text_ai(self):
        user_input = self.input_box.toPlainText().strip()
        if not user_input:
            return
        self.append_message("You", user_input)
        self.input_box.clear()
        self.append_message("Jarvis", "Thinking...")
        self.start_ai_worker(user_input)

    def handle_voice_input(self):
        # Start animations
        self.start_listen_animation()
        self.append_message("Jarvis", "🎙️ Listening...")
        self.speak("Listening.")
        try:
            with self.mic as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.listen(source, timeout=6, phrase_time_limit=8)
                query = self.recognizer.recognize_google(audio)
                self.append_message("You", query)
                if self.is_simple_command(query):
                    resp = self.simple_command_response(query)
                    self.append_message("Jarvis", resp)
                    self.speak(resp)
                else:
                    self.append_message("Jarvis", "Thinking...")
                    self.start_ai_worker(query)
        except sr.WaitTimeoutError:
            self.append_message("Jarvis", "I didn’t hear anything.")
            self.speak("I didn't hear anything, please try again.")
        except sr.UnknownValueError:
            self.append_message("Jarvis", "Sorry, I couldn’t understand that.")
            self.speak("Sorry, I couldn't understand that.")
        except Exception as e:
            self.append_message("Jarvis", f"Error: {str(e)}")
            self.speak("An error occurred while listening.")
        finally:
            # stop animations after handling
            self.stop_listen_animation()

    # ---------- animations ----------
    def start_listen_animation(self):
        # mic icon on
        mic_on = os.path.join(self.asset_path, "mic_on.png")
        if os.path.exists(mic_on):
            self.mic_button.setIcon(QIcon(mic_on))
            self.mic_button.setIconSize(QSize(48, 48))
        # show waveform
        if hasattr(self, "wave_movie"):
            self.wave_label.setVisible(True)
            self.wave_movie.start()
        # start glow pulse
        try:
            self._mic_anim.start()
        except Exception:
            pass

    def stop_listen_animation(self):
        # mic icon off
        mic_off = os.path.join(self.asset_path, "mic_off.png")
        if os.path.exists(mic_off):
            self.mic_button.setIcon(QIcon(mic_off))
            self.mic_button.setIconSize(QSize(48, 48))
        # hide waveform
        if hasattr(self, "wave_movie"):
            self.wave_movie.stop()
            self.wave_label.setVisible(False)
        # stop glow
        try:
            self._mic_anim.stop()
            self.mic_shadow.setBlurRadius(0)
        except Exception:
            pass

    # ---------- AI worker start ------------
    def start_ai_worker(self, text):
        if self.tokenizer is None or self.model is None:
            self.append_message("Jarvis", "AI model not available.")
            self.speak("AI model not loaded.")
            return
        self.ai_thread = AIWorker(text, self.tokenizer, self.model, self.device)
        self.ai_thread.finished.connect(self.on_ai_finished)
        self.ai_thread.start()

    def on_ai_finished(self, reply):
        reply = reply.strip()
        self.append_message("Jarvis", reply)
        self.speak(reply)

    # ---------- simple helpers ------------
    def is_simple_command(self, text):
        s = text.lower()
        keys = ["time", "date", "open", "wiki", "wikipedia", "joke", "who are you", "your name", "creator", "exit", "quit"]
        return any(k in s for k in keys)

    def simple_command_response(self, text):
        s = text.lower()
        if "time" in s:
            return "The time is " + datetime.now().strftime("%H:%M:%S")
        if "date" in s:
            return "Today's date is " + datetime.now().strftime("%d %B %Y")
        if "who are you" in s or "your name" in s:
            return "I am Jarvis, your personal AI assistant."
        if "creator" in s or "who created you" in s:
            return "I was created by Hasan Ikbal."
        if "joke" in s:
            return "Why did the developer quit? Because he couldn't find the bug."
        if "open" in s:
            site = s.split("open", 1)[1].strip()
            if site:
                if not site.startswith("http"):
                    site = "https://" + site
                webbrowser.open(site)
                return f"Opening {site}"
            return "Which site should I open?"
        if "wiki" in s or "wikipedia" in s:
            topic = s.replace("wikipedia", "").replace("wiki", "").strip()
            if topic:
                try:
                    import wikipedia
                    return wikipedia.summary(topic, sentences=2)
                except:
                    return "Sorry, I couldn't fetch that topic."
            return "What should I search on Wikipedia?"
        if "exit" in s or "quit" in s:
            self.close()
            return "Goodbye, Hasan."
        return "I didn't understand that."

# ---------- run ----------
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = JarvisWindow()
    window.show()
    sys.exit(app.exec_())





