// ==========================================
// WORD LIST
// ==========================================

const WORDS = [
  "apple",
  "beach",
  "bread",
  "chair",
  "cloud",
  "dance",
  "dream",
  "earth",
  "flame",
  "green",
  "heart",
  "house",
  "light",
  "mouse",
  "ocean",
  "party",
  "plane",
  "plant",
  "radio",
  "river",
  "robot",
  "round",
  "smile",
  "snake",
  "space",
  "sport",
  "stone",
  "table",
  "tiger",
  "train",
  "water",
  "world"
];


// ==========================================
// GAME SETTINGS
// ==========================================

const ROWS = 6;
const COLS = 5;


// ==========================================
// HTML ELEMENTS
// ==========================================

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const newGameButton = document.getElementById("newGame");


// ==========================================
// GAME VARIABLES
// ==========================================

let answer = "";
let row = 0;
let guess = "";
let finished = false;


// ==========================================
// DAILY WORD
// ==========================================

function getDailyWord() {

  const now = new Date();

  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  const start = Date.UTC(2026, 0, 1);

  const daysSinceStart =
    Math.floor((today - start) / 86400000);

  const index =
    ((daysSinceStart % WORDS.length) + WORDS.length)
    % WORDS.length;

  return WORDS[index];
}


// ==========================================
// CREATE BOARD
// ==========================================

function createBoard() {

  board.innerHTML = "";

  for (let i = 0; i < ROWS * COLS; i++) {

    const tile = document.createElement("div");

    tile.className = "tile";

    board.appendChild(tile);
  }
}


// ==========================================
// CREATE KEYBOARD
// ==========================================

function createKeyboard() {

  keyboard.innerHTML = "";

  const rows = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ENTERZXCVBNM⌫"
  ];

  rows.forEach(rowLetters => {

    for (const letter of rowLetters) {

      const button = document.createElement("button");

      button.className = "key";

      button.textContent =
        letter === "⌫"
          ? "⌫"
          : letter;

      if (
        letter === "ENTER" ||
        letter === "⌫"
      ) {
        button.classList.add("wide");
      }

      button.addEventListener(
        "click",
        () => handleKey(letter)
      );

      keyboard.appendChild(button);
    }
  });
}


// ==========================================
// UPDATE CURRENT GUESS
// ==========================================

function updateCurrentRow() {

  for (let col = 0; col < COLS; col++) {

    const tile =
      board.children[row * COLS + col];

    tile.textContent =
      guess[col] || "";

    tile.classList.toggle(
      "filled",
      Boolean(guess[col])
    );
  }
}


// ==========================================
// KEYBOARD INPUT
// ==========================================

function handleKey(key) {

  if (finished) return;


  // ENTER
  if (key === "ENTER") {

    submitGuess();

    return;
  }


  // BACKSPACE
  if (key === "⌫") {

    guess = guess.slice(0, -1);

    updateCurrentRow();

    return;
  }


  // LETTER
  if (
    /^[A-Z]$/.test(key) &&
    guess.length < COLS
  ) {

    guess += key.toLowerCase();

    updateCurrentRow();
  }
}


// ==========================================
// SUBMIT GUESS
// ==========================================

function submitGuess() {

  if (guess.length !== COLS) {

    showMessage(
      "Enter a 5-letter word."
    );

    return;
  }


  revealGuess();


  // WIN
  if (guess === answer) {

    showMessage(
      "You got it! 🎉"
    );

    finish();

    return;
  }


  // LOSE
  if (row === ROWS - 1) {

    showMessage(
      "The word was " +
      answer.toUpperCase() +
      "."
    );

    finish();

    return;
  }


  // NEXT ROW
  row++;

  guess = "";
}


// ==========================================
// REVEAL LETTERS
// ==========================================

function revealGuess() {

  const counts = {};


  // Count letters in answer
  for (const char of answer) {

    counts[char] =
      (counts[char] || 0) + 1;
  }


  // ----------------------------------------
  // FIRST PASS: CORRECT LETTERS
  // ----------------------------------------

  for (let col = 0; col < COLS; col++) {

    const tile =
      board.children[row * COLS + col];

    const char =
      guess[col];


    if (char === answer[col]) {

      tile.classList.add("correct");

      counts[char]--;

      updateKey(
        char,
        "correct"
      );
    }
  }


  // ----------------------------------------
  // SECOND PASS
  // ----------------------------------------

  for (let col = 0; col < COLS; col++) {

    const tile =
      board.children[row * COLS + col];

    const char =
      guess[col];


    // Already correct
    if (
      tile.classList.contains("correct")
    ) {
      continue;
    }


    // Letter exists elsewhere
    if (counts[char] > 0) {

      tile.classList.add("present");

      counts[char]--;

      if (
        !getKeyClass(char)
          .includes("correct")
      ) {

        updateKey(
          char,
          "present"
        );
      }

    }

    // Letter doesn't exist
    else {

      tile.classList.add("absent");

      const keyClass =
        getKeyClass(char);

      if (
        !keyClass.includes("correct") &&
        !keyClass.includes("present")
      ) {

        updateKey(
          char,
          "absent"
        );
      }
    }
  }
}


// ==========================================
// FIND KEY
// ==========================================

function getKeyClass(char) {

  const button =
    [...keyboard.querySelectorAll(".key")]
      .find(
        b =>
          b.textContent.toLowerCase()
          === char.toLowerCase()
      );

  return button
    ? button.className
    : "";
}


// ==========================================
// UPDATE KEY COLOR
// ==========================================

function updateKey(
  char,
  status
) {

  const button =
    [...keyboard.querySelectorAll(".key")]
      .find(
        b =>
          b.textContent.toLowerCase()
          === char.toLowerCase()
      );


  if (!button) return;


  // Never downgrade a correct key
  if (
    button.classList.contains("correct")
  ) {
    return;
  }


  // Don't downgrade present to absent
  if (
    button.classList.contains("present") &&
    status === "absent"
  ) {
    return;
  }


  button.classList.remove(
    "present",
    "absent"
  );

  button.classList.add(status);
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text) {

  message.textContent = text;
}


// ==========================================
// FINISH GAME
// ==========================================

function finish() {

  finished = true;

  newGameButton.hidden = false;
}


// ==========================================
// START GAME
// ==========================================

function startGame() {

  answer = getDailyWord();

  row = 0;

  guess = "";

  finished = false;

  message.textContent = "";

  newGameButton.hidden = true;

  createBoard();

  createKeyboard();
}


// ==========================================
// PHYSICAL KEYBOARD
// ==========================================

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      handleKey("ENTER");

    } else if (
      event.key === "Backspace"
    ) {

      handleKey("⌫");

    } else if (
      /^[a-zA-Z]$/.test(event.key)
    ) {

      handleKey(
        event.key.toUpperCase()
      );
    }
  }
);


// ==========================================
// NEW GAME
// ==========================================

newGameButton.addEventListener(
  "click",
  startGame
);


// ==========================================
// START
// ==========================================

startGame();
