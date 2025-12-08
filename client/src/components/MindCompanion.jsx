<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const MindCompanion = () => {
  const [activeSection, setActiveSection] = useState("postsSection");
  const [posts, setPosts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [postInput, setPostInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [gameState, setGameState] = useState({
    happyFace: { score: 0, timer: 30, active: false, started: false },
    snake: {
      score: 0,
      active: false,
      snake: [],
      food: { x: 0, y: 0 },
      direction: "right",
      started: false,
    },
    doodle: { drawing: false, started: false },
    breathing: { active: false, started: false },
  });
  const chatListRef = useRef(null);
  const happyFaceRef = useRef(null);
  const doodleCanvasRef = useRef(null);
  const snakeCanvasRef = useRef(null);
  const breathingCircleRef = useRef(null);
  const gameIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const snakeGameIntervalRef = useRef(null);
  const breathingIntervalRef = useRef(null);

  useEffect(() => {
    fetchPosts();
    fetchChatMessages();
    return () => {
      stopHappyFaceGame();
      stopSnakeGame();
      stopBreathingExercise();
    };
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("https://mental-health-r9h9.onrender.com/api/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data);
  };

  const fetchChatMessages = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("https://mental-health-r9h9.onrender.com/api/chat", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setChatMessages(res.data);
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  };

  const addPost = async () => {
    if (!postInput.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://mental-health-r9h9.onrender.com/api/posts",
      { text: postInput },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts([...posts, res.data]);
    setPostInput("");
  };

  const upvotePost = async id => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `https://mental-health-r9h9.onrender.com/api/posts/${id}/upvote`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts(posts.map(p => (p.id === id ? res.data : p)));
  };

  const downvotePost = async id => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `https://mental-health-r9h9.onrender.com/api/posts/${id}/downvote`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts(posts.map(p => (p.id === id ? res.data : p)));
  };

  const addComment = async (postId, comment) => {
    if (!comment.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `https://mental-health-r9h9.onrender.com/api/posts/${postId}/comments`,
      { text: comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts(posts.map(p => (p.id === postId ? res.data : p)));
  };

  const addChatMessage = async () => {
    if (!chatInput.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://mental-health-r9h9.onrender.com/api/chat",
      { text: chatInput },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setChatMessages([...chatMessages, res.data]);
    setChatInput("");
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const runWhatsApp = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "https://mental-health-r9h9.onrender.com/api/run-whatsapp",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWhatsappMessage(
        "WhatsApp script is running in a new browser window! Please scan the QR code."
      );
    } catch (error) {
      setWhatsappMessage("Failed to start WhatsApp script. Please try again.");
    }
  };

  // Game Pop-up Logic
  const openGamePopup = gameType => {
    const popup = window.open("", `${gameType}Game`, "width=600,height=400");
    popup.document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: ${
        isDarkTheme ? "#1F2937" : "#F3F4F6"
      }; color: ${isDarkTheme ? "#FFFFFF" : "#111827"};">
        <div id="gameArea" style="width: 100%; height: 70%; display: flex; justify-content: center; align-items: center;"></div>
        <button id="startGame" style="padding: 10px 20px; background: #2563EB; color: white; border: none; border-radius: 5px; cursor: pointer;">Start the Game</button>
      </div>
    `;
    const gameArea = popup.document.getElementById("gameArea");
    const startButton = popup.document.getElementById("startGame");

    if (gameType === "happyFace") {
      gameArea.innerHTML = `<div id="happyFace" style="position: absolute; width: 64px; height: 64px; background: #FBBF24; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <div style="display: flex; gap: 8px;">
          <div style="width: 8px; height: 8px; background: black; border-radius: 50%;"></div>
          <div style="width: 8px; height: 8px; background: black; border-radius: 50%;"></div>
        </div>
        <div style="position: absolute; margin-top: 32px; width: 32px; height: 16px; background: black; border-radius: 0 0 16px 16px;"></div>
      </div>`;
      startButton.onclick = () => startHappyFaceGame(popup);
    } else if (gameType === "doodle") {
      gameArea.innerHTML = `<canvas id="doodleCanvas" style="width: 100%; height: 100%; background: white;"></canvas>`;
      startButton.onclick = () => initDoodleGame(popup);
    } else if (gameType === "snake") {
      gameArea.innerHTML = `<canvas id="snakeCanvas" style="width: 400px; height: 300px; background: white;"></canvas>`;
      startButton.onclick = () => initSnakeGame(popup);
    } else if (gameType === "breathing") {
      gameArea.innerHTML = `<div id="breathingCircle" style="width: 100px; height: 100px; background: #60A5FA; border-radius: 50%; transition: all 6s ease;"></div>`;
      startButton.onclick = () => startBreathingExercise(popup);
    }

    popup.onunload = () => {
      if (gameType === "happyFace") stopHappyFaceGame();
      else if (gameType === "snake") stopSnakeGame();
      else if (gameType === "breathing") stopBreathingExercise();
    };
  };

  // Happy Face Game Logic
  const startHappyFaceGame = popup => {
    setGameState(prev => ({
      ...prev,
      happyFace: { score: 0, timer: 30, active: true, started: true },
    }));
    const happyFace = popup.document.getElementById("happyFace");
    happyFaceRef.current = happyFace;
    moveHappyFace();
    gameIntervalRef.current = setInterval(moveHappyFace, 2000);
    timerIntervalRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimer = prev.happyFace.timer - 1;
        if (newTimer <= 0) {
          stopHappyFaceGame();
          popup.alert(`Game Over! Your score: ${prev.happyFace.score}`);
          return {
            ...prev,
            happyFace: { ...prev.happyFace, timer: 0, active: false, started: false },
          };
        }
        return { ...prev, happyFace: { ...prev.happyFace, timer: newTimer } };
      });
      popup.document.getElementById(
        "gameArea"
      ).innerHTML += `<p>Score: ${gameState.happyFace.score} | Timer: ${gameState.happyFace.timer}</p>`;
    }, 1000);
    happyFace.onclick = clickHappyFace;
  };

  const stopHappyFaceGame = () => {
    clearInterval(gameIntervalRef.current);
    clearInterval(timerIntervalRef.current);
    setGameState(prev => ({
      ...prev,
      happyFace: { ...prev.happyFace, active: false, started: false },
    }));
  };

  const moveHappyFace = () => {
    if (happyFaceRef.current) {
      const gameArea = happyFaceRef.current.parentElement;
      const maxX = gameArea.clientWidth - happyFaceRef.current.clientWidth;
      const maxY = gameArea.clientHeight - happyFaceRef.current.clientHeight;
      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;
      happyFaceRef.current.style.left = `${newX}px`;
      happyFaceRef.current.style.top = `${newY}px`;
    }
  };

  const clickHappyFace = () => {
    setGameState(prev => ({
      ...prev,
      happyFace: { ...prev.happyFace, score: prev.happyFace.score + 1 },
    }));
    moveHappyFace();
    playClickSound();
  };

  const playClickSound = () => {
    const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
    audio.play().catch(err => console.log("Audio playback failed:", err));
  };

  // Doodle Game Logic
  const initDoodleGame = popup => {
    const canvas = popup.document.getElementById("doodleCanvas");
    doodleCanvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    setGameState(prev => ({ ...prev, doodle: { drawing: false, started: true } }));

    canvas.onmousedown = startDrawing;
    canvas.onmousemove = draw;
    canvas.onmouseup = stopDrawing;
    canvas.onmouseout = stopDrawing;
  };

  const startDrawing = e => {
    const canvas = doodleCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setGameState(prev => ({ ...prev, doodle: { drawing: true, started: true } }));
  };

  const draw = e => {
    if (!gameState.doodle.drawing) return;
    const canvas = doodleCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setGameState(prev => ({ ...prev, doodle: { drawing: false, started: true } }));
  };

  // Snake Game Logic
  const gridSize = 20;

  const initSnakeGame = popup => {
    const canvas = popup.document.getElementById("snakeCanvas");
    snakeCanvasRef.current = canvas;
    canvas.width = 400;
    canvas.height = 300;
    setGameState(prev => ({
      ...prev,
      snake: {
        score: 0,
        active: true,
        snake: [{ x: 5, y: 5 }],
        food: {
          x: Math.floor(Math.random() * (canvas.width / gridSize)),
          y: Math.floor(Math.random() * (canvas.height / gridSize)),
        },
        direction: "right",
        started: true,
      },
    }));
    popup.document.addEventListener("keydown", changeSnakeDirection);
    startSnakeGame(popup);
  };

  const startSnakeGame = popup => {
    if (snakeGameIntervalRef.current) clearInterval(snakeGameIntervalRef.current);
    snakeGameIntervalRef.current = setInterval(() => updateSnakeGame(popup), 200); // Slower speed (200ms)
  };

  const stopSnakeGame = () => {
    clearInterval(snakeGameIntervalRef.current);
    setGameState(prev => ({
      ...prev,
      snake: { ...prev.snake, active: false, started: false },
    }));
  };

  const changeSnakeDirection = e => {
    setGameState(prev => {
      const { direction } = prev.snake;
      if (e.key === "ArrowUp" && direction !== "down")
        return { ...prev, snake: { ...prev.snake, direction: "up" } };
      if (e.key === "ArrowDown" && direction !== "up")
        return { ...prev, snake: { ...prev.snake, direction: "down" } };
      if (e.key === "ArrowLeft" && direction !== "right")
        return { ...prev, snake: { ...prev.snake, direction: "left" } };
      if (e.key === "ArrowRight" && direction !== "left")
        return { ...prev, snake: { ...prev.snake, direction: "right" } };
      return prev;
    });
  };

  const updateSnakeGame = popup => {
    const canvas = snakeCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setGameState(prev => {
      const { snake, food, direction } = prev.snake;
      let head = { x: snake[0].x, y: snake[0].y };
      if (direction === "up") head.y--;
      if (direction === "down") head.y++;
      if (direction === "left") head.x--;
      if (direction === "right") head.x++;

      if (
        head.x < 0 ||
        head.x >= canvas.width / gridSize ||
        head.y < 0 ||
        head.y >= canvas.height / gridSize
      ) {
        stopSnakeGame();
        popup.alert(`Game Over! Your score: ${prev.snake.score}`);
        return prev;
      }

      for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          stopSnakeGame();
          popup.alert(`Game Over! Your score: ${prev.snake.score}`);
          return prev;
        }
      }

      const newSnake = [head, ...snake];
      let newScore = prev.snake.score;
      if (head.x === food.x && head.y === food.y) {
        newScore++;
        food.x = Math.floor(Math.random() * (canvas.width / gridSize));
        food.y = Math.floor(Math.random() * (canvas.height / gridSize));
      } else {
        newSnake.pop();
      }

      ctx.fillStyle = "#2ecc71";
      newSnake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
      });
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

      popup.document.getElementById("gameArea").innerHTML += `<p>Score: ${newScore}</p>`;
      return {
        ...prev,
        snake: { ...prev.snake, snake: newSnake, score: newScore, food },
      };
    });
  };

  // Breathing Exercise Logic
  const startBreathingExercise = popup => {
    setGameState(prev => ({ ...prev, breathing: { active: true, started: true } }));
    const circle = popup.document.getElementById("breathingCircle");
    breathingCircleRef.current = circle;
    let growing = true;
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    breathingIntervalRef.current = setInterval(() => {
      if (growing) {
        circle.style.width = "150px";
        circle.style.height = "150px";
      } else {
        circle.style.width = "100px";
        circle.style.height = "100px";
      }
      growing = !growing;
    }, 6000); // Slower cycle (6s)
  };

  const stopBreathingExercise = () => {
    clearInterval(breathingIntervalRef.current);
    setGameState(prev => ({ ...prev, breathing: { active: false, started: false } }));
    if (breathingCircleRef.current) {
      breathingCircleRef.current.style.width = "100px";
      breathingCircleRef.current.style.height = "100px";
    }
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col fixed h-full">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">MindCompanion</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Anonymous Community</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "postsSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("postsSection")}
          >
            Posts
          </button>
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "chatSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("chatSection")}
          >
            Chat
          </button>
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "gamesSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("gamesSection")}
          >
            Games
          </button>
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "whatsappSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("whatsappSection")}
          >
            WhatsApp
          </button>
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={toggleTheme}
          >
            Toggle Theme
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {/* Posts Section */}
        <section className={`${activeSection === "postsSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Community Posts</h2>
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={postInput}
                onChange={e => setPostInput(e.target.value)}
                placeholder="Share a joke or thought..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <button
                onClick={addPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Post
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Anonymous User • {new Date(post.id).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => upvotePost(post.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      ⬆
                    </button>
                    <span className="text-sm">{post.upvotes - post.downvotes}</span>
                    <button
                      onClick={() => downvotePost(post.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      ⬇
                    </button>
                  </div>
                </div>
                <p className="mb-2">{post.text}</p>
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Comments:</h4>
                  {post.comments.map((comment, idx) => (
                    <p key={idx} className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {comment}
                    </p>
                  ))}
                </div>
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    onKeyPress={e =>
                      e.key === "Enter" &&
                      addComment(post.id, e.target.value) &&
                      (e.target.value = "")
                    }
                  />
                  <button
                    onClick={e =>
                      addComment(post.id, e.target.previousSibling.value) &&
                      (e.target.previousSibling.value = "")
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chat Section */}
        <section className={`${activeSection === "chatSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Anonymous Chat</h2>
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setPostInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <button
                onClick={addChatMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
          <div
            ref={chatListRef}
            className="max-h-[70vh] overflow-y-auto space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            {chatMessages.map(msg => (
              <div key={msg.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Anonymous User • {new Date(msg.id).toLocaleTimeString()}
                </span>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Games Section */}
        <section className={`${activeSection === "gamesSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Stress-Relief Games</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Happy Face Game */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                  <div className="absolute mt-8 w-8 h-4 bg-black rounded-b-full"></div>
                </div>
              </div>
              <h3 className="text-lg font-medium">Happy Face Game</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the happy face to reduce stress!
              </p>
              <button
                onClick={() => openGamePopup("happyFace")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>

            {/* Doodle Game */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
              <h3 className="text-lg font-medium">Doodle Game</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Draw to relax!</p>
              <button
                onClick={() => openGamePopup("doodle")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>

            {/* Snake Game */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
              <h3 className="text-lg font-medium">Snake Game</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Classic snake fun!</p>
              <button
                onClick={() => openGamePopup("snake")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>

            {/* Breathing Exercise */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-blue-300 rounded-full" />
              </div>
              <h3 className="text-lg font-medium">Breathing Exercise</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Breathe to calm down!</p>
              <button
                onClick={() => openGamePopup("breathing")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>
          </div>
        </section>

        {/* WhatsApp Section */}
        <section className={`${activeSection === "whatsappSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">WhatsApp Chat</h2>
            <div className="mt-4">
              <button
                onClick={runWhatsApp}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Talk on WhatsApp
              </button>
            </div>
          </div>
          {whatsappMessage && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p>{whatsappMessage}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MindCompanion;
=======
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const MindCompanion = () => {
  const [activeSection, setActiveSection] = useState("postsSection");
  const [posts, setPosts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [postInput, setPostInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [gameState, setGameState] = useState({
    happyFace: { score: 0, timer: 30, active: false, started: false },
    snake: {
      score: 0,
      active: false,
      snake: [],
      food: { x: 0, y: 0 },
      direction: "right",
      started: false,
    },
    doodle: { drawing: false, started: false },
    breathing: { active: false, started: false },
  });
  const chatListRef = useRef(null);
  const happyFaceRef = useRef(null);
  const doodleCanvasRef = useRef(null);
  const snakeCanvasRef = useRef(null);
  const breathingCircleRef = useRef(null);
  const gameIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const snakeGameIntervalRef = useRef(null);
  const breathingIntervalRef = useRef(null);

  useEffect(() => {
    fetchPosts();
    fetchChatMessages();
    return () => {
      stopHappyFaceGame();
      stopSnakeGame();
      stopBreathingExercise();
    };
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("https://mental-health-r9h9.onrender.com/api/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data);
  };

  const fetchChatMessages = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("https://mental-health-r9h9.onrender.com/api/chat", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setChatMessages(res.data);
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  };

  const addPost = async () => {
    if (!postInput.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://mental-health-r9h9.onrender.com/api/posts",
      { text: postInput },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts([...posts, res.data]);
    setPostInput("");
  };

  const upvotePost = async id => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `https://mental-health-r9h9.onrender.com/api/posts/${id}/upvote`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts(posts.map(p => (p.id === id ? res.data : p)));
  };

  const downvotePost = async id => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `https://mental-health-r9h9.onrender.com/api/posts/${id}/downvote`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts(posts.map(p => (p.id === id ? res.data : p)));
  };

  const addComment = async (postId, comment) => {
    if (!comment.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `https://mental-health-r9h9.onrender.com/api/posts/${postId}/comments`,
      { text: comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPosts(posts.map(p => (p.id === postId ? res.data : p)));
  };

  const addChatMessage = async () => {
    if (!chatInput.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://mental-health-r9h9.onrender.com/api/chat",
      { text: chatInput },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setChatMessages([...chatMessages, res.data]);
    setChatInput("");
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const runWhatsApp = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "https://mental-health-r9h9.onrender.com/api/run-whatsapp",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWhatsappMessage(
        "WhatsApp script is running in a new browser window! Please scan the QR code."
      );
    } catch (error) {
      setWhatsappMessage("Failed to start WhatsApp script. Please try again.");
    }
  };

  // Game Pop-up Logic
  const openGamePopup = gameType => {
    const popup = window.open("", `${gameType}Game`, "width=600,height=400");
    popup.document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: ${
        isDarkTheme ? "#1F2937" : "#F3F4F6"
      }; color: ${isDarkTheme ? "#FFFFFF" : "#111827"};">
        <div id="gameArea" style="width: 100%; height: 70%; display: flex; justify-content: center; align-items: center;"></div>
        <button id="startGame" style="padding: 10px 20px; background: #2563EB; color: white; border: none; border-radius: 5px; cursor: pointer;">Start the Game</button>
      </div>
    `;
    const gameArea = popup.document.getElementById("gameArea");
    const startButton = popup.document.getElementById("startGame");

    if (gameType === "happyFace") {
      gameArea.innerHTML = `<div id="happyFace" style="position: absolute; width: 64px; height: 64px; background: #FBBF24; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <div style="display: flex; gap: 8px;">
          <div style="width: 8px; height: 8px; background: black; border-radius: 50%;"></div>
          <div style="width: 8px; height: 8px; background: black; border-radius: 50%;"></div>
        </div>
        <div style="position: absolute; margin-top: 32px; width: 32px; height: 16px; background: black; border-radius: 0 0 16px 16px;"></div>
      </div>`;
      startButton.onclick = () => startHappyFaceGame(popup);
    } else if (gameType === "doodle") {
      gameArea.innerHTML = `<canvas id="doodleCanvas" style="width: 100%; height: 100%; background: white;"></canvas>`;
      startButton.onclick = () => initDoodleGame(popup);
    } else if (gameType === "snake") {
      gameArea.innerHTML = `<canvas id="snakeCanvas" style="width: 400px; height: 300px; background: white;"></canvas>`;
      startButton.onclick = () => initSnakeGame(popup);
    } else if (gameType === "breathing") {
      gameArea.innerHTML = `<div id="breathingCircle" style="width: 100px; height: 100px; background: #60A5FA; border-radius: 50%; transition: all 6s ease;"></div>`;
      startButton.onclick = () => startBreathingExercise(popup);
    }

    popup.onunload = () => {
      if (gameType === "happyFace") stopHappyFaceGame();
      else if (gameType === "snake") stopSnakeGame();
      else if (gameType === "breathing") stopBreathingExercise();
    };
  };

  // Happy Face Game Logic
  const startHappyFaceGame = popup => {
    setGameState(prev => ({
      ...prev,
      happyFace: { score: 0, timer: 30, active: true, started: true },
    }));
    const happyFace = popup.document.getElementById("happyFace");
    happyFaceRef.current = happyFace;
    moveHappyFace();
    gameIntervalRef.current = setInterval(moveHappyFace, 2000);
    timerIntervalRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimer = prev.happyFace.timer - 1;
        if (newTimer <= 0) {
          stopHappyFaceGame();
          popup.alert(`Game Over! Your score: ${prev.happyFace.score}`);
          return {
            ...prev,
            happyFace: { ...prev.happyFace, timer: 0, active: false, started: false },
          };
        }
        return { ...prev, happyFace: { ...prev.happyFace, timer: newTimer } };
      });
      popup.document.getElementById(
        "gameArea"
      ).innerHTML += `<p>Score: ${gameState.happyFace.score} | Timer: ${gameState.happyFace.timer}</p>`;
    }, 1000);
    happyFace.onclick = clickHappyFace;
  };

  const stopHappyFaceGame = () => {
    clearInterval(gameIntervalRef.current);
    clearInterval(timerIntervalRef.current);
    setGameState(prev => ({
      ...prev,
      happyFace: { ...prev.happyFace, active: false, started: false },
    }));
  };

  const moveHappyFace = () => {
    if (happyFaceRef.current) {
      const gameArea = happyFaceRef.current.parentElement;
      const maxX = gameArea.clientWidth - happyFaceRef.current.clientWidth;
      const maxY = gameArea.clientHeight - happyFaceRef.current.clientHeight;
      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;
      happyFaceRef.current.style.left = `${newX}px`;
      happyFaceRef.current.style.top = `${newY}px`;
    }
  };

  const clickHappyFace = () => {
    setGameState(prev => ({
      ...prev,
      happyFace: { ...prev.happyFace, score: prev.happyFace.score + 1 },
    }));
    moveHappyFace();
    playClickSound();
  };

  const playClickSound = () => {
    const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
    audio.play().catch(err => console.log("Audio playback failed:", err));
  };

  // Doodle Game Logic
  const initDoodleGame = popup => {
    const canvas = popup.document.getElementById("doodleCanvas");
    doodleCanvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    setGameState(prev => ({ ...prev, doodle: { drawing: false, started: true } }));

    canvas.onmousedown = startDrawing;
    canvas.onmousemove = draw;
    canvas.onmouseup = stopDrawing;
    canvas.onmouseout = stopDrawing;
  };

  const startDrawing = e => {
    const canvas = doodleCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setGameState(prev => ({ ...prev, doodle: { drawing: true, started: true } }));
  };

  const draw = e => {
    if (!gameState.doodle.drawing) return;
    const canvas = doodleCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setGameState(prev => ({ ...prev, doodle: { drawing: false, started: true } }));
  };

  // Snake Game Logic
  const gridSize = 20;

  const initSnakeGame = popup => {
    const canvas = popup.document.getElementById("snakeCanvas");
    snakeCanvasRef.current = canvas;
    canvas.width = 400;
    canvas.height = 300;
    setGameState(prev => ({
      ...prev,
      snake: {
        score: 0,
        active: true,
        snake: [{ x: 5, y: 5 }],
        food: {
          x: Math.floor(Math.random() * (canvas.width / gridSize)),
          y: Math.floor(Math.random() * (canvas.height / gridSize)),
        },
        direction: "right",
        started: true,
      },
    }));
    popup.document.addEventListener("keydown", changeSnakeDirection);
    startSnakeGame(popup);
  };

  const startSnakeGame = popup => {
    if (snakeGameIntervalRef.current) clearInterval(snakeGameIntervalRef.current);
    snakeGameIntervalRef.current = setInterval(() => updateSnakeGame(popup), 200); // Slower speed (200ms)
  };

  const stopSnakeGame = () => {
    clearInterval(snakeGameIntervalRef.current);
    setGameState(prev => ({
      ...prev,
      snake: { ...prev.snake, active: false, started: false },
    }));
  };

  const changeSnakeDirection = e => {
    setGameState(prev => {
      const { direction } = prev.snake;
      if (e.key === "ArrowUp" && direction !== "down")
        return { ...prev, snake: { ...prev.snake, direction: "up" } };
      if (e.key === "ArrowDown" && direction !== "up")
        return { ...prev, snake: { ...prev.snake, direction: "down" } };
      if (e.key === "ArrowLeft" && direction !== "right")
        return { ...prev, snake: { ...prev.snake, direction: "left" } };
      if (e.key === "ArrowRight" && direction !== "left")
        return { ...prev, snake: { ...prev.snake, direction: "right" } };
      return prev;
    });
  };

  const updateSnakeGame = popup => {
    const canvas = snakeCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setGameState(prev => {
      const { snake, food, direction } = prev.snake;
      let head = { x: snake[0].x, y: snake[0].y };
      if (direction === "up") head.y--;
      if (direction === "down") head.y++;
      if (direction === "left") head.x--;
      if (direction === "right") head.x++;

      if (
        head.x < 0 ||
        head.x >= canvas.width / gridSize ||
        head.y < 0 ||
        head.y >= canvas.height / gridSize
      ) {
        stopSnakeGame();
        popup.alert(`Game Over! Your score: ${prev.snake.score}`);
        return prev;
      }

      for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          stopSnakeGame();
          popup.alert(`Game Over! Your score: ${prev.snake.score}`);
          return prev;
        }
      }

      const newSnake = [head, ...snake];
      let newScore = prev.snake.score;
      if (head.x === food.x && head.y === food.y) {
        newScore++;
        food.x = Math.floor(Math.random() * (canvas.width / gridSize));
        food.y = Math.floor(Math.random() * (canvas.height / gridSize));
      } else {
        newSnake.pop();
      }

      ctx.fillStyle = "#2ecc71";
      newSnake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
      });
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

      popup.document.getElementById("gameArea").innerHTML += `<p>Score: ${newScore}</p>`;
      return {
        ...prev,
        snake: { ...prev.snake, snake: newSnake, score: newScore, food },
      };
    });
  };

  // Breathing Exercise Logic
  const startBreathingExercise = popup => {
    setGameState(prev => ({ ...prev, breathing: { active: true, started: true } }));
    const circle = popup.document.getElementById("breathingCircle");
    breathingCircleRef.current = circle;
    let growing = true;
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    breathingIntervalRef.current = setInterval(() => {
      if (growing) {
        circle.style.width = "150px";
        circle.style.height = "150px";
      } else {
        circle.style.width = "100px";
        circle.style.height = "100px";
      }
      growing = !growing;
    }, 6000); // Slower cycle (6s)
  };

  const stopBreathingExercise = () => {
    clearInterval(breathingIntervalRef.current);
    setGameState(prev => ({ ...prev, breathing: { active: false, started: false } }));
    if (breathingCircleRef.current) {
      breathingCircleRef.current.style.width = "100px";
      breathingCircleRef.current.style.height = "100px";
    }
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col fixed h-full">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">MindCompanion</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Anonymous Community</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "postsSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("postsSection")}
          >
            Posts
          </button>
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "chatSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("chatSection")}
          >
            Chat
          </button>
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "gamesSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("gamesSection")}
          >
            Games
          </button>
          <button
            className={`w-full text-left px-4 py-2 rounded-md ${
              activeSection === "whatsappSection"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("whatsappSection")}
          >
            WhatsApp
          </button>
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={toggleTheme}
          >
            Toggle Theme
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {/* Posts Section */}
        <section className={`${activeSection === "postsSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Community Posts</h2>
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={postInput}
                onChange={e => setPostInput(e.target.value)}
                placeholder="Share a joke or thought..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <button
                onClick={addPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Post
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Anonymous User • {new Date(post.id).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => upvotePost(post.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      ⬆
                    </button>
                    <span className="text-sm">{post.upvotes - post.downvotes}</span>
                    <button
                      onClick={() => downvotePost(post.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      ⬇
                    </button>
                  </div>
                </div>
                <p className="mb-2">{post.text}</p>
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Comments:</h4>
                  {post.comments.map((comment, idx) => (
                    <p key={idx} className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {comment}
                    </p>
                  ))}
                </div>
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    onKeyPress={e =>
                      e.key === "Enter" &&
                      addComment(post.id, e.target.value) &&
                      (e.target.value = "")
                    }
                  />
                  <button
                    onClick={e =>
                      addComment(post.id, e.target.previousSibling.value) &&
                      (e.target.previousSibling.value = "")
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chat Section */}
        <section className={`${activeSection === "chatSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Anonymous Chat</h2>
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setPostInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <button
                onClick={addChatMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
          <div
            ref={chatListRef}
            className="max-h-[70vh] overflow-y-auto space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            {chatMessages.map(msg => (
              <div key={msg.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Anonymous User • {new Date(msg.id).toLocaleTimeString()}
                </span>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Games Section */}
        <section className={`${activeSection === "gamesSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Stress-Relief Games</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Happy Face Game */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                  <div className="absolute mt-8 w-8 h-4 bg-black rounded-b-full"></div>
                </div>
              </div>
              <h3 className="text-lg font-medium">Happy Face Game</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the happy face to reduce stress!
              </p>
              <button
                onClick={() => openGamePopup("happyFace")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>

            {/* Doodle Game */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
              <h3 className="text-lg font-medium">Doodle Game</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Draw to relax!</p>
              <button
                onClick={() => openGamePopup("doodle")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>

            {/* Snake Game */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
              <h3 className="text-lg font-medium">Snake Game</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Classic snake fun!</p>
              <button
                onClick={() => openGamePopup("snake")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>

            {/* Breathing Exercise */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-blue-300 rounded-full" />
              </div>
              <h3 className="text-lg font-medium">Breathing Exercise</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Breathe to calm down!</p>
              <button
                onClick={() => openGamePopup("breathing")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Now
              </button>
            </div>
          </div>
        </section>

        {/* WhatsApp Section */}
        <section className={`${activeSection === "whatsappSection" ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">WhatsApp Chat</h2>
            <div className="mt-4">
              <button
                onClick={runWhatsApp}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Talk on WhatsApp
              </button>
            </div>
          </div>
          {whatsappMessage && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p>{whatsappMessage}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MindCompanion;
>>>>>>> ce9381768a87d83fb9fb987c4c89e5ce669f135c
