import React from "react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const Therapist = () => {
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [tone, setTone] = useState("");
  const [response, setResponse] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [language, setLanguage] = useState("english");
  const [reportType, setReportType] = useState("concise");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [futureSteps, setFutureSteps] = useState([]);
  const [showFutureSteps, setShowFutureSteps] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  const API_BASE_URL = "https://jainamshah2425-mh.hf.space/";

  // Initialize component
  useEffect(() => {
    testServerConnection();
    initializeMicrophone();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Test server connection
  const testServerConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log("Server health check:", response.data);
      if (!response.data.whisper_loaded || !response.data.groq_available) {
        setError("Server services not fully available. Please check server logs.");
      }
    } catch (error) {
      console.error("Server connection test failed:", error);
      setError("Cannot connect to server. Please ensure the Flask server is running on port 5001.");
    }
  };

  // Initialize microphone
  const initializeMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      streamRef.current = stream;
      console.log("Microphone access granted");

      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4';
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Audio chunk recorded, size:", event.data.size);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("Recording stopped");
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current.mimeType
        });
        console.log("Audio blob created, size:", audioBlob.size);
        audioChunksRef.current = [];
        await sendAudio(audioBlob);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        setError("Recording error: " + event.error.message);
        setIsRecording(false);
        setIsProcessing(false);
      };
    } catch (err) {
      console.error("Microphone access denied:", err);
      setError("Microphone access denied. Please allow microphone access and refresh the page.");
    }
  };

  // Start recording
  const startRecording = () => {
    if (!mediaRecorderRef.current) {
      setError("Recording device not initialized. Please refresh the page.");
      return;
    }

    if (mediaRecorderRef.current.state !== "recording") {
      console.log("Starting recording...");
      setTranscript("");
      setTone("");
      setResponse("");
      setAudioSrc("");
      setError("");
      setIsProcessing(false);
      setShowFutureSteps(false);
      setFutureSteps([]);

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setResponse("Recording...");
    } else {
      console.error("MediaRecorder already recording");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setResponse("Processing your audio...");
    }
  };

  // Send audio to backend
  const sendAudio = async (audioBlob) => {
    try {
      setIsProcessing(true);
      setError("");

      if (audioBlob.size === 0) {
        throw new Error("Empty audio recording. Please try again.");
      }

      console.log("Preparing to send audio:", {
        size: audioBlob.size,
        type: audioBlob.type,
        language: language,
        reportType: reportType
      });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("language", language);
      formData.append("report_type", reportType);

      console.log("Sending audio to server...");
      setResponse("Analyzing your speech...");

      const response = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      console.log("Received response:", response.data);

      if (response.data.success) {
        // Update transcript
        setTranscript(response.data.transcript ? 
          `You said: "${response.data.transcript}"` : 
          "Transcription not available"
        );

        // Format tone analysis
        const toneData = response.data.tone_analysis;
        if (toneData && !toneData.error) {
          setTone(
            `Tone Analysis: Pitch: ${toneData.pitch}, Energy: ${toneData.energy}, ` +
            `Tempo: ${toneData.tempo}, Overall emotion: ${toneData.emotion}`
          );
        } else {
          setTone("Tone Analysis: " + (toneData?.error || "Not available"));
        }

        // Set therapist response
        setResponse(response.data.therapist_response || "No response generated");

        // Set audio if available
        if (response.data.report_audio) {
          const audioUrl = `data:audio/mp3;base64,${response.data.report_audio}`;
          setAudioSrc(audioUrl);
        }

        // Call the /future_steps endpoint
        await fetchFutureSteps(response.data.transcript, response.data.therapist_response);
      } else {
        throw new Error(response.data.error || "Unknown server error");
      }
    } catch (error) {
      console.error("Send audio error:", error);
      let errorMessage = "Connection error: ";
      
      if (error.response) {
        console.error("Error response:", error.response.status, error.response.data);
        errorMessage += `Server returned ${error.response.status}`;
        if (error.response.data?.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      } else if (error.request) {
        errorMessage += "No response from server. Please check if the server is running.";
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
      setResponse("");
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchFutureSteps = async (transcript, therapistResponse) => {
    try {
      console.log("Fetching future steps...");
      setLoading(true);

      const futureStepsResponse = await axios.post(`${API_BASE_URL}/future_steps`, {
        transcript: transcript,
        tone_analysis: tone,
        language: language
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      console.log("Future steps response:", futureStepsResponse.data);

      if (futureStepsResponse.data.success && futureStepsResponse.data.steps) {
        setFutureSteps(futureStepsResponse.data.steps);
        setShowFutureSteps(true);
        console.log("Future steps loaded successfully");
      } else {
        console.warn("No future steps received:", futureStepsResponse.data);
        setFutureSteps([]);
        setShowFutureSteps(false);
      }
    } catch (error) {
      console.error("Future steps fetch error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      setFutureSteps([]);
      setShowFutureSteps(false);
    } finally {
      setLoading(false);
    }
  };

  // Audio event handlers
  const handleAudioPlay = () => {
    setIsPlaying(true);
    console.log("Audio playing");
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
    console.log("Audio paused");
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    console.log("Audio ended");
  };

  // Clear results
  const clearResults = () => {
    setTranscript("");
    setTone("");
    setResponse("");
    setAudioSrc("");
    setError("");
    setFutureSteps([]);
    setShowFutureSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Therapist</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personal mental health companion powered by advanced AI technology
          </p>
        </div>
        
        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">⚙️</span>
            Settings
          </h2>
          
          {/* Language and Report Type Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select 
                id="language-select"
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isRecording || isProcessing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="marathi">Marathi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="report-select" className="block text-sm font-medium text-gray-700">
                Report Type
              </label>
              <select 
                id="report-select"
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                disabled={isRecording || isProcessing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startRecording}
              disabled={isRecording || isProcessing}
              className={`flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              <span className="mr-3 text-2xl">
                {isRecording ? '🔴' : '🎤'}
              </span>
              {isRecording ? 'Recording...' : 'Start Recording'}
            </button>
            
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="mr-3 text-2xl">⏹️</span>
              Stop Recording
            </button>

            <button
              onClick={clearResults}
              disabled={isRecording || isProcessing}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="mr-3 text-2xl">🗑️</span>
              Clear Results
            </button>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <p className="text-lg font-medium text-blue-800">Processing your request...</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="space-y-8">
          {/* Transcript */}
          {transcript && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-3xl">📝</span>
                Transcript
              </h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">{transcript}</p>
              </div>
            </div>
          )}

          {/* Voice Analysis */}
          {tone && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-purple-500">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-3xl">🎵</span>
                Voice Analysis
              </h3>
              <div className="bg-purple-50 rounded-xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed">{tone}</p>
              </div>
            </div>
          )}

          {/* Therapist Response */}
          {response && !isProcessing && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-green-500">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-3xl">🧠</span>
                Therapist Response
              </h3>
              <div className="bg-green-50 rounded-xl p-6">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          )}

          {/* Audio Response */}
          {audioSrc && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-indigo-500">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-3xl">🔊</span>
                Audio Response
              </h3>
              <div className="bg-indigo-50 rounded-xl p-6">
                <audio
                  ref={audioRef}
                  controls
                  src={audioSrc}
                  onPlay={handleAudioPlay}
                  onPause={handleAudioPause}
                  onEnded={handleAudioEnd}
                  className="w-full mb-4"
                >
                  Your browser does not support the audio element.
                </audio>
                {isPlaying && (
                  <div className="flex items-center text-indigo-700">
                    <span className="mr-2 text-xl animate-pulse">🎵</span>
                    <span className="font-medium">Playing audio response...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Future Steps */}
          {futureSteps.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-3 text-3xl">🎯</span>
                  Your Future Steps
                </h2>
                <button
                  onClick={() => setShowFutureSteps(!showFutureSteps)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {showFutureSteps ? 'Hide' : 'Show'} Steps
                </button>
              </div>

              {showFutureSteps && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                      <span className="text-lg font-medium text-gray-600">Loading future steps...</span>
                    </div>
                  ) : (
                    futureSteps.map((step, index) => (
                      <div key={index} className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mr-4">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {step.title || `Step ${index + 1}`}
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-3">
                              {step.description || step}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {step.deadline && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                  <span className="mr-1">📅</span>
                                  Due: {new Date(step.deadline).toLocaleDateString()}
                                </span>
                              )}
                              {step.priority && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  step.priority.toLowerCase() === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : step.priority.toLowerCase() === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  <span className="mr-1">⚡</span>
                                  {step.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Therapist;