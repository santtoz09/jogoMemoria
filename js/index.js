const questionText = document.getElementById('quiz-question');
const choices = document.getElementById('quiz-choices');
const feedback = document.getElementById('quiz-feedback');
const score = document.getElementById('quiz-score');
const nextButton = document.getElementById('quiz-next');
const restartButton = document.getElementById('quiz-restart');
const memoryGame = document.getElementById('memory-game');
const memoryGrid = document.getElementById('memory-grid');
const memoryStatus = document.getElementById('memory-status');

let questions = [];
let cards = [];
let questionNumber = 0;
let correctAnswers = 0;
let firstCard = null;
let pairsFound = 0;
let locked = false;
let gameStarted = false;

fetch('./data/perguntas.json')
  .then((response) => response.json())
  .then((data) => {
    questions = data;
    showQuestion();
  });

fetch('./data/cards.json')
  .then((response) => response.json())
  .then((data) => {
    cards = data;
    if (!memoryGame.classList.contains('is-locked')) startMemoryGame();
  });

function showQuestion() {
  const question = questions[questionNumber];

  if (!question) {
    questionText.textContent = 'Quiz finalizado!';
    score.textContent = `Você acertou ${correctAnswers} perguntas.`;
    restartButton.hidden = false;
    return;
  }

  choices.innerHTML = '';
  feedback.textContent = '';
  nextButton.hidden = true;
  questionText.textContent = question.pergunta;
  score.textContent = `Pergunta ${questionNumber + 1} de ${questions.length}`;

  question.alternativas.forEach((alternative) => {
    const button = document.createElement('button');
    button.textContent = alternative;
    button.className = 'quiz-choice';
    button.onclick = () => answerQuestion(alternative);
    choices.appendChild(button);
  });
}

function answerQuestion(answer) {
  const question = questions[questionNumber];
  const buttons = choices.getElementsByTagName('button');

  for (let index = 0; index < buttons.length; index += 1) {
    buttons[index].disabled = true;
  }

  if (answer === question.resposta) {
    correctAnswers += 1;
    feedback.textContent = 'Correto! O jogo da memória foi desbloqueado.';
    feedback.className = 'quiz-feedback is-correct';
    unlockMemoryGame();
  } else {
    feedback.textContent = `A resposta correta é: ${question.resposta}.`;
    feedback.className = 'quiz-feedback is-incorrect';
  }

  nextButton.hidden = false;
}

function unlockMemoryGame() {
  memoryGame.classList.remove('is-locked');
  memoryGame.removeAttribute('aria-disabled');

  if (!gameStarted && cards.length > 0) {
    startMemoryGame();
  }
}

function startMemoryGame() {
  const chosenCards = cards.slice(0, 5);
  const deck = chosenCards.concat(chosenCards);

  deck.sort(() => Math.random() - 0.5);
  memoryGrid.innerHTML = '';
  firstCard = null;
  pairsFound = 0;
  locked = false;
  gameStarted = true;

  deck.forEach((card) => {
    const button = document.createElement('button');
    button.className = 'memoria-card';
    button.dataset.id = card.id;
    button.innerHTML = `<img src="${card.imagem.replace('../', '')}" alt="${card.nome}">`;
    button.onclick = () => flipCard(button);
    memoryGrid.appendChild(button);
  });

  memoryStatus.textContent = 'Encontre os 5 pares de heróis.';
}

function flipCard(card) {
  if (locked || card === firstCard || card.classList.contains('is-matched')) return;

  card.classList.add('is-flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  if (firstCard.dataset.id === card.dataset.id) {
    firstCard.classList.add('is-matched');
    card.classList.add('is-matched');
    firstCard.disabled = true;
    card.disabled = true;
    pairsFound += 1;
    firstCard = null;

    if (pairsFound === 5) {
      memoryStatus.textContent = 'Parabéns! Você encontrou todos os pares.';
    }
    return;
  }

  locked = true;
  const secondCard = card;

  setTimeout(() => {
    firstCard.classList.remove('is-flipped');
    secondCard.classList.remove('is-flipped');
    firstCard = null;
    locked = false;
  }, 800);
}

nextButton.onclick = () => {
  questionNumber += 1;
  showQuestion();
};

restartButton.onclick = () => {
  questionNumber = 0;
  correctAnswers = 0;
  gameStarted = false;
  memoryGrid.innerHTML = '';
  memoryGame.classList.add('is-locked');
  memoryGame.setAttribute('aria-disabled', 'true');
  memoryStatus.textContent = 'Jogo da memória bloqueado: acerte uma pergunta para jogar.';
  restartButton.hidden = true;
  showQuestion();
};
