document.addEventListener('DOMContentLoaded', () => {
  const questionEl = document.querySelector('.quiz-question');
  const choicesEl = document.getElementById('quiz-choices');
  const nextBtn = document.getElementById('quiz-next');
  const restartBtn = document.getElementById('quiz-restart');
  const feedbackEl = document.getElementById('quiz-feedback');
  const scoreEl = document.getElementById('quiz-score');
  const memorySection = document.querySelector('.jogo-da-memoria');
  const memoryStatus = document.getElementById('memory-status');
  const memoryGrid = document.querySelector('.memoria-grid');

  let questions = [];
  let cards = [];
  let currentQuestion = 0;
  let correctAnswers = 0;
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let boardLocked = false;
  let memoryGameStarted = false;

  Promise.all([fetchJson('./data/perguntas.json'), fetchJson('./data/cards.json')])
    .then(([questionData, cardData]) => {
      if (!Array.isArray(questionData) || !Array.isArray(cardData)) {
        throw new Error('Formato de dados inválido.');
      }

      questions = questionData;
      cards = cardData;
      renderQuestion();
    })
    .catch(() => {
      questionEl.textContent = 'Erro ao carregar o jogo.';
      feedbackEl.textContent = 'Atualize a página para tentar novamente.';
    });

  function fetchJson(url) {
    return fetch(url).then((response) => {
      if (!response.ok) throw new Error(`Não foi possível carregar ${url}.`);
      return response.json();
    });
  }

  function renderQuestion() {
    choicesEl.replaceChildren();
    feedbackEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
    nextBtn.hidden = true;
    restartBtn.hidden = true;

    if (currentQuestion >= questions.length) {
      questionEl.textContent = 'Quiz finalizado!';
      scoreEl.textContent = `Você acertou ${correctAnswers} de ${questions.length} perguntas.`;
      restartBtn.hidden = false;
      return;
    }

    const question = questions[currentQuestion];
    questionEl.textContent = question.pergunta || 'Pergunta indisponível.';
    scoreEl.textContent = `Pergunta ${currentQuestion + 1} de ${questions.length}`;

    (question.alternativas || []).forEach((alternative) => {
      const choiceBtn = document.createElement('button');
      choiceBtn.type = 'button';
      choiceBtn.className = 'quiz-choice';
      choiceBtn.textContent = alternative;
      choiceBtn.addEventListener('click', () => answerQuestion(question, alternative));
      choicesEl.appendChild(choiceBtn);
    });
  }

  function answerQuestion(question, answer) {
    const isCorrect = normalize(answer) === normalize(question.resposta);
    const choiceButtons = choicesEl.querySelectorAll('button');

    choiceButtons.forEach((button) => {
      button.disabled = true;
      if (normalize(button.textContent) === normalize(question.resposta)) {
        button.classList.add('is-correct');
      }
    });

    if (isCorrect) {
      correctAnswers += 1;
      feedbackEl.textContent = 'Correto! O jogo da memória foi desbloqueado.';
      feedbackEl.className = 'quiz-feedback is-correct';
      unlockMemoryGame();
    } else {
      feedbackEl.textContent = `Resposta incorreta. A resposta correta é: ${question.resposta}.`;
      feedbackEl.className = 'quiz-feedback is-incorrect';
    }

    nextBtn.hidden = false;
    scoreEl.textContent = `Pergunta ${currentQuestion + 1} de ${questions.length} · Acertos: ${correctAnswers}`;
  }

  function unlockMemoryGame() {
    memorySection.classList.remove('is-locked');
    memorySection.removeAttribute('aria-disabled');

    if (!memoryGameStarted) startMemoryGame();
  }

  function startMemoryGame() {
    const selectedCards = shuffle(cards).slice(0, 5);
    const deck = shuffle([...selectedCards, ...selectedCards]);

    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    boardLocked = false;
    memoryGameStarted = true;
    memoryGrid.replaceChildren();

    deck.forEach((card, index) => {
      const cardButton = document.createElement('button');
      cardButton.type = 'button';
      cardButton.className = 'memoria-card';
      cardButton.dataset.cardId = String(card.id);
      cardButton.setAttribute('aria-label', `Carta ${index + 1}, virada para baixo`);
      const image = document.createElement('img');
      image.src = card.imagem.replace(/^\.\.\//, '');
      image.alt = card.nome;
      cardButton.appendChild(image);
      cardButton.addEventListener('click', () => flipCard(cardButton));
      memoryGrid.appendChild(cardButton);
    });

    memoryStatus.textContent = 'Encontre os 5 pares de heróis. Movimentos: 0.';
  }

  function flipCard(cardButton) {
    if (boardLocked || cardButton.classList.contains('is-flipped') || cardButton.classList.contains('is-matched')) {
      return;
    }

    cardButton.classList.add('is-flipped');
    cardButton.setAttribute('aria-label', `Carta: ${cardButton.querySelector('img').alt}`);
    flippedCards.push(cardButton);

    if (flippedCards.length !== 2) return;

    moves += 1;
    boardLocked = true;
    const [firstCard, secondCard] = flippedCards;
    const isMatch = firstCard.dataset.cardId === secondCard.dataset.cardId;

    if (isMatch) {
      firstCard.classList.add('is-matched');
      secondCard.classList.add('is-matched');
      firstCard.disabled = true;
      secondCard.disabled = true;
      matchedPairs += 1;
      flippedCards = [];
      boardLocked = false;

      if (matchedPairs === 5) {
        memoryStatus.textContent = `Parabéns! Você encontrou todos os pares em ${moves} movimentos.`;
      } else {
        memoryStatus.textContent = `Par encontrado! Movimentos: ${moves}.`;
      }
      return;
    }

    memoryStatus.textContent = `Não formou um par. Movimentos: ${moves}.`;
    window.setTimeout(() => {
      flippedCards.forEach((card) => {
        card.classList.remove('is-flipped');
        card.setAttribute('aria-label', 'Carta virada para baixo');
      });
      flippedCards = [];
      boardLocked = false;
    }, 850);
  }

  function shuffle(items) {
    const shuffledItems = [...items];
    for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
    }
    return shuffledItems;
  }

  function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase('pt-BR');
  }

  nextBtn.addEventListener('click', () => {
    currentQuestion += 1;
    renderQuestion();
  });

  restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    correctAnswers = 0;
    memoryGameStarted = false;
    memorySection.classList.add('is-locked');
    memorySection.setAttribute('aria-disabled', 'true');
    memoryGrid.replaceChildren();
    memoryStatus.textContent = 'Jogo da memória bloqueado: acerte uma pergunta para jogar.';
    renderQuestion();
  });
});
