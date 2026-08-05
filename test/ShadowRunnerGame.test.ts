import { expect } from "chai";
import { ethers } from "hardhat";
import { ShadowRunnerGame } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ShadowRunnerGame", function () {
  let game: ShadowRunnerGame;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const ShadowRunnerGame = await ethers.getContractFactory("ShadowRunnerGame");
    game = await ShadowRunnerGame.deploy();
    await game.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with nextSessionId = 0", async function () {
      expect(await game.nextSessionId()).to.equal(0);
    });
  });

  describe("Starting Game", function () {
    it("Should start a game and return sessionId + gameSeed", async function () {
      const tx = await game.connect(player1).startGame();
      const receipt = await tx.wait();
      
      // Check return values
      const result = await game.connect(player1).startGame.staticCall();
      expect(result.sessionId).to.equal(1); // Second call would be ID 1
      expect(result.gameSeed).to.be.greaterThan(0);
    });

    it("Should increment sessionId for each game", async function () {
      await game.connect(player1).startGame();
      await game.connect(player1).startGame();
      await game.connect(player2).startGame();
      
      expect(await game.nextSessionId()).to.equal(3);
    });

    it("Should emit GameStarted event", async function () {
      await expect(game.connect(player1).startGame())
        .to.emit(game, "GameStarted");
    });

    it("Should create unique seeds for different sessions", async function () {
      const result1 = await game.connect(player1).startGame.staticCall();
      await game.connect(player1).startGame();
      
      const result2 = await game.connect(player1).startGame.staticCall();
      
      // Seeds should be different (high probability)
      expect(result1.gameSeed).to.not.equal(result2.gameSeed);
    });

    it("Should store session data correctly", async function () {
      const tx = await game.connect(player1).startGame();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      
      const session = await game.getSession(0);
      
      expect(session.player).to.equal(player1.address);
      expect(session.gameSeed).to.be.greaterThan(0);
      expect(session.startBlock).to.equal(block!.number);
      expect(session.finalScore).to.equal(0);
      expect(session.finished).to.equal(false);
    });
  });

  describe("Submitting Score", function () {
    let sessionId: bigint;

    beforeEach(async function () {
      const result = await game.connect(player1).startGame();
      await result.wait();
      sessionId = 0n; // First session is always 0
    });

    it("Should submit score successfully", async function () {
      await expect(game.connect(player1).submitScore(sessionId, 1234))
        .to.emit(game, "GameFinished")
        .withArgs(sessionId, player1.address, 1234, 1);
    });

    it("Should update session as finished", async function () {
      await game.connect(player1).submitScore(sessionId, 1234);
      
      const session = await game.getSession(sessionId);
      expect(session.finished).to.equal(true);
      expect(session.finalScore).to.equal(1234);
    });

    it("Should update player stats", async function () {
      await game.connect(player1).submitScore(sessionId, 1234);
      
      const stats = await game.getPlayerStats(player1.address);
      expect(stats.gamesPlayed).to.equal(1);
      expect(stats.bestScore).to.equal(1234);
    });

    it("Should increment gamesPlayed for multiple games", async function () {
      await game.connect(player1).submitScore(sessionId, 1000);
      
      await game.connect(player1).startGame();
      await game.connect(player1).submitScore(1, 2000);
      
      await game.connect(player1).startGame();
      await game.connect(player1).submitScore(2, 1500);
      
      const stats = await game.getPlayerStats(player1.address);
      expect(stats.gamesPlayed).to.equal(3);
    });

    it("Should update bestScore only when higher", async function () {
      await game.connect(player1).submitScore(sessionId, 2000);
      
      await game.connect(player1).startGame();
      await game.connect(player1).submitScore(1, 1000); // Lower score
      
      const stats = await game.getPlayerStats(player1.address);
      expect(stats.bestScore).to.equal(2000); // Unchanged
      expect(stats.gamesPlayed).to.equal(2);
    });

    it("Should emit NewHighScore event on new best", async function () {
      await game.connect(player1).submitScore(sessionId, 1000);
      
      await game.connect(player1).startGame();
      await expect(game.connect(player1).submitScore(1, 2000))
        .to.emit(game, "NewHighScore")
        .withArgs(player1.address, 2000, 1000);
    });

    it("Should NOT emit NewHighScore when score is lower", async function () {
      await game.connect(player1).submitScore(sessionId, 2000);
      
      await game.connect(player1).startGame();
      await expect(game.connect(player1).submitScore(1, 1000))
        .to.not.emit(game, "NewHighScore");
    });

    it("Should revert if session doesn't exist", async function () {
      await expect(
        game.connect(player1).submitScore(999, 1000)
      ).to.be.revertedWith("Invalid session");
    });

    it("Should revert if not session owner", async function () {
      await expect(
        game.connect(player2).submitScore(sessionId, 1000)
      ).to.be.revertedWith("Not your session");
    });

    it("Should revert if already finished", async function () {
      await game.connect(player1).submitScore(sessionId, 1000);
      
      await expect(
        game.connect(player1).submitScore(sessionId, 2000)
      ).to.be.revertedWith("Already finished");
    });

    it("Should revert if score is zero", async function () {
      await expect(
        game.connect(player1).submitScore(sessionId, 0)
      ).to.be.revertedWith("Invalid score");
    });
  });

  describe("View Functions", function () {
    it("Should return correct session data", async function () {
      await game.connect(player1).startGame();
      const session = await game.getSession(0);
      
      expect(session.player).to.equal(player1.address);
      expect(session.finished).to.equal(false);
    });

    it("Should return correct player stats", async function () {
      await game.connect(player1).startGame();
      await game.connect(player1).submitScore(0, 1234);
      
      const stats = await game.getPlayerStats(player1.address);
      expect(stats.bestScore).to.equal(1234);
      expect(stats.gamesPlayed).to.equal(1);
    });

    it("Should return zero stats for new player", async function () {
      const stats = await game.getPlayerStats(player2.address);
      expect(stats.bestScore).to.equal(0);
      expect(stats.gamesPlayed).to.equal(0);
    });

    it("Should correctly report session active status", async function () {
      await game.connect(player1).startGame();
      
      expect(await game.isSessionActive(0)).to.equal(true);
      
      await game.connect(player1).submitScore(0, 1000);
      
      expect(await game.isSessionActive(0)).to.equal(false);
    });

    it("Should return false for non-existent session", async function () {
      expect(await game.isSessionActive(999)).to.equal(false);
    });
  });

  describe("Multiple Players", function () {
    it("Should handle multiple players independently", async function () {
      // Player 1 plays
      await game.connect(player1).startGame();
      await game.connect(player1).submitScore(0, 1500);
      
      // Player 2 plays
      await game.connect(player2).startGame();
      await game.connect(player2).submitScore(1, 2500);
      
      const stats1 = await game.getPlayerStats(player1.address);
      const stats2 = await game.getPlayerStats(player2.address);
      
      expect(stats1.bestScore).to.equal(1500);
      expect(stats2.bestScore).to.equal(2500);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint16 score (65535)", async function () {
      await game.connect(player1).startGame();
      await game.connect(player1).submitScore(0, 65535);
      
      const stats = await game.getPlayerStats(player1.address);
      expect(stats.bestScore).to.equal(65535);
    });

    it("Should handle many games from single player", async function () {
      for (let i = 0; i < 10; i++) {
        await game.connect(player1).startGame();
        await game.connect(player1).submitScore(i, 1000 + i);
      }
      
      const stats = await game.getPlayerStats(player1.address);
      expect(stats.gamesPlayed).to.equal(10);
      expect(stats.bestScore).to.equal(1009);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for startGame", async function () {
      const tx = await game.connect(player1).startGame();
      const receipt = await tx.wait();
      
      // Should be under 100k gas
      expect(receipt!.gasUsed).to.be.lessThan(100000);
      console.log("       startGame gas:", receipt!.gasUsed.toString());
    });

    it("Should use reasonable gas for submitScore", async function () {
      await game.connect(player1).startGame();
      const tx = await game.connect(player1).submitScore(0, 1234);
      const receipt = await tx.wait();
      
      // Should be under 100k gas
      expect(receipt!.gasUsed).to.be.lessThan(100000);
      console.log("       submitScore gas:", receipt!.gasUsed.toString());
    });
  });
});
