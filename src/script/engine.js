const state = {
    view: {
        squares: document.querySelectorAll(".square"),
        enemy: document.querySelector(".enemy"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
        life: document.querySelector("#life"),
        gameOverAudio: document.getElementById("gameOverAudio"),
        gameOverOverlay: document.getElementById("gameOverOverlay"),
        scoreText: document.getElementById("scoreText"),
        playAgainButton: document.getElementById("playAgainButton"),
        highScoresButton: document.getElementById("highScoresButton"),
        errorAudio: new Audio("./src/audios/error.mp3"),
        playerImageContainer: document.getElementById('playerImageContainer'),
    },
    values: {
        gameVelocity: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 60,
        life: 3,
        highScores: [
            { score: 0, name: "" },
            { score: 0, name: "" },
            { score: 0, name: "" },
        ],
        playerName: "", // Adiciona uma propriedade para armazenar o nome do jogador
    },
    actions: {
        timerId: setInterval(randomSquare, 1000),
        countDownTimerId: setInterval(countDown, 1000),
    },
};

async function showGameOverOverlay() {
    playErrorSound(); // Reproduz o som de erro

    // Aguarda um curto período após o som de erro (por exemplo, 500 milissegundos)
    await sleep(500);

    playGameOverMusic(); // Reproduz o som de fim da partida

    state.view.gameOverOverlay.style.display = "flex";

    if (state.values.life <= 0) {
        state.view.scoreText.textContent =
            "Game Over! Você perdeu todas as vidas. Pontuação: " + state.values.result;
    } else {
        state.view.scoreText.textContent =
            "Game Over! Tempo esgotado. Pontuação: " + state.values.result;
    }

    // Event listener no botão "Jogar Novamente"
    state.view.playAgainButton.addEventListener("click", reiniciarJogo);
}

function getPlayerName() {
    let playerName = prompt("Digite seu nome (máximo 3 caracteres):");
    if (playerName) {
        return playerName.slice(0, 3);
    } else {
        return "AAA";
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function hideGameOverOverlay() {
    state.view.gameOverOverlay.style.display = "none";
}

function perdeVida() {
    state.values.life--;
    state.view.life.textContent = "x" + state.values.life;

    if (state.values.life <= 0) {
        clearInterval(state.actions.countDownTimerId);
        clearInterval(state.actions.timerId);
        showGameOverOverlay();
        // Atualize a lista de melhores resultados após mostrar a pontuação
        updateHighScores();
        // Mostrar a lista de melhores resultados no final de cada partida
        showHighScores();
    } else {
        // Reproduza o som de erro
        playErrorSound();
    }
}

function showPlayerImage() {
    const playerImageContainer = document.getElementById('playerImageContainer');
    const textContainer = document.querySelector('.text-container');
    
    // Adicione a imagem e o texto -1 ao conteúdo do container
    playerImageContainer.innerHTML = `
        <div class="image-container">
            <img src="./src/images/player.png" alt="Player Image" id="playerIcon">
        </div>
        <div class="text-container">
            <div id="overlayText">-1</div>
        </div>
    `;

    // Exibe o container
    playerImageContainer.style.display = 'flex';
}

// Adicione esta função para ocultar a imagem do jogador


// Função para ocultar a imagem do jogador
function hidePlayerImage() {
    const playerImageContainer = document.getElementById('playerImageContainer');
    
    // Limpa o conteúdo do container
    playerImageContainer.innerHTML = '';

    // Oculta o container
    playerImageContainer.style.display = 'none';
}

// Adicione esta função para reproduzir o som de erro
function playErrorSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    // Carregue o áudio (certifique-se de fornecer o caminho correto)
    fetch('./src/audios/error.mp3')
        .then(response => response.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
        .then(audioBuffer => {
            source.buffer = audioBuffer;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = 0.5; // Ajuste o volume conforme necessário
            source.start();
        })
        .catch(error => console.error('Erro ao carregar o áudio:', error));
}

function showHighScores() {
    const highScores = state.values.highScores;
    const highScoresList = document.getElementById("highScoresList");

    highScoresList.innerHTML = "";

    highScores.forEach((entry, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${entry.score}`;

        if (entry.name && entry.score > 0) {
            listItem.textContent += ` - ${entry.name}`;
        }

        highScoresList.appendChild(listItem);
    });

    document.getElementById("highScoresContainer").style.display = "block";
}

async function playSounds() {
    // Reproduz o som de erro
    playErrorSound();

    // Aguarda um curto período após o som de erro (por exemplo, 500 milissegundos)
    await sleep(500);

    // Reproduz o som de fim da partida
    playGameOverMusic();
}

function updateHighScores() {
    const highScores = state.values.highScores;
    const currentResult = state.values.result;
    const playerName = state.values.playerName;

    // Verifica se a pontuação é maior que zero e se o jogador tem um nome
    if (currentResult > 0 && playerName) {
        const newScore = { score: currentResult, name: playerName };

        // Verifica se a pontuação é maior que a menor pontuação atual
        const lowestScore = Math.min(...highScores.map((entry) => entry.score));
        const lowestScoreIndex = highScores.findIndex((entry) => entry.score === lowestScore);

        if (highScores.length < 3 || currentResult > lowestScore) {
            if (highScores.length === 3) {
                highScores.splice(lowestScoreIndex, 1); // Remove a pontuação mais baixa
            }

            highScores.push(newScore);
            highScores.sort((a, b) => b.score - a.score);
        }
    }
}


function countDown() {
    state.values.currentTime--;
    state.view.timeLeft.textContent = state.values.currentTime;

    if (state.values.currentTime <= 0) {
        clearInterval(state.actions.countDownTimerId);
        clearInterval(state.actions.timerId);
        showGameOverOverlay();
    }
}

function playSound(audioName) {
    let audio = new Audio(`./src/audios/${audioName}.m4a`);
    audio.volume = 0.2;
    audio.play();
}

function playGameOverMusic() {
    state.view.gameOverAudio.volume = 0.5;
    state.view.gameOverAudio.play();
}

function randomSquare() {
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });

    let randomNumber = Math.floor(Math.random() * 9);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id;
}

function addListenerHitBox() {
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if (square.id === state.values.hitPosition) {
                state.values.result++;
                state.view.score.textContent = state.values.result;
                state.values.hitPosition = null;
                playSound("hit");
            } else if (!square.classList.contains("enemy")) {
                // Se o clique foi dentro de um quadrado que não contém a imagem
                perdeVida();
                playErrorSound();
            }
            // Se o clique foi fora do quadrado que contém a imagem, não faz nada
        });
    });
}

function showRedOverlay() {
    const errorOverlay = document.getElementById('errorOverlay');

    // Verifique se o overlay já está visível antes de prosseguir
    if (!errorOverlay.classList.contains('active')) {
        // Mostra o overlay vermelho translúcido
        errorOverlay.classList.add('active');

        // Cria e exibe o texto do overlay
        const overlayText = document.createElement('div');
        overlayText.id = 'overlayText';
        overlayText.textContent = '-1';

        // Exibe a imagem
        showPlayerImage();

        // Adiciona o texto do overlay ao corpo do documento
        document.body.appendChild(overlayText);

        // Oculta o overlay e a imagem após um período de tempo (por exemplo, 500 milissegundos)
        setTimeout(() => {
            hideRedOverlay(overlayText); // Passa o texto do overlay como argumento
        }, 500); // Tempo de espera após a exibição do overlay

        console.log('Overlay exibido!');
    } else {
        console.log('Overlay já visível.');
    }
}

// Adicione esta função para ocultar o overlay vermelho translúcido
function hideRedOverlay(overlayText) {
    const errorOverlay = document.getElementById('errorOverlay');

    // Oculta a imagem, o texto e o overlay
    hidePlayerImage();
    overlayText.style.display = 'none';
    errorOverlay.classList.remove('active');

    // Remove o elemento de texto do overlay do DOM
    overlayText.parentNode.removeChild(overlayText);
}

// Modifique a função playErrorSound para mostrar o overlay ao reproduzir o som de erro
async function playErrorSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch('./src/audios/error.mp3');
        const audioBuffer = await response.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(audioBuffer);

        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start();

        showRedOverlay();
    } catch (error) {
        console.error('Erro ao carregar o áudio:', error);
    }
}

async function showGameOverOverlay() {
    // Trata os sons antes de continuar
    await playSounds();

    // Se o playerName ainda não foi definido, obtenha-o
    if (!state.values.playerName) {
        state.values.playerName = getPlayerName();
    }

    state.view.gameOverOverlay.style.display = "flex";

    let gameOverText = "";

    if (state.values.life <= 0) {
        gameOverText = "Game Over! Você perdeu todas as vidas. Pontuação: " + state.values.result;
    } else {
        gameOverText = "Game Over! Tempo esgotado. Pontuação: " + state.values.result;
    }

    // Exiba a pontuação
    gameOverText += " - " + state.values.playerName;
    state.view.scoreText.textContent = gameOverText;

    // Atualiza a lista de melhores resultados
    updateHighScores();

    // Exibe a lista de melhores resultados
    showHighScores();

    // Event listener no botão "Jogar Novamente"
    state.view.playAgainButton.addEventListener("click", reiniciarJogo);
}


async function reiniciarJogo() {
    state.values.life = 3;
    state.view.life.textContent = "x" + state.values.life;
    state.values.result = 0;
    state.view.score.textContent = state.values.result;
    state.values.currentTime = 60;
    state.view.timeLeft.textContent = state.values.currentTime;

    // Limpa o nome do jogador ao reiniciar o jogo
    state.values.playerName = "";

    state.actions.timerId = setInterval(randomSquare, 1000);
    state.actions.countDownTimerId = setInterval(countDown, 1000);
    hideGameOverOverlay();

    // Mostra a lista de melhores resultados no final de cada partida
    showHighScores();
    // Atualiza a lista de melhores resultados após mostrar a pontuação
    updateHighScores();
}


// Função para aguardar um determinado período de tempo (ms)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function initialize() {
    document.addEventListener("click", playSound);
    addListenerHitBox();
    view.playAgainButton.addEventListener("click", reiniciarJogo);
    view.highScoresButton.addEventListener("click", showHighScores);
}

initialize();
