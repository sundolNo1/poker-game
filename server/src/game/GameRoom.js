const { createDeck, shuffle } = require('./deck');
const { getBestHand, compareHands } = require('./handEvaluator');

const DEFAULT_SMALL_BLIND = 1000;
const DEFAULT_BIG_BLIND = 2000;
const STARTING_CHIPS = 1000000;

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = [];
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.dealerIndex = -1;
    this.phase = 'waiting';
    this.deck = [];
    this.smallBlind = DEFAULT_SMALL_BLIND;
    this.bigBlind = DEFAULT_BIG_BLIND;
    this.minRaise = DEFAULT_BIG_BLIND;
    this.actingOrder = [];
    this.winners = [];
  }

  addPlayer(id, name) {
    if (this.players.length >= 6) return { error: '방이 꽉 찼습니다 (최대 6명)' };
    if (this.phase !== 'waiting') return { error: '게임이 진행 중입니다' };
    if (this.players.find(p => p.id === id)) return { error: '이미 참가했습니다' };
    this.players.push({ id, name, chips: STARTING_CHIPS, hand: [], totalBet: 0, folded: false, allIn: false });
    return { success: true };
  }

  removePlayer(id) {
    if (this.phase === 'waiting') {
      this.players = this.players.filter(p => p.id !== id);
    } else {
      const p = this.players.find(pl => pl.id === id);
      if (p) {
        p.folded = true;
        this.actingOrder = this.actingOrder.filter(pid => pid !== id);
        this._checkContinuation();
      }
    }
  }

  startGame(smallBlind, bigBlind) {
    if (this.players.length < 2) return { error: '최소 2명이 필요합니다' };
    if (this.phase !== 'waiting') return { error: '게임이 이미 시작됐습니다' };
    if (smallBlind) this.smallBlind = Number(smallBlind);
    if (bigBlind) this.bigBlind = Number(bigBlind);

    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.winners = [];
    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

    for (const p of this.players) {
      p.hand = [];
      p.totalBet = 0;
      p.folded = false;
      p.allIn = false;
    }

    this.deck = shuffle(createDeck());
    for (let i = 0; i < 2; i++) {
      for (const p of this.players) p.hand.push(this.deck.pop());
    }

    const n = this.players.length;
    const sbIdx = (this.dealerIndex + 1) % n;
    const bbIdx = (this.dealerIndex + 2) % n;
    this._postBlind(sbIdx, this.smallBlind);
    this._postBlind(bbIdx, this.bigBlind);

    this.currentBet = this.bigBlind;
    this.minRaise = this.bigBlind;
    this.phase = 'pre-flop';
    this.actingOrder = this._buildActingOrder('pre-flop');
    this._skipIfNoActors();
    return { success: true };
  }

  _postBlind(idx, amount) {
    const p = this.players[idx];
    const actual = Math.min(amount, p.chips);
    p.chips -= actual;
    p.totalBet += actual;
    this.pot += actual;
    if (p.chips === 0) p.allIn = true;
  }

  _buildActingOrder(phase) {
    const n = this.players.length;
    let startIdx;
    if (phase === 'pre-flop') {
      const bbIdx = (this.dealerIndex + 2) % n;
      startIdx = (bbIdx + 1) % n;
    } else {
      startIdx = (this.dealerIndex + 1) % n;
    }
    const order = [];
    let idx = startIdx;
    for (let i = 0; i < n; i++) {
      const p = this.players[idx];
      if (!p.folded && !p.allIn) order.push(p.id);
      idx = (idx + 1) % n;
    }
    return order;
  }

  _skipIfNoActors() {
    while (this.actingOrder.length === 0 && this.phase !== 'waiting' && this.phase !== 'showdown') {
      this._advancePhase();
    }
  }

  playerAction(playerId, action, amount) {
    if (!['pre-flop','flop','turn','river'].includes(this.phase)) return { error: '지금은 베팅 단계가 아닙니다' };
    if (!this.actingOrder.length || this.actingOrder[0] !== playerId) return { error: '당신의 차례가 아닙니다' };

    const player = this.players.find(p => p.id === playerId);
    if (!player) return { error: '플레이어를 찾을 수 없습니다' };

    this.actingOrder.shift();

    switch (action) {
      case 'fold':
        player.folded = true;
        this.actingOrder = this.actingOrder.filter(id => id !== playerId);
        break;

      case 'check':
        if (player.totalBet < this.currentBet) return { error: '체크할 수 없습니다' };
        break;

      case 'call': {
        const callAmt = Math.min(this.currentBet - player.totalBet, player.chips);
        player.chips -= callAmt;
        player.totalBet += callAmt;
        this.pot += callAmt;
        if (player.chips === 0) player.allIn = true;
        break;
      }

      case 'raise': {
        const callAmt = this.currentBet - player.totalBet;
        const raiseAmt = Number(amount);
        const totalNeeded = callAmt + raiseAmt;
        const actual = Math.min(totalNeeded, player.chips);
        player.chips -= actual;
        player.totalBet += actual;
        this.pot += actual;
        this.minRaise = Math.max(player.totalBet - this.currentBet, this.bigBlind);
        this.currentBet = player.totalBet;
        if (player.chips === 0) player.allIn = true;
        for (const p of this.players) {
          if (p.id !== playerId && !p.folded && !p.allIn && !this.actingOrder.includes(p.id)) {
            this.actingOrder.push(p.id);
          }
        }
        break;
      }

      default:
        return { error: '알 수 없는 액션' };
    }

    this.actingOrder = this.actingOrder.filter(id => {
      const p = this.players.find(pl => pl.id === id);
      return p && !p.folded && !p.allIn;
    });

    this._checkContinuation();
    return { success: true };
  }

  _checkContinuation() {
    const nonFolded = this.players.filter(p => !p.folded);
    if (nonFolded.length === 1) {
      const winner = nonFolded[0];
      winner.chips += this.pot;
      this.winners = [{ playerId: winner.id, playerName: winner.name, hand: null, pot: this.pot }];
      this.pot = 0;
      this.phase = 'showdown';
    } else if (this.actingOrder.length === 0 && !['waiting','showdown'].includes(this.phase)) {
      this._advancePhase();
    }
  }

  _advancePhase() {
    for (const p of this.players) p.totalBet = 0;
    this.currentBet = 0;
    this.minRaise = this.bigBlind;

    switch (this.phase) {
      case 'pre-flop':
        this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
        this.phase = 'flop';
        break;
      case 'flop':
        this.communityCards.push(this.deck.pop());
        this.phase = 'turn';
        break;
      case 'turn':
        this.communityCards.push(this.deck.pop());
        this.phase = 'river';
        break;
      case 'river':
        this._showdown();
        return;
    }

    this.actingOrder = this._buildActingOrder(this.phase);
    this._skipIfNoActors();
  }

  _showdown() {
    this.phase = 'showdown';
    const active = this.players.filter(p => !p.folded);

    const results = active.map(p => ({
      player: p,
      handResult: getBestHand([...p.hand, ...this.communityCards]),
    })).sort((a, b) => compareHands(b.handResult, a.handResult));

    const best = results[0].handResult;
    const tied = results.filter(r => compareHands(r.handResult, best) === 0);
    const share = Math.floor(this.pot / tied.length);
    const rem = this.pot - share * tied.length;

    this.winners = tied.map((w, i) => {
      const winAmt = share + (i === 0 ? rem : 0);
      w.player.chips += winAmt;
      return { playerId: w.player.id, playerName: w.player.name, hand: w.handResult, pot: winAmt };
    });
    this.pot = 0;
  }

  nextRound() {
    this.players = this.players.filter(p => p.chips > 0);
    this.phase = 'waiting';
  }

  getState(forPlayerId) {
    return {
      roomId: this.roomId,
      phase: this.phase,
      pot: this.pot,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      communityCards: this.communityCards,
      currentActorId: this.actingOrder[0] || null,
      dealerIndex: this.dealerIndex,
      winners: this.winners,
      players: this.players.map((p, i) => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        totalBet: p.totalBet,
        folded: p.folded,
        allIn: p.allIn,
        isDealer: i === this.dealerIndex,
        isCurrentActor: this.actingOrder[0] === p.id,
        hand: (p.id === forPlayerId || this.phase === 'showdown')
          ? p.hand
          : p.hand.map(() => ({ hidden: true })),
      })),
    };
  }
}

module.exports = GameRoom;
