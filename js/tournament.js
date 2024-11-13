//TODO: if 1 pl -> 1 vs com
//      if 2 pl -> double play
//      if >= 3 -> tournament all_vs_all / knockout
import { DataTextureLoader } from "three";
import { Game } from "./pong";
import { MessageManager } from "./pong3d";

export class Tournament {
  constructor(players) {
    this.players = players;
    this.matches = [];
    this.winners = [];
    this.mode = this.setMode();
    this.winCounts = {};
    this.tournamentWinner = null;
    let gameFinished = false;

    this.players.forEach((player) => {
      this.winCounts[player] = 0;
    });
    this.messageManager = new MessageManager();
  }

  setMode() {
    const players = this.players.length;

    if (players === 1) {
      return "solo_play";
    } else if (players === 2) {
      return "double_play";
    } else if (players === 3) {
      return "all_vs_all";
    } else {
      return "knockout";
    }
  }

  startTournament() {
    switch (this.mode) {
      case "solo_play":
        console.log("Modo 1 jugador vs computadora.");
        this.soloPlayGame();
        break;
      case "double_play":
        console.log("Modo 1 vs 1.");
        this.doublePlayGame();
        break;
      case "all_vs_all":
        console.log("Modo todos contra todos.");
        this.allVsAllMatches();
        break;
      case "knockout":
        console.log("Modo eliminatorio.");
        this.knockoutMatches();
        break;
    }
  }

  soloPlayGame() {
    console.log(this.mode);
    const game = new Game("canvas", this.mode, this.players[0], "Computer");
    game.init();
  }

  doublePlayGame() {
    const game = new Game(
      "canvas",
      this.mode,
      this.players[0],
      this.players[1]
    );
    game.init();
  }

  allVsAllMatches() {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        this.matches.push([this.players[i], this.players[j]]);
        // console.log(
        //   `Partido programado: ${this.players[i]} vs ${this.players[j]}`
        // );
      }
    }
    this.showRoundMatches(this.matches);
    this.playNextMatch();
  }

  async knockoutMatches() {
    let round = [...this.players];
    let previouslyAutoAdvanced = [];
    let autoAdvancePlayer = null;

    while (round.length > 1) {
      let nextRound = [];
      this.matches = [];

      if (round.length % 2 !== 0) {
        let randomIndex;

        // check random player no haya pasado antes
        do {
          randomIndex = Math.floor(Math.random() * round.length);
          autoAdvancePlayer = round[randomIndex];
        } while (previouslyAutoAdvanced.includes(autoAdvancePlayer));

        nextRound.push(autoAdvancePlayer);
        previouslyAutoAdvanced.push(autoAdvancePlayer);
        // console.log(
        //   `${autoAdvancePlayer} avanza automaticamente a prox ronda.`
        // );
        round.splice(randomIndex, 1);
      } else autoAdvancePlayer = null;

      // partidos ronda actual
      for (let i = 0; i < round.length; i += 2) {
        if (round[i + 1]) {
          this.matches.push([round[i], round[i + 1]]);
        }
      }
      await this.showRoundMatches(this.matches, autoAdvancePlayer);

      // jugar cada partido
      for (let match of this.matches) {
        const winner = await new Promise((resolve) => {
          this.playMatch(match[0], match[1], resolve);
        });
        // console.log(`Ganador entre ${match[0]} y ${match[1]} es ${winner}`);
        await new Promise((resolve) => this.handleNextMatch(resolve));
        nextRound.push(winner);
      }
      round = nextRound;
      // espera antes de mostrar msj o seguir
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (round.length === 1) {
        this.tournamentWinner = round[0];
        this.finishTournament();
        return;
      }
    }
  }

  async showRoundMatches(matches, autoAdvancePlayer = null) {
    const matchList = matches
      .map(([player1, player2]) => `${player1} vs ${player2}`)
      .join("<br>");
    let msg = `Round matches:<br>${matchList}`;
    if (autoAdvancePlayer) {
      msg += `<br><strong>Note: ${autoAdvancePlayer} advances automatically!</strong>`;
    }
    msg += `<br><span style="font-size: 0.8em">Press any key to continue</span>`;
    this.messageManager.showMessage(msg, "#FFFFFF");
    // espera a tocar alguna tecla
    await new Promise((resolve) => {
      const handleKeyPress = (evt) => {
        this.messageManager.hideMessage();
        document.removeEventListener("keydown", handleKeyPress);
        resolve();
      };
      document.addEventListener("keydown", handleKeyPress, { once: true });
    });
  }

  determineWinner() {
    const winner = Object.keys(this.winCounts).reduce((a, b) =>
      this.winCounts[a] > this.winCounts[b] ? a : b
    );
    this.tournamentWinner = winner;
  }

  handleNextMatch(onNextMatch) {
    const handleKeyN = (evt) => {
      if (evt.code === "KeyN") {
        document.removeEventListener("keydown", handleKeyN);
        this.messageManager.hideMessage();
        if (onNextMatch) onNextMatch();
      }
    };
    document.addEventListener("keydown", handleKeyN);
  }

  playMatch(player1, player2, onFinish) {
    const game = new Game("canvas", this.mode, player1, player2);
    game.init();
    const checkGameOver = setInterval(() => {
      if (game.isGameOver) {
        clearInterval(checkGameOver);
        game.endGame((winner) => {
          this.winCounts[winner]++;
          onFinish(winner);
        });
      }
    }, 100);
  }

  playNextMatch() {
    if (this.matches.length === 0) {
      this.finishTournament();
      return;
    }

    const [player1, player2] = this.matches.shift();
    console.log(`Partido entre ${player1} y ${player2}`);

    this.playMatch(player1, player2, (winner) => {
      this.winners.push(winner);
      this.handleNextMatch(() => {
        this.playNextMatch();
      });
    });
  }

  finishTournament() {
    if (this.mode === "all_vs_all") {
      this.determineWinner();
    }
    console.log("WINNERRRRR: ", this.tournamentWinner);
    this.messageManager.showMessage(
      `Tournament winner: ${this.tournamentWinner}<br>Press 'R' to retry or 'Esc' to finish`,
      "#FF0000"
    ); 
    document.addEventListener("keydown", this.handleEndTournament.bind(this), {
      once: true,
    });
  }

  handleEndTournament(event) {
    if (event.key === "R" || event.key === "r") {
      this.retryTournament();
    } else if (event.key === "Escape") {
      this.loadHomePage();
    }
  }

  retryTournament() {
    document.removeEventListener("keydown", this.handleEndTournament);
    this.matches = [];
    this.rounds = [];
    this.tournamentWinner = null;
    this.startTournament();
  }

  loadHomePage() {
    document.removeEventListener("keydown", this.handleEndTournament);
    fetch("/")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("main").innerHTML = html;
        history.pushState({}, "", "/");
      })
      .catch((error) =>
        console.error("Error al cargar la página de inicio:", error)
      );
  }
}