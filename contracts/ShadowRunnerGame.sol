// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ShadowRunnerGame
 * @notice Minimal on-chain game session management for Hemi Shadow Runner
 * @dev Optimized for low gas usage with struct packing and minimal storage
 */
contract ShadowRunnerGame {
    
    // ============================================
    // STRUCTS
    // ============================================
    
    /**
     * @dev GameSession packed into single storage slot (31 bytes)
     * @param player Address of session owner (20 bytes)
     * @param gameSeed Deterministic RNG seed (4 bytes)
     * @param startBlock Block number when session started (4 bytes)
     * @param finalScore Score achieved (2 bytes, max 65,535)
     * @param finished Whether score has been submitted (1 byte)
     */
    struct GameSession {
        address player;      // 20 bytes
        uint32 gameSeed;     // 4 bytes
        uint32 startBlock;   // 4 bytes
        uint16 finalScore;   // 2 bytes
        bool finished;       // 1 byte
    }
    
    /**
     * @dev PlayerStats packed into single storage slot (4 bytes)
     * @param bestScore Highest score achieved (2 bytes)
     * @param gamesPlayed Total games completed (2 bytes)
     */
    struct PlayerStats {
        uint16 bestScore;    // 2 bytes
        uint16 gamesPlayed;  // 2 bytes
    }
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Mapping from sessionId to GameSession data
    mapping(uint256 => GameSession) public sessions;
    
    /// @notice Mapping from player address to their stats
    mapping(address => PlayerStats) public playerStats;
    
    /// @notice Counter for generating unique session IDs
    uint256 public nextSessionId;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /// @notice Emitted when a new game session starts
    event GameStarted(
        uint256 indexed sessionId,
        address indexed player,
        uint32 gameSeed,
        uint32 startBlock
    );
    
    /// @notice Emitted when a game session ends with score submission
    event GameFinished(
        uint256 indexed sessionId,
        address indexed player,
        uint16 score,
        uint16 gamesPlayed
    );
    
    /// @notice Emitted when player achieves new personal best
    event NewHighScore(
        address indexed player,
        uint16 newBestScore,
        uint16 previousBestScore
    );
    
    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @notice Start a new game session with on-chain generated seed
     * @dev Creates new session, generates deterministic seed, emits event
     * @return sessionId Unique identifier for this game session
     * @return gameSeed Deterministic seed for game RNG (uint32)
     */
    function startGame() external returns (uint256 sessionId, uint32 gameSeed) {
        // Increment session counter
        sessionId = nextSessionId++;
        
        // Generate deterministic seed from block data
        gameSeed = uint32(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        msg.sender,
                        sessionId
                    )
                )
            )
        );
        
        // Create new session
        sessions[sessionId] = GameSession({
            player: msg.sender,
            gameSeed: gameSeed,
            startBlock: uint32(block.number),
            finalScore: 0,
            finished: false
        });
        
        emit GameStarted(sessionId, msg.sender, gameSeed, uint32(block.number));
        
        return (sessionId, gameSeed);
    }
    
    /**
     * @notice Submit final score for a completed game session
     * @dev Validates session, marks as finished, updates player stats
     * @param sessionId The session to finalize
     * @param score Final score achieved (max 65,535)
     */
    function submitScore(uint256 sessionId, uint16 score) external {
        GameSession storage session = sessions[sessionId];
        
        // Validate session
        require(session.player != address(0), "Invalid session");
        require(session.player == msg.sender, "Not your session");
        require(!session.finished, "Already finished");
        require(score > 0, "Invalid score");
        
        // Mark session as finished
        session.finished = true;
        session.finalScore = score;
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.gamesPlayed++;
        
        // Check for new high score
        if (score > stats.bestScore) {
            uint16 previousBest = stats.bestScore;
            stats.bestScore = score;
            emit NewHighScore(msg.sender, score, previousBest);
        }
        
        emit GameFinished(sessionId, msg.sender, score, stats.gamesPlayed);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get complete session data
     * @param sessionId Session to query
     * @return Session data struct
     */
    function getSession(uint256 sessionId) external view returns (GameSession memory) {
        return sessions[sessionId];
    }
    
    /**
     * @notice Get player statistics
     * @param player Address to query
     * @return Player stats struct
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    /**
     * @notice Check if session is still active (can submit score)
     * @param sessionId Session to check
     * @return True if session exists and not finished
     */
    function isSessionActive(uint256 sessionId) external view returns (bool) {
        GameSession memory session = sessions[sessionId];
        return session.player != address(0) && !session.finished;
    }
}
