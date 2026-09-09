document.addEventListener('DOMContentLoaded', () => {
  const questionEl = document.querySelector('.quiz-question');
  const choicesEl = document.getElementById('quiz-choices');
  const nextBtn = document.getElementById('quiz-next');
  const restartBtn = document.getElementById('quiz-restart');
  const feedbackEl = document.getElementById('quiz-feedback');
  const scoreEl = document.getElementById('quiz-score');
  const memorySection = document.querySelector('.jogo-da-memoria');
  const memoryStatus = document.getElementById('memory-status');

  let questions = [];
  let currentQuestion = 0;
  let correctAnswers = 0;

  fetch('./data/perguntas.json')
    .then((response) => {
      if (!response.ok) throw new Error('Não foi possível carregar as perguntas.');
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Formato de perguntas inválido.');
      questions = data;
      renderQuestion();
    })
    .catch(() => {
      questionEl.textContent = 'Erro ao carregar as perguntas.';
      feedbackEl.textContent = 'Atualize a página para tentar novamente.';
    });

  function renderQuestion() {
    choicesEl.replaceChildren();
    feedbackEl.textContent = '';
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
      if (memorySection.classList.contains('is-locked')) {
        memoryStatus.textContent = 'Jogo da memória bloqueado: acerte uma pergunta para jogar.';
      }
    }

    nextBtn.hidden = false;
    scoreEl.textContent = `Pergunta ${currentQuestion + 1} de ${questions.length} · Acertos: ${correctAnswers}`;
  }

  function unlockMemoryGame() {
    memorySection.classList.remove('is-locked');
    memorySection.removeAttribute('aria-disabled');
    memoryStatus.textContent = 'Jogo da memória desbloqueado! Você já pode tentar jogar.';
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
    memorySection.classList.add('is-locked');
    memorySection.setAttribute('aria-disabled', 'true');
    memoryStatus.textContent = 'Jogo da memória bloqueado: acerte uma pergunta para jogar.';
    renderQuestion();
  });
});
