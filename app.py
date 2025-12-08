from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os
from groq import Groq
from dotenv import load_dotenv
import logging
import librosa
import numpy as np
from gtts import gTTS
import base64
import tempfile
import traceback
import json
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

model = None

def get_model():
    global model
    if model is None:
        model = whisper.load_model("base")
    return model


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load Whisper model
try:
    model = whisper.load_model("small")
    logger.info("Whisper model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {e}")
    model = None

# Load Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY not found in .env file")
    client = None
else:
    client = Groq(api_key=GROQ_API_KEY)
    logger.info("Groq client initialized")

# Audio file extension support
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'webm', 'm4a'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return jsonify({"status": "AI Therapist API is running"})

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "whisper_loaded": model is not None,
        "groq_available": client is not None
    })

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if model is None:
            return jsonify({'success': False, 'error': 'Whisper model not loaded'}), 500
        if client is None:
            return jsonify({'success': False, 'error': 'Groq API not available'}), 500

        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        if not allowed_file(audio_file.filename):
            return jsonify({'success': False, 'error': 'Invalid file type'}), 400

        language = request.form.get('language', 'english')
        report_type = request.form.get('report_type', 'concise')

        # Save incoming audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            audio_file.save(temp_audio.name)
            audio_path = temp_audio.name

        try:
            # Transcribe
            result = model.transcribe(audio_path)
            transcript = result['text'].strip()
            if not transcript:
                return jsonify({'success': False, 'error': 'No speech detected'}), 400

            # Analyze tone
            tone = analyze_tone(audio_path)

            # Generate therapist response
            response_text = get_therapist_response(transcript, tone, language, report_type)

            # Generate future steps
            future_steps = generate_future_steps(transcript, tone, language)

            # Generate TTS safely
            tts_language = {'english': 'en', 'hindi': 'hi', 'marathi': 'mr'}.get(language, 'en')
            tts_path = os.path.join(tempfile.gettempdir(), f"tts_output_{os.getpid()}.mp3")
            tts = gTTS(text=response_text, lang=tts_language, slow=False)
            tts.save(tts_path)

            with open(tts_path, "rb") as audio_file:
                audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')

            # Clean up TTS file
            try:
                os.remove(tts_path)
            except Exception as e:
                logger.warning(f"Could not delete TTS file: {tts_path} - {e}")

            return jsonify({
                'success': True,
                'transcript': transcript,
                'tone_analysis': tone,
                'therapist_response': response_text,
                'future_steps': future_steps,
                'report_audio': audio_base64,
                'language': language,
                'report_type': report_type
            })

        finally:
            if os.path.exists(audio_path):
                os.unlink(audio_path)

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

def analyze_tone(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=22050)
        rms = np.mean(librosa.feature.rms(y=y)[0])
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)[0])
        zcr = np.mean(librosa.feature.zero_crossing_rate(y)[0])
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)

        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_values = []
        for i in range(pitches.shape[1]):
            index = magnitudes[:, i].argmax()
            pitch = pitches[index, i]
            if pitch > 0:
                pitch_values.append(pitch)
        avg_pitch = np.mean(pitch_values) if pitch_values else 0

        pitch_level = 'high' if avg_pitch > 200 else 'medium' if avg_pitch > 100 else 'low'
        energy_level = 'high' if rms > 0.05 else 'medium' if rms > 0.02 else 'low'
        tempo_level = 'fast' if tempo > 120 else 'medium' if tempo > 80 else 'slow'

        emotion = 'neutral'
        if pitch_level == 'high' and energy_level == 'high':
            emotion = 'excited/stressed'
        elif pitch_level == 'low' and energy_level == 'low':
            emotion = 'calm/sad'
        elif energy_level == 'high':
            emotion = 'energetic'

        return {
            'pitch': pitch_level,
            'energy': energy_level,
            'tempo': tempo_level,
            'emotion': emotion,
            'avg_pitch_hz': float(avg_pitch),
            'rms_energy': float(rms),
            'spectral_centroid': float(spectral_centroid),
            'zero_crossing_rate': float(zcr),
            'tempo_bpm': float(tempo)
        }
    except Exception as e:
        logger.error(f"Tone analysis error: {e}")
        return {
            'pitch': 'unknown',
            'energy': 'unknown',
            'tempo': 'unknown',
            'emotion': 'neutral',
            'error': str(e)
        }

def get_therapist_response(transcript, tone, language, report_type):
    try:
        lang_instruction = {
            'english': "Respond in English.",
            'hindi': "Respond in Hindi using Devanagari script.",
            'marathi': "Respond in Marathi using Devanagari script."
        }.get(language, "Respond in English.")

        tone_summary = f"Voice analysis shows: pitch is {tone['pitch']}, energy is {tone['energy']}, tempo is {tone['tempo']}, emotion is {tone['emotion']}."

        if report_type == "concise":
            prompt = f"""
You are a compassionate therapist. A user said: "{transcript}".

{tone_summary}

Give a warm, concise paragraph:
- Acknowledge their emotion
- Name 1–2 emotional concerns
- Suggest possible cause(s)
- Offer 1–2 coping strategies

Be supportive and clear. {lang_instruction}
"""
            max_tokens = 250
        else:
            prompt = f"""
You are a compassionate therapist. A user said: "{transcript}".

{tone_summary}

Give a detailed therapy response:
1. Emotional Acknowledgment
2. Key Concerns
3. Causes
4. Coping Suggestions
5. Next Steps

Use clear, therapeutic tone. {lang_instruction}
"""
            max_tokens = 500

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are a professional therapist providing empathetic, actionable support."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return "I'm here to help, but I'm currently facing a technical issue. Please try again later."

def generate_future_steps(transcript, tone_analysis, language):
    """Generate future steps using Groq API instead of OpenAI"""
    try:
        lang_instruction = {
            'english': "Respond in English.",
            'hindi': "Respond in Hindi using Devanagari script.",
            'marathi': "Respond in Marathi using Devanagari script."
        }.get(language, "Respond in English.")

        emotion = tone_analysis.get('emotion', 'neutral')
        
        prompt = f"""Based on this user input: "{transcript}" and their emotional state: "{emotion}", generate 3-5 actionable future steps for mental health improvement.

Each step should be practical and achievable. Format your response as a JSON object with this exact structure:
{{
  "steps": [
    {{
      "title": "Clear, specific title",
      "description": "Brief, actionable description",
      "days_from_now": 1
    }}
  ]
}}

Focus on evidence-based mental health practices. {lang_instruction} Return only valid JSON."""

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are a mental health professional. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )

        response_text = response.choices[0].message.content.strip()
        
        # Clean up response text to extract JSON
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
        
        try:
            steps_data = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback: try to find JSON-like content
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end != 0:
                json_text = response_text[start:end]
                steps_data = json.loads(json_text)
            else:
                raise ValueError("No valid JSON found")

        # Process deadlines to actual dates
        current_date = datetime.now()
        processed_steps = []
        
        for step in steps_data.get('steps', []):
            days = int(step.get('days_from_now', 1))
            future_date = current_date + timedelta(days=days)
            
            processed_steps.append({
                'title': step.get('title', 'Untitled Step'),
                'description': step.get('description', 'No description'),
                'deadline': future_date.strftime('%Y-%m-%d'),
                'days_from_now': days
            })

        return processed_steps

    except Exception as e:
        logger.error(f"Error generating future steps: {str(e)}")
        # Fallback steps
        current_date = datetime.now()
        return [
            {
                "title": "Practice Daily Mindfulness",
                "description": "Start with 5 minutes of mindful breathing exercises each morning",
                "deadline": (current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                "days_from_now": 1
            },
            {
                "title": "Establish Sleep Routine", 
                "description": "Set consistent sleep and wake times, aiming for 7-8 hours",
                "deadline": (current_date + timedelta(days=3)).strftime('%Y-%m-%d'),
                "days_from_now": 3
            },
            {
                "title": "Connect with Support",
                "description": "Reach out to a trusted friend or family member for a meaningful conversation",
                "deadline": (current_date + timedelta(days=2)).strftime('%Y-%m-%d'),
                "days_from_now": 2
            },
            {
                "title": "Physical Activity",
                "description": "Take a 15-minute walk outside or do light stretching",
                "deadline": (current_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                "days_from_now": 1
            }
        ]

@app.route('/future_steps', methods=['POST'])
def future_steps_endpoint():
    """Standalone endpoint for generating future steps"""
    try:
        data = request.json
        if not data or 'transcript' not in data:
            return jsonify({'success': False, 'error': 'Transcript required'}), 400
        
        transcript = data['transcript']
        tone_analysis = data.get('tone_analysis', {'emotion': 'neutral'})
        language = data.get('language', 'english')
        
        steps = generate_future_steps(transcript, tone_analysis, language)
        return jsonify({'success': True, 'steps': steps})

    except Exception as e:
        logger.error(f"Error in future_steps endpoint: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)