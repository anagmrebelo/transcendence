import { MessageManager } from "./pong3d";

export class Game {
  constructor(canvasId, mode, player1, player2) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.dpr = window.devicePixelRatio || 1;
    this.gameMode = mode;
    this.player1 = player1;
    this.player2 = player2;
    this.scaleFactor = 1.5;
    this.abandonedGame = false;
    this.user = this.createPaddle(
      0,
      this.canvas.height / 2 / this.dpr - 50 * this.scaleFactor,
      "RED",
    );
    this.com = this.createPaddle(
      this.canvas.width / this.dpr - 10 * this.scaleFactor,
      this.canvas.height / 2 / this.dpr - 50 * this.scaleFactor,
      "RED",
    );
    this.ball = this.createBall(
      this.canvas.width / 2 / this.dpr,
      this.canvas.height / 2 / this.dpr,
      "WHITE",
    );

    this.net = {
      x: this.canvas.width / 2 / this.dpr - 1,
      y: 0,
      width: 2 * this.scaleFactor,
      height: 10 * this.scaleFactor,
      color: "WHITE",
    };

    this.comLevel = 1.2;
    this.lastUpdate = Date.now();
    this.updateInterval = 16;
    this.isGameOver = false;
    this.gameStarted = false;
    this.messageManager = new MessageManager();
    this.handleKeydown = this.handleKeydown.bind(this); //(para passar el context y poder usar hideMessage)
  }

  createPaddle(x, y, color) {
    return {
      x: x,
      y: y,
      width: 10 * this.scaleFactor,
      height: 100 * this.scaleFactor,
      color: color,
      score: 0,
    };
  }

  createBall(x, y, color) {
    let angleRad = (Math.random() * Math.PI) / 4; // ang aleatorio en la salida
    let direction = Math.random() > 0.5 ? 1 : -1; // direccion aleatoria
    let initialSpeed = 5;
    return {
      x: x,
      y: y,
      radius: 5 * this.scaleFactor,
      speed: initialSpeed,
      velocityX: initialSpeed * Math.cos(angleRad) * direction,
      velocityY: initialSpeed * Math.sin(angleRad),
      color: color,
    };
  }

  handleKeydown(evt) {
    if (evt.code === "Space" && !this.gameStarted) {
      this.messageManager.hideMessage();
      this.startGame();
    } else if (this.gameStarted) {
      this.move(evt);
    }
  }

  init() {
    window.addEventListener("popstate",  this.setAbandonedGame.bind(this))
    document.removeEventListener("keydown", this.move);
    document
      .getElementsByTagName("header")?.[0]
      ?.classList.add("d-none");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.user.y = this.canvas.height / 2 / this.dpr - this.user.height / 2;
    this.com.x = this.canvas.width / this.dpr - this.com.width;
    this.com.y = this.canvas.height / 2 / this.dpr - this.com.height / 2;
    this.ball.x = this.canvas.width / 2 / this.dpr;
    this.ball.y = this.canvas.height / 2 / this.dpr;
    this.canvas.setAttribute("tabindex", 0);
    this.canvas.focus();

    this.messageManager.showMessage(`Next Match: ${this.player1} vs ${this.player2}, Press Space to start`, "#FFFFFF", "rgba(0, 0, 0, 0.5)");
    document.addEventListener("keydown", this.handleKeydown);
    this.render();
  }

  startGame() {
    this.gameStarted = true;
    this.gameLoop();
  }

  setAbandonedGame() {
    this.abandonedGame = true;
    window.document.removeEventListener("keydown", this.handleKeyPress);
    window.document.removeEventListener("keydown", this.handleKeyPress.bind(this));
    window.document.removeEventListener("keydown", this.handleN);
    window.document.removeEventListener("keydown", this.handleKeydown);
    window.document.removeEventListener("keydown", this.handleKeydown.bind(this));
    console.trace();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  drawRectangle(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h),
    );
  }

  drawCircle(x, y, r, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2, false);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawText(text, x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${70 * this.scaleFactor}px Arial`;
    this.ctx.fillText(text, x, y);
  }

  drawNet() {
    const canvasWidth = this.canvas.width / this.dpr;
    const canvasHeight = this.canvas.height / this.dpr;
    const netX = canvasWidth / 2 - this.net.width / 2;
    for (let i = 0; i <= canvasHeight; i += 15 * this.scaleFactor) {
      this.drawRectangle(
        netX,
        this.net.y + i,
        this.net.width,
        this.net.height,
        this.net.color,
      );
    }
  }

  render() {
    this.drawRectangle(
      0,
      0,
      this.canvas.width / this.dpr,
      this.canvas.height / this.dpr,
      "BLACK",
    );
    this.drawNet();
    this.drawText(
      this.user.score,
      this.canvas.width / 4 / this.dpr,
      this.canvas.height / 5 / this.dpr,
      "WHITE",
    );
    this.drawText(
      this.com.score,
      (3 * this.canvas.width) / 4 / this.dpr,
      this.canvas.height / 5 / this.dpr,
      "WHITE",
    );
    this.drawRectangle(
      this.user.x,
      this.user.y,
      this.user.width,
      this.user.height,
      this.user.color,
    );
    this.drawRectangle(
      this.com.x,
      this.com.y,
      this.com.width,
      this.com.height,
      this.com.color,
    );
    this.drawCircle(
      this.ball.x,
      this.ball.y,
      this.ball.radius,
      this.ball.color,
    );
  }

  move(evt) {
    const paddleSpeed = 40;
    const canvasHeight = this.canvas.height / this.dpr;

    if (this.isGameOver === false)
    {
      if (evt.key === "w") {
        this.user.y = Math.max(this.user.y - paddleSpeed, 0);
      } else if (evt.key === "s") {
        this.user.y = Math.min(
          this.user.y + paddleSpeed,
          canvasHeight - this.user.height,
        );
      }
    }

    if (this.gameMode != "solo_play") {
      if (evt.key === "ArrowUp") {
        this.com.y = Math.max(this.com.y - paddleSpeed, 0);
      } else if (evt.key === "ArrowDown") {
        this.com.y = Math.min(
          this.com.y + paddleSpeed,
          canvasHeight - this.com.height,
        );
      }
    }
  }

  collision(ball, player) {
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    player.top = player.y;
    player.bottom = player.y + player.height;
    player.left = player.x;
    player.right = player.x + player.width;

    return (
      ball.right > player.left &&
      ball.bottom > player.top &&
      ball.left < player.right &&
      ball.top < player.bottom
    );
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2 / this.dpr;
    this.ball.y = this.canvas.height / 2 / this.dpr;
    this.ball.speed = 5;

    let angleRad = (Math.random() * Math.PI) / 4; // nuevo angulo de rebote
    let direction = Math.random() > 0.5 ? 1 : -1; //direccion aleatoria

    this.ball.velocityX = this.ball.speed * Math.cos(angleRad) * direction;
    this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
  }

  updateComPaddle() {
    let now = Date.now();
    if (now - this.lastUpdate > this.updateInterval) {
      this.lastUpdate = now;

      if (!this.errorTime || now - this.errorTime > 1000) {
        // cambia el margen de error cada segundo
        this.errorFactor = Math.min(this.ball.speed / 10, 1.5);
        this.errorOffset = (Math.random() - 0.5) * 100 * this.errorFactor; // genera un nuevo error
        this.errorTime = now; // marca el momento en que se generó el nuevo error
      }

      let targetY =
        this.ball.y + this.errorOffset - (this.com.y + this.com.height / 2);

      if (Math.abs(targetY) > 10) {
        this.com.y +=
          this.comLevel * Math.sign(targetY) * Math.min(8, Math.abs(targetY));
      }

      if (this.com.y < 0) {
        this.com.y = 0;
      } else if (this.com.y + this.com.height > this.canvas.height / this.dpr) {
        this.com.y = this.canvas.height / this.dpr - this.com.height;
      }
    }
  }

  update() {
    if (this.user.score >= 1 || this.com.score >= 1) {
      //AJUSTAR A 11
      this.endGame();
      return;
    }

    if (this.ball.x - this.ball.radius < 0) {
      this.com.score++;
      this.resetBall();
    } else if (this.ball.x + this.ball.radius > this.canvas.width / this.dpr) {
      this.user.score++;
      this.resetBall();
    }

    this.ball.x += this.ball.velocityX;
    this.ball.y += this.ball.velocityY;

    if (this.ball.y + this.ball.radius > this.canvas.height / this.dpr) {
      this.ball.y = this.canvas.height / this.dpr - this.ball.radius;
      this.ball.velocityY = -this.ball.velocityY;
    } else if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.velocityY = -this.ball.velocityY;
    }

    if (this.gameMode === "solo_play") {
      this.updateComPaddle();
    }

    let player =
      this.ball.x < this.canvas.width / 2 / this.dpr ? this.user : this.com;
    if (this.collision(this.ball, player)) {
      let collidePoint = this.ball.y - (player.y + player.height / 2);
      collidePoint = collidePoint / (player.height / 2);

      let angleRad = (collidePoint * Math.PI) / 4;
      let direction = this.ball.x < this.canvas.width / 2 / this.dpr ? 1 : -1;

      this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
      this.ball.velocityY = this.ball.speed * Math.sin(angleRad);

      this.ball.speed += 0.5;
    }
  }

  handleKeyPress(evt) {
	  if (this.isGameOver === true)
	  {
		  if (evt.key === "R" || evt.key === "r")
		  {
	      	document.removeEventListener("keydown", this.handleKeyPress);
	      	document.removeEventListener("keydown", this.handleKeyPress.bind(this));
	     	 this.resetGame(evt);
		  }
		  else if (evt.key === "Escape")
		  {
	      	document.removeEventListener("keydown", this.handleKeyPress);
	      	document.removeEventListener("keydown", this.handleKeyPress.bind(this));
	      	//this.setAbandonedGame();
	      	this.loadHomePage();
			delete this;
		  }
	  }
  }

  endGame(onFinish, onNextMatch) {
    this.isGameOver = true;

    let winner = this.user.score >= this.com.score ? this.player1 : this.player2;
    let loser = this.user.score < this.com.score ? this.player1 : this.player2;
    let winner_points = this.user.score >= this.com.score ? this.user.score : this.com.score;
    let loser_points = this.user.score < this.com.score ? this.user.score : this.com.score;

    if (this.gameMode === "solo_play" || this.gameMode === "double_play") {
      this.messageManager.showMessage(`${winner} Wins! Press 'R' to Restart or 'Esc' to finish`,);
      const csrfToken = getCSRFToken();

      if (this.abandonedGame === true) {
        return ;
      }

      fetch('/solo_play/save_match/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          winner: winner,
          loser: loser,
          winner_points: winner_points,
          loser_points: loser_points,
        })
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then(data => {
              throw new Error(data.message || 'An error occurred');
            });
          }
        })
        .then(data => {
          if (data.status === 'success') {
            console.log('Match saved successfully:', data);
          } else {
            console.error('Error saving match:', data.message);
          }
        })
        .catch(error => {
          if (error.message === 'User not authenticated') {
            console.log('User is not logged in, match not saved');
          } else {
            console.error('Unexpected error:', error);
          }
        });
      document.removeEventListener("keydown", this.handleKeyPress);
      document.removeEventListener("keydown", this.handleKeyPress.bind(this));
      document.addEventListener("keydown", this.handleKeyPress.bind(this), { once: false });
    }

    if (this.gameMode === "all_vs_all" || this.gameMode === "knockout") {
      this.messageManager.showMessage(`${winner} Wins! Press 'N' for Next Match`, "#FFFFFF", "rgba(0, 0, 0, 0.5)");
      const handleKeyN = (evt) => {
        if ((evt.code === "KeyN") && this.isGameOver === true) {
          document.removeEventListener("keydown", handleKeyN);
          this.messageManager.hideMessage();
          if (onNextMatch) onNextMatch();
        }
      };
      document.addEventListener("keydown", handleKeyN);
    }

    if (onFinish) {
      onFinish(winner);
    }
  }

  gameLoop() {
    if (!this.isGameOver) {
      this.update();
      this.render();
    } else {
      this.message.render();
    }

    if (!this.isGameOver) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  resetGame(evt) {
    document.removeEventListener("keydown", this.handleKeydown);
    if (evt.code === "KeyR") {
      this.isGameOver = false;
      this.user.score = 0;
      this.com.score = 0;
      this.winnerMessage = null;
      this.gameStarted = false;
      this.user.y = this.canvas.height / 2 / this.dpr - this.user.height / 2; //(necesario?)
      this.resetBall();
      this.init();
    }
  }

  loadHomePage() {
	if (window.location.pathname == '/')
	  return ;
    fetch("/")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("main").innerHTML = html;
        history.pushState({}, "", "/");
      })
      .catch((error) =>
        console.error("Error al cargar la página de inicio:", error),
      );
  }
}

function getCSRFToken() {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return csrfToken || ''; // Return the token or empty string if not found
}

const csrfToken = getCSRFToken();
