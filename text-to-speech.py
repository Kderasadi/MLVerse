from gtts import gTTS
from pydub import AudioSegment
from pydub.playback import play
import os
from googletrans import Translator
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
from_lang = str(input("What is the language you speak?   "))
to_lang = str(input("What do you want to translate it to?   "))

query = str(input("Your query:     "))
translator = Translator()
translated_text = translator.translate(query, src=from_lang, dest=to_lang).text

engine = gTTS(translated_text, lang=language_codes[to_lang.strip().lower()])
engine.save('hi.mp3')
audio = AudioSegment.from_mp3('hi.mp3')
audio.export('hi.wav', format='wav')

# Play the converted WAV audio
play(AudioSegment.from_wav('hi.wav'))

# Clean up temporary files
os.remove('hi.mp3')
os.remove('hi.wav')