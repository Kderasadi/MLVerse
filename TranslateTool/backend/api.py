from googletrans import Translator 
from flask import Flask, jsonify, request,send_file
import speech_recognition as sr
from gtts import gTTS
from flask_cors import CORS
from pydub import AudioSegment
import os
app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": "http://localhost:3000"}})
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
@app.route('/text-to-text', methods=['POST'])
def text_to_text():
    if request.method == 'POST':
        try:
            data = request.json  # Assuming the data is sent as JSON

            from_lang = data.get('from_lang')
            to_lang = data.get('to_lang')
            query = data.get('query')

            if not from_lang or not to_lang or not query:
                return jsonify({'error': 'Missing required data'}), 400

            translated = translator.translate(query, src=from_lang, dest=to_lang)
            translated_text = translated.text

            return jsonify({'translated_text': translated_text})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
       
        from_lang = request.form.get('from_lang', 'en')
        to_lang = request.form.get('to_lang', 'es')
           
        audio_file = request.files['file']

        # Check if the file is present and has an allowed extension
        if audio_file and allowed_file(audio_file.filename):
            # Convert the audio file to WAV format (if not already)
            audio = convert_to_wav(audio_file)

            # Perform speech recognition on the converted WAV file
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio) as source:
                audio_data = recognizer.record(source)

            # Recognize the speech
            text = recognizer.recognize_google(audio_data)

            translated_text = translator.translate(text, src=language_codes[from_lang.strip().lower()], dest=language_codes[to_lang.strip().lower()]).text

            # Clean up temporary files
        return jsonify({'text': text, 'translation': translated_text})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'wav', 'flac', 'aiff', 'aifc'}

def convert_to_wav(audio_file):
    # Convert audio to WAV format (assuming it's not already in WAV)
    audio = AudioSegment.from_file(audio_file)
    wav_file = os.path.splitext(audio_file.filename)[0] + '.wav'
    audio.export(wav_file, format='wav')
    return wav_file

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
   
        data = request.json  # Assuming the data is sent as JSON

        from_lang = data.get('from_lang')
        to_lang = data.get('to_lang')
        query = data.get('query')

        translated_text = translator.translate(query, src=from_lang, dest=to_lang).text

        tts = gTTS(translated_text, lang="es")
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

    text = recognizer.recognize_google(audio_data)
    translated_text = translator.translate(text, src=language_codes[from_lang.strip().lower()], dest=language_codes[to_lang.strip().lower()]).text
    
    tts = gTTS(translated_text, lang=to_lang.strip().lower())
    tts.save('translation.wav')

       
    os.remove('translation.mp3')


    return send_file('translation.wav', as_attachment=True)

        
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000, debug=True)