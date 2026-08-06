import { expect } from "chai";
import { ethers } from "hardhat";
import { ShadowRunnerLeaderboard } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ShadowRunnerLeaderboard", function () {
  let leaderboard: ShadowRunnerLeaderboard;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let player3: SignerWithAddress;

  const gameVersion = "0.1.0";

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    const ShadowRunnerLeaderboard = await ethers.getContractFactory("ShadowRunnerLeaderboard");
    leaderboard = await ShadowRunnerLeaderboard.deploy(gameVersion);
    await leaderboard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await leaderboard.owner()).to.equal(owner.address);
    });

    it("Should set the correct game version", async function () {
      expect(await leaderboard.gameVersion()).to.equal(gameVersion);
    });

    it("Should set the correct minimum score", async function () {
      expect(await leaderboard.minimumScore()).to.equal(100);
    });

    it("Should not be paused initially", async function () {
      expect(await leaderboard.paused()).to.equal(false);
    });
  });

  describe("Score Submission", function () {
    it("Should submit a score successfully", async function () {
      const score = 1000;
      const coins = 50;
      const sessionId = ethers.id("session1");

      await expect(leaderboard.connect(player1).submitScore(score, coins, sessionId))
        .to.emit(leaderboard, "ScoreSubmitted")
        .withArgs(player1.address, score, coins, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1), sessionId);
    });

    it("Should update player stats after submission", async function () {
      const score = 1500;
      const coins = 75;
      const sessionId = ethers.id("session2");

      await leaderboard.connect(player1).submitScore(score, coins, sessionId);

      const stats = await leaderboard.getPlayerStats(player1.address);
      expect(stats.highScore).to.equal(score);
      expect(stats.totalGames).to.equal(1);
      expect(stats.totalCoins).to.equal(coins);
    });

    it("Should emit NewHighScore event on new high score", async function () {
      const sessionId1 = ethers.id("session3");
      const sessionId2 = ethers.id("session4");

      await leaderboard.connect(player1).submitScore(1000, 50, sessionId1);
      
      await expect(leaderboard.connect(player1).submitScore(2000, 100, sessionId2))
        .to.emit(leaderboard, "NewHighScore")
        .withArgs(player1.address, 2000, 1000);
    });

    it("Should prevent duplicate session submissions", async function () {
      const score = 1000;
      const coins = 50;
      const sessionId = ethers.id("session5");

      await leaderboard.connect(player1).submitScore(score, coins, sessionId);
      
      await expect(
        leaderboard.connect(player1).submitScore(score, coins, sessionId)
      ).to.be.revertedWith("Session already submitted");
    });

    it("Should reject zero score", async function () {
      const sessionId = ethers.id("session6");
      await expect(
        leaderboard.connect(player1).submitScore(0, 50, sessionId)
      ).to.be.revertedWith("Score must be greater than 0");
    });

    it("Should reject zero coins", async function () {
      const sessionId = ethers.id("session7");
      await expect(
        leaderboard.connect(player1).submitScore(1000, 0, sessionId)
      ).to.be.revertedWith("Coins must be greater than 0");
    });
  });

  describe("Leaderboard Management", function () {
    beforeEach(async function () {
      // Submit multiple scores
      await leaderboard.connect(player1).submitScore(1000, 50, ethers.id("s1"));
      await leaderboard.connect(player2).submitScore(2000, 100, ethers.id("s2"));
      await leaderboard.connect(player3).submitScore(1500, 75, ethers.id("s3"));
    });

    it("Should maintain leaderboard in descending order", async function () {
      const leaderboardData = await leaderboard.getGlobalLeaderboard(0, 3);
      
      expect(leaderboardData[0].score).to.equal(2000);
      expect(leaderboardData[1].score).to.equal(1500);
      expect(leaderboardData[2].score).to.equal(1000);
    });

    it("Should return correct leaderboard size", async function () {
      const size = await leaderboard.getGlobalLeaderboardSize();
      expect(size).to.equal(3);
    });

    it("Should return correct player rank", async function () {
      const rank1 = await leaderboard.getPlayerRank(player2.address);
      const rank2 = await leaderboard.getPlayerRank(player3.address);
      const rank3 = await leaderboard.getPlayerRank(player1.address);

      expect(rank1).to.equal(1);
      expect(rank2).to.equal(2);
      expect(rank3).to.equal(3);
    });

    it("Should handle pagination correctly", async function () {
      const page1 = await leaderboard.getGlobalLeaderboard(0, 2);
      const page2 = await leaderboard.getGlobalLeaderboard(2, 2);

      expect(page1.length).to.equal(2);
      expect(page2.length).to.equal(1);
      expect(page1[0].score).to.equal(2000);
      expect(page2[0].score).to.equal(1000);
    });
  });

  describe("Player Stats", function () {
    it("Should track multiple games correctly", async function () {
      await leaderboard.connect(player1).submitScore(1000, 50, ethers.id("g1"));
      await leaderboard.connect(player1).submitScore(1500, 75, ethers.id("g2"));
      await leaderboard.connect(player1).submitScore(1200, 60, ethers.id("g3"));

      const stats = await leaderboard.getPlayerStats(player1.address);
      expect(stats.highScore).to.equal(1500);
      expect(stats.totalGames).to.equal(3);
      expect(stats.totalCoins).to.equal(185); // 50 + 75 + 60
    });

    it("Should return score history", async function () {
      await leaderboard.connect(player1).submitScore(1000, 50, ethers.id("h1"));
      await leaderboard.connect(player1).submitScore(1500, 75, ethers.id("h2"));

      const history = await leaderboard.getPlayerScores(player1.address, 0, 10);
      expect(history.length).to.equal(2);
      expect(history[0].score).to.equal(1000);
      expect(history[1].score).to.equal(1500);
    });
  });

  describe("Daily Leaderboard", function () {
    it("Should add scores to daily leaderboard", async function () {
      await leaderboard.connect(player1).submitScore(1000, 50, ethers.id("d1"));
      await leaderboard.connect(player2).submitScore(2000, 100, ethers.id("d2"));

      const dailySize = await leaderboard.getDailyLeaderboardSize();
      expect(dailySize).to.equal(2);

      const dailyLeaderboard = await leaderboard.getDailyLeaderboard(0, 10);
      expect(dailyLeaderboard.length).to.equal(2);
      expect(dailyLeaderboard[0].score).to.equal(2000);
    });

    it("Should return current day number", async function () {
      const currentDay = await leaderboard.getCurrentDay();
      const expectedDay = Math.floor(Date.now() / 1000 / 86400);
      expect(currentDay).to.be.closeTo(expectedDay, 1);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update minimum score", async function () {
      await leaderboard.setMinimumScore(500);
      expect(await leaderboard.minimumScore()).to.equal(500);
    });

    it("Should prevent non-owner from updating minimum score", async function () {
      await expect(
        leaderboard.connect(player1).setMinimumScore(500)
      ).to.be.reverted;
    });

    it("Should allow owner to update game version", async function () {
      const newVersion = "0.2.0";
      await leaderboard.setGameVersion(newVersion);
      expect(await leaderboard.gameVersion()).to.equal(newVersion);
    });

    it("Should allow owner to pause contract", async function () {
      await leaderboard.pause();
      expect(await leaderboard.paused()).to.equal(true);

      await expect(
        leaderboard.connect(player1).submitScore(1000, 50, ethers.id("paused"))
      ).to.be.revertedWithCustomError(leaderboard, "EnforcedPause");
    });

    it("Should allow owner to unpause contract", async function () {
      await leaderboard.pause();
      await leaderboard.unpause();
      expect(await leaderboard.paused()).to.equal(false);

      await expect(
        leaderboard.connect(player1).submitScore(1000, 50, ethers.id("unpaused"))
      ).to.not.be.reverted;
    });

    it("Should allow owner to remove fraudulent scores", async function () {
      const sessionId = ethers.id("fraud");
      await leaderboard.connect(player1).submitScore(10000, 500, sessionId);
      
      const sizeBefore = await leaderboard.getGlobalLeaderboardSize();
      await leaderboard.removeScore(player1.address, sessionId);
      const sizeAfter = await leaderboard.getGlobalLeaderboardSize();

      expect(sizeAfter).to.equal(sizeBefore - 1n);
    });
  });

  describe("Gas Optimization", function () {
    it("Should handle max leaderboard size efficiently", async function () {
      // Submit scores up to max size
      for (let i = 0; i < 10; i++) {
        const sessionId = ethers.id(`max-test-${i}`);
        await leaderboard.connect(player1).submitScore(1000 + i, 50, sessionId);
      }

      const size = await leaderboard.getGlobalLeaderboardSize();
      expect(size).to.be.lte(await leaderboard.MAX_LEADERBOARD_SIZE());
    });
  });
});
