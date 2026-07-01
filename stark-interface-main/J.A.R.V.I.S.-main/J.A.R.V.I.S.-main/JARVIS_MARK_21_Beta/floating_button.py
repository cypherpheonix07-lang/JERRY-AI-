# floating_button.py
from PySide6.QtWidgets import QWidget, QPushButton
from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon

class FloatingMic(QWidget):
    def __init__(self, output_text):
        super().__init__()

        self.output_text = output_text

        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.Tool)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(80, 80)

        self.mic_button = QPushButton("", self)
        self.mic_button.setIcon(QIcon("assets/jarvis.ico"))  # your mic icon
        self.mic_button.setIconSize(self.size())
        self.mic_button.setStyleSheet("border: none; background-color: transparent;")
        self.mic_button.clicked.connect(self.trigger_voice_input)

        screen = self.screen().availableGeometry()
        self.move(screen.width() - 100, screen.height() - 100)

    def trigger_voice_input(self):
        from voice.stt import threaded_listen_and_respond
        threaded_listen_and_respond(self.output_text)





'''
from PySide6.QtWidgets import QApplication
import sys
if __name__ == "__main__":
    app = QApplication(sys.argv)
    mic_window = FloatingMic(output_text)
    mic_window.show()
    sys.exit(app.exec())'''