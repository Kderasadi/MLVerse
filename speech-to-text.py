import speech_recognition as sr
from googletrans import Translator
import pyttsx3 

from_lang = str(input("Enter your native language:   "))
to_lang = str(input("And you want to translate it to...:      "))
translator = Translator()

language_codes = {
    'english': 'en',
    'american English': 'en-US',
    'british English': 'en-GB',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'japanese': 'ja',
    'simplified Chinese': 'zh-CN',
    'russian': 'ru',
    'hindi': 'hi',
    'arabic': 'ar',
    'korean': 'ko',
    'portuguese': 'pt',
    "gujarati":	'gu-IN'
    # Add more languages as needed
}
r = sr.Recognizer()
with sr.Microphone() as source:
        print("Listening...")
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)
        print("Recognizing...")
        query = r.recognize_google(audio, language=language_codes[from_lang.strip().lower()])
    

translated_text = translator.translate(query, src=from_lang, dest=to_lang).text

print(translated_text)
