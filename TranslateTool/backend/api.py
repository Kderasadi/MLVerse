from googletrans import Translator 
from flask import Flask, jsonify, request,send_file
import speech_recognition as sr
from gtts import gTTS
from flask_cors import CORS
import os
app = Flask(__name__)
CORS(app,resources={r"/text-to-text": {"origins": "http://localhost:3000"}})
translator = Translator()
recognizer = sr.Recognizer()
language_codes = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'japanese': 'ja',
    'russian': 'ru',
    'hindi': 'hi',
    'arabic': 'ar',
    'korean': 'ko',
    'portuguese': 'pt',
    "gujarati":	'gu-IN'
    # Add more languages as needed
}
@app.route('/text-to-text', methods = ['POST'])
def text_to_text():
    if request.method == 'POST':

        from_lang = str(request.form.get('from_lang'))

        to_lang = str(request.form.get('to_lang'))
        query = str(request.form.get('query'))
        translated_text = translator.translate(query.strip().lower(), src='en', dest='es').text
        return jsonify({'translated_text': str(translated_text)})

@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
        from_lang = request.form.get('from_lang', 'en')  # Default to English if not provided
        to_lang = request.form.get('to_lang', 'en')
        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No selected file'})

        if not file.filename.endswith('.wav'):
            return jsonify({'error': 'Invalid file format'})

        audio_file_path = 'temp.wav'
        file.save(audio_file_path)
        

        with sr.AudioFile(audio_file_path) as source:
            recognizer.adjust_for_ambient_noise(source)

        with sr.AudioFile(audio_file_path) as source:
            audio_data = recognizer.record(source)

        transcription = recognizer.recognize_google(audio_data)
        translated_text = translator.translate(transcription, src=language_codes[from_lang.strip().lower()], dest=language_codes[to_lang.strip().lower()]).text

        # Clean up temporary files
        os.remove(audio_file_path)

        return jsonify({'transcription': transcription, 'translation': translated_text})

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
   
        from_lang = str(request.form.get('from_lang'))  # Default to English if not provided
        to_lang = str(request.form.get('to_lang'))      # Default to English if not provided
        query = str(request.form.get('query'))

        translated_text = translator.translate(query, src='en', dest='es').text

        tts = gTTS(translated_text, lang=to_lang.strip().lower())
        tts.save('translation.wav')

       
        # os.remove('translation.mp3')


        return send_file('translation.wav', as_attachment=True)

@app.route('/speech-to-speech', methods=['POST'])
def speech_to_speech():
    from_lang = str(request.form.get('from_lang', 'en'))  # Default to English if not provided
    to_lang = str(request.form.get('to_lang', 'en'))
    file = request.files['file']

    if file.filename == '':
            return jsonify({'error': 'No selected file'})

    if not file.filename.endswith('.wav'):
            return jsonify({'error': 'Invalid file format'})

    audio_file_path = 'temp.wav'
    file.save(audio_file_path)
        

    with sr.AudioFile(audio_file_path) as source:
            recognizer.adjust_for_ambient_noise(source)

    with sr.AudioFile(audio_file_path) as source:
            audio_data = recognizer.record(source)

    transcription = recognizer.recognize_google(audio_data)
    translated_text = translator.translate(transcription, src=language_codes[from_lang.strip().lower()], dest=language_codes[to_lang.strip().lower()]).text
    
    tts = gTTS(translated_text, lang=to_lang.strip().lower())
    tts.save('translation.wav')

       
    os.remove('translation.mp3')


    return send_file('translation.wav', as_attachment=True)

        
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000, debug=True)