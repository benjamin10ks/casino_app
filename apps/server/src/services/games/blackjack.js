import BaseGame from "./baseGame.js";
import { BadRequestError } from "../../utils/errors.js";

class BlackjackGame extends BaseGame {
  createInitialState(gameConfig) {
    return {
      deck: [],
      dealer: {
        hand: [],
        value: 0,
        isStanding: false,
      },
      players: {},
      currentPlayerIndex: 0,
      roundActive: false,
    };
  }

  async onPlayerJoined(gameState, userId, position) {
    gameState.players[userId] = {
      position,
      hand: [],
      value: 0,
      bet: 0,
      betId: null,
      status: "waiting", // waiting, playing, stood, busted
      hasBet: false,
    };
    return gameState;
  }

  async onPlayerLeft(gameState, userId) {
    delete gameState.players[userId];
    return gameState;
  }

  getPlayerView(gameState, userId) {
    const view = { ...gameState };

    if (view.roundActive && view.dealer.hand.length > 0) {
      view.dealer = {
        ...view.dealer,
        hand: [view.dealer.hand[0], { hidden: true }],
        value: null,
      };
    }
    return view;
  }

  validateBet(gameState, userId, betData) {
    const player = gameState.players[userId];

    if (!player) {
      throw new BadRequestError("Player not found in game");
    }

    if (player.hasBet) {
      throw new BadRequestError("Player has already placed a bet");
    }

    if (gameState.roundActive) {
      throw new BadRequestError("Cannot place bets during an active round");
    }

    return true;
  }

  async onBetPlaced(gameState, userId, betId, betData) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] onBetPlaced called for user ${userId} betId ${betId} amount ${betData?.amount}`);

    const player = gameState.players[userId];
    if (!player) {
      console.log(`[${ts}] onBetPlaced: player ${userId} not found in gameState.players`);
      return gameState;
    }

    player.bet = betData.amount;
    player.betId = betId;
    player.hasBet = true;
    player.status = "waiting";

    const playersList = Object.entries(gameState.players).map(([id, p]) => ({ id, hasBet: !!p.hasBet, bet: p.bet, betId: p.betId, status: p.status }));
    console.log(`[${ts}] onBetPlaced: players after placing bet:`, playersList);

    const allPlayersReady = Object.values(gameState.players).every(
      (player) => player.hasBet,
    );

    console.log(`[${ts}] onBetPlaced: allPlayersReady=${allPlayersReady} playerCount=${Object.keys(gameState.players).length}`);

    if (allPlayersReady && Object.keys(gameState.players).length > 0) {
      console.log(`[${ts}] onBetPlaced: all players ready, dealing initial cards`);
      // start the round by dealing initial cards
      gameState = await this.dealInitialCards(gameState);
      console.log(`[${ts}] onBetPlaced: dealInitialCards completed; roundActive=${gameState.roundActive}`);
    }
    return gameState;
  }

  async dealInitialCards(gameState) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] dealInitialCards: starting; playerCount=${Object.keys(gameState.players).length}`);

    gameState.deck = this.createDeck();
    gameState.deck = this.shuffleDeck(gameState.deck);

    for (const userId in gameState.players) {
      const player = gameState.players[userId];
      player.hand = [
        this.drawCard(gameState.deck),
        this.drawCard(gameState.deck),
      ];

      player.value = this.calculateHandValue(player.hand);
      player.status = "playing";

      if (player.value === 21) {
        player.status = "blackjack";
      }
    }

    gameState.dealer.hand = [
      this.drawCard(gameState.deck),
      this.drawCard(gameState.deck),
    ];

    gameState.dealer.value = this.calculateHandValue(gameState.dealer.hand);

    gameState.roundActive = true;
    gameState.currentPlayerIndex = 0;

    console.log(`[${ts}] dealInitialCards: completed; dealerHandCount=${gameState.dealer.hand.length}`);
    return gameState;
  }

  async processAction(gameState, userId, action, actionData) {
    const player = gameState.players[userId];

    if (!player) {
      throw new BadRequestError("Player not found in game");
    }

    if (player.status !== "playing") {
      throw new BadRequestError("Player cannot act in current state");
    }

    let resolutions = [];

    switch (action) {
      case "hit":
        player.hand.push(this.drawCard(gameState.deck));
        player.value = this.calculateHandValue(player.hand);

        if (player.value > 21) {
          player.status = "busted";
          resolutions.push({
            betId: player.betId,
            outcome: {
              status: "lose",
              payout: 0,
              multiplier: 0,
            },
          });
        }
        break;
      case "stand":
        player.status = "waiting";
        break;
      case "double":
        if (player.hand.length !== 2) {
          throw new BadRequestError("Can only double on first two cards");
        }
        player.hand.push(this.drawCard(gameState.deck));
        player.value = this.calculateHandValue(player.hand);
        player.status = player.value > 21 ? "busted" : "waiting";
        break;
      case "split":
        if (
          player.hand.length !== 2 ||
          player.hand[0].rank !== player.hand[1].rank
        ) {
          throw new BadRequestError(
            "Can only split with two cards of the same rank",
          );
        }
        break;
      default:
        throw new BadRequestError("Invalid action");
    }

    const allPlayersDone = Object.values(gameState.players).every(
      (player) => player.status !== "playing",
    );

    if (allPlayersDone) {
      gameState = await this.dealerTurn(gameState);

      resolutions = resolutions.concat(await this.resolveBets(gameState));

      gameState.roundActive = false;
    }

    return {
      gameState,
      playerResult: {
        hand: player.hand,
        value: player.value,
        status: player.status,
      },
      resolutions,
    };
  }

  async dealerTurn(gameState) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] dealerTurn: starting; dealerValue=${gameState.dealer.value} dealerHandLength=${gameState.dealer.hand.length}`);
    while (gameState.dealer.value < 17) {
      const card = this.drawCard(gameState.deck);
      console.log(`[${ts}] dealerTurn: drawing card ${card.rank}${card.suit}`);
      gameState.dealer.hand.push(card);
      gameState.dealer.value = this.calculateHandValue(gameState.dealer.hand);
      console.log(`[${ts}] dealerTurn: new dealerValue=${gameState.dealer.value}`);
    }

    gameState.dealer.isStanding = true;
    console.log(`[${ts}] dealerTurn: completed; dealerValue=${gameState.dealer.value} isStanding=${gameState.dealer.isStanding}`);

    return gameState;
  }

  async resolveBets(gameState) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] resolveBets: dealerValue=${gameState.dealer.value} dealerHandLength=${gameState.dealer.hand.length}`);
    const resolutions = [];
    const dealerValue = gameState.dealer.value;
    const dealerBusted = dealerValue > 21;

    for (const userId in gameState.players) {
      const player = gameState.players[userId];

      if (player.status === "busted") {
        console.log(`[${ts}] resolveBets: player ${userId} busted, skipping`);
        continue;
      }

      let outcome;

      if (player.status === "blackjack") {
        if (dealerValue === 21 && gameState.dealer.hand.length === 2) {
          outcome = { status: "push", payout: player.bet, multiplier: 1.0 };
        } else {
          outcome = {
            status: "win",
            payout: player.bet * 2.5,
            multiplier: 2.5,
          };
        }
      } else if (dealerBusted) {
        outcome = { status: "win", payout: player.bet * 2, multiplier: 2.0 };
      } else if (player.value > dealerValue) {
        outcome = { status: "win", payout: player.bet * 2, multiplier: 2.0 };
      } else if (player.value === dealerValue) {
        outcome = { status: "push", payout: player.bet, multiplier: 1.0 };
      } else {
        outcome = { status: "lose", payout: 0, multiplier: 0 };
      }

      console.log(`[${ts}] resolveBets: player ${userId} outcome=`, outcome);
      resolutions.push({
        betId: player.betId,
        outcome,
      });
    }
    return resolutions;
  }

  async startNewRound(gameState) {
    for (const userId in gameState.players) {
      gameState.players[userId] = {
        ...gameState.players[userId],
        hand: [],
        value: 0,
        bet: 0,
        betId: null,
        status: "waiting",
        hasBet: false,
      };
    }

    gameState.dealer = {
      hand: [],
      value: 0,
      isStanding: false,
    };

    gameState.deck = [];
    gameState.roundActive = false;
    gameState.currentPlayerIndex = 0;

    return gameState;
  }

  createDeck() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    const deck = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  }

  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  drawCard(deck) {
    return deck.pop();
  }

  calculateHandValue(cards) {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      if (card.hidden) continue;

      if (card.rank === "A") {
        aces++;
        value += 11;
      } else if (["K", "Q", "J"].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank);
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
  }
}

export default new BlackjackGame();
