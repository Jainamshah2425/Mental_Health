// Initial Data (unchanged)
let posts = [
  {
    id: Date.now() - 3600000,
    text: "Why did the scarecrow become a motivational speaker? Because he was outstanding in his field! 😄",
    upvotes: 12,
    downvotes: 2,
    comments: ["Haha, that’s a good one!", "Love this joke!"],
  },
  {
    id: Date.now() - 1800000,
    text: "Feeling a bit overwhelmed with work... any tips for managing stress?",
    upvotes: 8,
    downvotes: 1,
    comments: ["Try taking short breaks every hour!", "Deep breathing helps me a lot."],
  },
  {
    id: Date.now() - 600000,
    text: "Just played the Happy Face Game and it really cheered me up! 🎉",
    upvotes: 5,
    downvotes: 0,
    comments: ["Same! It’s so fun!"],
  },
];

let chatMessages = [
  {
    id: Date.now() - 3000000,
    text: "Hey everyone, just wanted to say you’re all awesome!",
  },
  {
    id: Date.now() - 2400000,
    text: "Thanks! I needed that today. 😊",
  },
  {
    id: Date.now() - 1200000,
    text: "Has anyone tried the new Snake Game? It’s super relaxing!",
  },
  {
    id: Date.now() - 300000,
    text: "I’m feeling a bit anxious... any suggestions?",
  },
  {
    id: Date.now() - 60000,
    text: "Try the Breathing Exercise game! It really helps me calm down.",
  },
];

// Mobile Menu Toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  mobileMenu.classList.toggle("active");
}

// Posts Section (unchanged)
function addPost() {
  const postInput = document.getElementById("postInput");
  const postText = postInput.value.trim();

  if (postText) {
    const post = {
      id: Date.now(),
      text: filterText(postText),
      upvotes: 0,
      downvotes: 0,
      comments: [],
    };
    posts.push(post);
    postInput.value = "";
    renderPosts();
  }
}

function renderPosts() {
  const postsList = document.getElementById("postsList");
  postsList.innerHTML = "";

  posts.forEach(post => {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
            <div class="post-header">
                <span>Anonymous User • ${new Date(post.id).toLocaleTimeString()}</span>
                <div class="actions">
                    <button class="vote-btn" onclick="upvotePost(${post.id})">⬆</button>
                    <span class="vote-count">${post.upvotes - post.downvotes}</span>
                    <button class="vote-btn" onclick="downvotePost(${post.id})">⬇</button>
                </div>
            </div>
            <p>${post.text}</p>
            <div class="comments">
                <h4>Comments:</h4>
                ${post.comments
                  .map(comment => `<p class="comment">${filterText(comment)}</p>`)
                  .join("")}
            </div>
            <div class="comment-input">
                <input type="text" placeholder="Add a comment..." onkeypress="if(event.key === 'Enter') addComment(${
                  post.id
                }, this)">
                <button onclick="addComment(${
                  post.id
                }, this.previousElementSibling)">Comment</button>
            </div>
        `;
    postsList.appendChild(postElement);
  });
}

function upvotePost(id) {
  const post = posts.find(p => p.id === id);
  if (post) {
    post.upvotes++;
    renderPosts();
  }
}

function downvotePost(id) {
  const post = posts.find(p => p.id === id);
  if (post) {
    post.downvotes++;
    renderPosts();
  }
}

function addComment(postId, input) {
  const commentText = input.value.trim();
  if (commentText) {
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.comments.push(commentText);
      input.value = "";
      renderPosts();
    }
  }
}

// Chat Section (unchanged)
function addChatMessage() {
  const chatInput = document.getElementById("chatInput");
  const messageText = chatInput.value.trim();

  if (messageText) {
    const message = {
      id: Date.now(),
      text: filterText(messageText),
    };
    chatMessages.push(message);
    chatInput.value = "";
    renderChat();
    const chatList = document.getElementById("chatList");
    chatList.scrollTop = chatList.scrollHeight;
  }
}

function renderChat() {
  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";

  chatMessages.forEach(message => {
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message";
    messageElement.innerHTML = `
            <span>Anonymous User • ${new Date(message.id).toLocaleTimeString()}</span>
            <p>${message.text}</p>
        `;
    chatList.appendChild(messageElement);
  });
}

// Simple Language Filter (unchanged)
function filterText(text) {
  const badWords = ["hate", "stupid", "idiot", "damn", "hell"];
  let filteredText = text;
  badWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filteredText = filteredText.replace(regex, "****");
  });
  return filteredText;
}

// Navigation
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
  document.querySelector(`button[onclick*="showSection('${sectionId}')"]`).classList.add("active");

  if (sectionId === "chatSection") {
    const chatList = document.getElementById("chatList");
    chatList.scrollTop = chatList.scrollHeight;
  }
}

// Theme Toggle (unchanged)
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// Game Modals (unchanged)
function showGame(gameId) {
  document.getElementById(gameId).style.display = "flex";
  if (gameId === "doodleGame") {
    initDoodleGame();
  } else if (gameId === "snakeGame") {
    initSnakeGame();
  } else if (gameId === "breathingGame") {
    startBreathingExercise();
  }
}

function closeGame(gameId) {
  document.getElementById(gameId).style.display = "none";
  if (gameId === "happyFaceGame") {
    stopHappyFaceGame();
  } else if (gameId === "snakeGame") {
    stopSnakeGame();
  } else if (gameId === "breathingGame") {
    stopBreathingExercise();
  }
}

// Happy Face Game (unchanged)
let happyFaceScore = 0;
let happyFaceTimer = 30;
let gameInterval = null;
let timerInterval = null;

function startHappyFaceGame() {
  happyFaceScore = 0;
  happyFaceTimer = 30;
  document.getElementById("happyFaceScore").textContent = happyFaceScore;
  document.getElementById("happyFaceTimer").textContent = happyFaceTimer;

  moveHappyFace();
  gameInterval = setInterval(moveHappyFace, 2000);
  timerInterval = setInterval(() => {
    happyFaceTimer--;
    document.getElementById("happyFaceTimer").textContent = happyFaceTimer;
    if (happyFaceTimer <= 0) {
      stopHappyFaceGame();
      alert(`Game Over! Your score: ${happyFaceScore}`);
    }
  }, 1000);
}

function stopHappyFaceGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
}

function moveHappyFace() {
  const happyFace = document.getElementById("happyFace");
  const gameArea = document.getElementById("happyFaceArea");
  const maxX = gameArea.clientWidth - happyFace.clientWidth;
  const maxY = gameArea.clientHeight - happyFace.clientHeight;

  const newX = Math.random() * maxX;
  const newY = Math.random() * maxY;

  happyFace.style.left = newX + "px";
  happyFace.style.top = newY + "px";
}

function clickHappyFace() {
  happyFaceScore++;
  document.getElementById("happyFaceScore").textContent = happyFaceScore;
  moveHappyFace();
  playClickSound();
}

function playClickSound() {
  const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
  audio.play().catch(err => console.log("Audio playback failed:", err));
}

// Doodle Game (unchanged)
let isDrawing = false;

function initDoodleGame() {
  const canvas = document.getElementById("doodleCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = document.getElementById("doodleColor").value;

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);

  document.getElementById("doodleColor").addEventListener("change", e => {
    ctx.strokeStyle = e.target.value;
  });

  const previewCanvas = document.getElementById("doodlePreviewCanvas");
  const previewCtx = previewCanvas.getContext("2d");
  previewCtx.lineWidth = 3;
  previewCtx.strokeStyle = "#000";
  previewCtx.beginPath();
  previewCtx.moveTo(20, 20);
  previewCtx.quadraticCurveTo(100, 150, 180, 20);
  previewCtx.stroke();
}

function startDrawing(e) {
  isDrawing = true;
  const canvas = document.getElementById("doodleCanvas");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;
  const canvas = document.getElementById("doodleCanvas");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

function clearDoodleCanvas() {
  const canvas = document.getElementById("doodleCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Snake Game (unchanged)
let snake = [];
let food = { x: 0, y: 0 };
let snakeDirection = "right";
let snakeScore = 0;
let snakeGameInterval = null;
const gridSize = 20;

function initSnakeGame() {
  const canvas = document.getElementById("snakeCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 300;

  snake = [{ x: 5, y: 5 }];
  snakeDirection = "right";
  snakeScore = 0;
  document.getElementById("snakeScore").textContent = snakeScore;

  placeFood();
  startSnakeGame();

  document.addEventListener("keydown", changeSnakeDirection);
}

function startSnakeGame() {
  if (snakeGameInterval) clearInterval(snakeGameInterval);
  snakeGameInterval = setInterval(updateSnakeGame, 100);
}

function stopSnakeGame() {
  clearInterval(snakeGameInterval);
}

function placeFood() {
  const canvas = document.getElementById("snakeCanvas");
  food.x = Math.floor(Math.random() * (canvas.width / gridSize));
  food.y = Math.floor(Math.random() * (canvas.height / gridSize));
}

function changeSnakeDirection(e) {
  if (e.key === "ArrowUp" && snakeDirection !== "down") snakeDirection = "up";
  if (e.key === "ArrowDown" && snakeDirection !== "up") snakeDirection = "down";
  if (e.key === "ArrowLeft" && snakeDirection !== "right") snakeDirection = "left";
  if (e.key === "ArrowRight" && snakeDirection !== "left") snakeDirection = "right";
}

function updateSnakeGame() {
  const canvas = document.getElementById("snakeCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let head = { x: snake[0].x, y: snake[0].y };
  if (snakeDirection === "up") head.y--;
  if (snakeDirection === "down") head.y++;
  if (snakeDirection === "left") head.x--;
  if (snakeDirection === "right") head.x++;

  if (
    head.x < 0 ||
    head.x >= canvas.width / gridSize ||
    head.y < 0 ||
    head.y >= canvas.height / gridSize
  ) {
    stopSnakeGame();
    alert(`Game Over! Your score: ${snakeScore}`);
    return;
  }

  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      stopSnakeGame();
      alert(`Game Over! Your score: ${snakeScore}`);
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    snakeScore++;
    document.getElementById("snakeScore").textContent = snakeScore;
    placeFood();
  } else {
    snake.pop();
  }

  ctx.fillStyle = "#2ecc71";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Breathing Exercise (unchanged)
let breathingInterval = null;

function startBreathingExercise() {
  const circle = document.getElementById("breathingCircle");
  let growing = true;

  if (breathingInterval) clearInterval(breathingInterval);
  breathingInterval = setInterval(() => {
    if (growing) {
      circle.style.width = "150px";
      circle.style.height = "150px";
    } else {
      circle.style.width = "100px";
      circle.style.height = "100px";
    }
    growing = !growing;
  }, 4000);
}

function stopBreathingExercise() {
  clearInterval(breathingInterval);
  const circle = document.getElementById("breathingCircle");
  circle.style.width = "100px";
  circle.style.height = "100px";
}

// Initial Render
renderPosts();
renderChat();
