from googletrans import Translator 
print("Enter your current language: e.g., English, Hindi, etc.")
from_lang = input().strip().lower()
print("Enter the language you want to translate to: e.g., Hindi, English, etc.")
to_lang = input().strip().lower()
query = str(input("Enter your text!:  "))
translator = Translator()
translated_text = translator.translate(query.strip().lower(), src=from_lang.strip().lower(), dest=to_lang.strip().lower()).text
print(translated_text)