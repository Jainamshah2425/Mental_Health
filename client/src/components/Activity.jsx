"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Activity = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const activities = {
    breathing: {
      name: "Breathing Exercise",
      icon: "💨",
      description: "A simple exercise to calm your mind and reduce stress.",
      duration: "3 minutes",
      benefits: ["Reduces anxiety", "Lowers stress levels", "Improves focus"],
      instructions: [
        "Sit comfortably in a quiet place.",
        "Inhale deeply through your nose for 4 seconds.",
        "Hold your breath for 4 seconds.",
        "Exhale slowly through your mouth for 4 seconds.",
        "Repeat this cycle 5 times or until you feel relaxed.",
      ],
      timerSeconds: 180,
    },
    journal: {
      name: "Journal Prompt",
      icon: "✍️",
      description: "Reflect on your thoughts with a guided writing exercise.",
      duration: "10 minutes",
      benefits: ["Clarifies thoughts", "Reduces rumination", "Improves self-awareness"],
      instructions: [
        "Find a quiet spot and grab a pen and paper or a digital note.",
        "Today's prompt: 'What's one thing weighing on your mind right now, and how can you address it?'",
        "Write freely for 10 minutes without stopping.",
        "Afterward, read what you wrote and note any insights.",
      ],
      timerSeconds: 600,
    },
    mindfulness: {
      name: "Mindfulness Activity",
      icon: "🧘",
      description: "Stay present and grounded with this quick exercise.",
      duration: "5 minutes",
      benefits: ["Reduces anxiety", "Improves focus", "Increases self-awareness"],
      instructions: [
        "Sit or stand in a comfortable position.",
        "Take 5 deep breaths to center yourself.",
        "Notice 5 things you can see, 4 you can hear, 3 you can feel, 2 you can smell, and 1 you can taste.",
        "Spend a minute focusing on each sensation.",
      ],
      timerSeconds: 300,
    },
    stretch: {
      name: "Quick Stretch",
      icon: "🤸",
      description: "Relieve physical tension with simple stretches.",
      duration: "3 minutes",
      benefits: ["Reduces muscle tension", "Improves circulation", "Boosts energy"],
      instructions: [
        "Stand up and find a clear space.",
        "Raise your arms overhead and stretch upward for 10 seconds.",
        "Bend forward at the hips, reaching for your toes, and hold for 10 seconds.",
        "Stand back up and roll your shoulders backward 5 times.",
        "Repeat this sequence twice.",
      ],
      timerSeconds: 180,
    },
    gratitude: {
      name: "Gratitude Practice",
      icon: "🙏",
      description: "List three things you're grateful for today.",
      duration: "2 minutes",
      benefits: ["Improves mood", "Reduces stress", "Increases optimism"],
      instructions: [
        "Find a quiet moment to reflect.",
        "Think of three specific things you're grateful for today.",
        "For each item, consider why it makes you feel grateful.",
        "Take a moment to fully experience the positive feelings.",
      ],
      timerSeconds: 120,
    },
    sleep: {
      name: "Sleep Hygiene",
      icon: "😴",
      description: "Improve your sleep quality with these tips.",
      duration: "5 minutes",
      benefits: ["Better sleep quality", "Easier to fall asleep", "More restful nights"],
      instructions: [
        "Dim the lights in your environment 30 minutes before bed.",
        "Put away all electronic devices.",
        "Do a quick 5-minute relaxation exercise.",
        "Create a consistent bedtime routine to signal your body it's time to sleep.",
      ],
      timerSeconds: 300,
    },
  };

  const activity = activities[activityId] || {
    name: "Activity Not Found",
    description: "Please select a valid activity.",
    instructions: [],
    benefits: [],
    duration: "N/A",
    timerSeconds: 0,
  };

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
        setProgress(prev => prev + 100 / activity.timerSeconds);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setCompleted(true);
      alert("Activity Completed! Great job taking time for your mental wellness.");
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, activity.timerSeconds]);

  const startActivity = () => {
    setTimeLeft(activity.timerSeconds);
    setProgress(0);
    setIsActive(true);
    setCurrentStep(0);
    setCompleted(false);
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const nextStep = () => {
    if (currentStep < activity.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md border-none overflow-hidden">
        <div className="bg-blue-50 p-6 text-center">
          <div className="inline-block text-5xl mb-4">{activity.icon}</div>
          <h2 className="text-2xl font-semibold text-blue-600">{activity.name}</h2>
          <p className="text-gray-500 mt-2">{activity.description}</p>

          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-200 flex items-center gap-1">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {activity.duration}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-200 flex items-center gap-1">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
              Mental Wellness
            </span>
          </div>
        </div>

        <div className="p-4 border-b flex justify-between items-center">
          <button
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center"
            onClick={() => navigate("/daily-routine")}
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back
          </button>

          {isActive && (
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className="p-6">
          {isActive ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Step {currentStep + 1}</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p>{activity.instructions[currentStep]}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${
                    currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous Step
                </button>
                <button
                  className={`px-3 py-1 text-sm border border-gray-300 rounded-md ${
                    currentStep === activity.instructions.length - 1
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={nextStep}
                  disabled={currentStep === activity.instructions.length - 1}
                >
                  Next Step
                </button>
              </div>
            </div>
          ) : completed ? (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium">Activity Completed!</h3>
              <p className="text-gray-500">Great job taking time for your mental wellness.</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mt-4"
                onClick={startActivity}
              >
                Do It Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Benefits</h3>
                <ul className="space-y-2">
                  {activity.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                        <svg
                          className="h-3 w-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">How to Do It</h3>
                <ol className="space-y-3">
                  {activity.instructions.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center border-t p-6">
          {!isActive && !completed && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition w-full sm:w-auto"
              onClick={startActivity}
            >
              Start Activity
            </button>
          )}
          {isActive && (
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition w-full sm:w-auto"
              onClick={() => setIsActive(false)}
            >
              Pause Activity
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
