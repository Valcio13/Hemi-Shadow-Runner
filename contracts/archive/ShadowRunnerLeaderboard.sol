// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ShadowRunnerLeaderboard
 * @notice On-chain leaderboard for Hemi Shadow Runner game scores
 * @dev Stores player scores with timestamp and coin count for verification
 */
contract ShadowRunnerLeaderboard is Ownable, ReentrancyGuard, Pausable {
    
    // ============ Structs ============
    
    struct Score {
        address player;
        uint256 score;
        uint256 coins;
        uint256 timestamp;
        bytes32 gameSessionId; // Unique identifier for each game session
    }
    
    struct PlayerStats {
        uint256 highScore;
        uint256 totalGames;
        uint256 totalCoins;
        uint256 lastPlayedAt;
    }
    
    // ============ State Variables ============
    
    // Mapping from player address to their stats
    mapping(address => PlayerStats) public playerStats;
    
    // Mapping from player address to array of their scores
    mapping(address => Score[]) private playerScores;
    
    // Global leaderboard: top N scores
    Score[] private globalLeaderboard;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;
    
    // Daily leaderboard: resets every day
    mapping(uint256 => Score[]) private dailyLeaderboards;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // Prevent duplicate submissions
    mapping(bytes32 => bool) private submittedSessions;
    
    // Game version for compatibility tracking
    string public gameVersion;
    
    // Minimum score to appear on leaderboard
    uint256 public minimumScore = 100;
    
    // ============ Events ============
    
    event ScoreSubmitted(
        address indexed player,
        uint256 score,
        uint256 coins,
        uint256 timestamp,
        bytes32 gameSessionId
    );
    
    event NewHighScore(
        address indexed player,
        uint256 newHighScore,
        uint256 previousHighScore
    );
    
    event LeaderboardUpdated(
        address indexed player,
        uint256 rank,
        uint256 score
    );
    
    event MinimumScoreUpdated(uint256 oldMinimum, uint256 newMinimum);
    
    event GameVersionUpdated(string oldVersion, string newVersion);
    
    // ============ Constructor ============
    
    constructor(string memory _initialVersion) Ownable(msg.sender) {
        gameVersion = _initialVersion;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Submit a score to the leaderboard
     * @param _score The player's score
     * @param _coins Number of coins collected
     * @param _gameSessionId Unique identifier for this game session
     */
    function submitScore(
        uint256 _score,
        uint256 _coins,
        bytes32 _gameSessionId
    ) external nonReentrant whenNotPaused {
        require(_score > 0, "Score must be greater than 0");
        require(_coins > 0, "Coins must be greater than 0");
        require(!submittedSessions[_gameSessionId], "Session already submitted");
        
        // Mark session as submitted to prevent duplicates
        submittedSessions[_gameSessionId] = true;
        
        // Create score entry
        Score memory newScore = Score({
            player: msg.sender,
            score: _score,
            coins: _coins,
            timestamp: block.timestamp,
            gameSessionId: _gameSessionId
        });
        
        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        uint256 previousHighScore = stats.highScore;
        
        stats.totalGames++;
        stats.totalCoins += _coins;
        stats.lastPlayedAt = block.timestamp;
        
        if (_score > stats.highScore) {
            stats.highScore = _score;
            emit NewHighScore(msg.sender, _score, previousHighScore);
        }
        
        // Store score in player's history
        playerScores[msg.sender].push(newScore);
        
        // Update global leaderboard if score qualifies
        if (_score >= minimumScore) {
            _updateGlobalLeaderboard(newScore);
        }
        
        // Update daily leaderboard
        _updateDailyLeaderboard(newScore);
        
        emit ScoreSubmitted(msg.sender, _score, _coins, block.timestamp, _gameSessionId);
    }
    
    /**
     * @notice Submit a score with signature verification
     * @param _score The player's score
     * @param _coins Number of coins collected
     * @param _gameSessionId Unique identifier for this game session
     * @param _signature Signature from off-chain attestation
     */
    function submitScoreWithSignature(
        uint256 _score,
        uint256 _coins,
        bytes32 _gameSessionId,
        bytes memory _signature
    ) external nonReentrant whenNotPaused {
        require(_score > 0, "Score must be greater than 0");
        require(!submittedSessions[_gameSessionId], "Session already submitted");
        
        // Verify signature matches the sender
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            _score,
            _coins,
            _gameSessionId
        ));
        bytes32 ethSignedMessageHash = _getEthSignedMessageHash(messageHash);
        require(_recoverSigner(ethSignedMessageHash, _signature) == msg.sender, "Invalid signature");
        
        // Call the main submit function
        this.submitScore(_score, _coins, _gameSessionId);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get the global leaderboard
     * @param _offset Starting index
     * @param _limit Number of entries to return
     * @return Array of Score structs
     */
    function getGlobalLeaderboard(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Score[] memory) 
    {
        require(_offset < globalLeaderboard.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > globalLeaderboard.length) {
            end = globalLeaderboard.length;
        }
        
        uint256 resultLength = end - _offset;
        Score[] memory result = new Score[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = globalLeaderboard[_offset + i];
        }
        
        return result;
    }
    
    /**
     * @notice Get today's daily leaderboard
     * @param _offset Starting index
     * @param _limit Number of entries to return
     * @return Array of Score structs
     */
    function getDailyLeaderboard(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Score[] memory) 
    {
        uint256 today = _getCurrentDay();
        Score[] storage todayScores = dailyLeaderboards[today];
        
        require(_offset < todayScores.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > todayScores.length) {
            end = todayScores.length;
        }
        
        uint256 resultLength = end - _offset;
        Score[] memory result = new Score[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = todayScores[_offset + i];
        }
        
        return result;
    }
    
    /**
     * @notice Get a specific day's leaderboard
     * @param _dayNumber The day number since Unix epoch
     * @param _offset Starting index
     * @param _limit Number of entries to return
     * @return Array of Score structs
     */
    function getHistoricalDailyLeaderboard(
        uint256 _dayNumber,
        uint256 _offset,
        uint256 _limit
    ) external view returns (Score[] memory) {
        Score[] storage dayScores = dailyLeaderboards[_dayNumber];
        
        require(_offset < dayScores.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > dayScores.length) {
            end = dayScores.length;
        }
        
        uint256 resultLength = end - _offset;
        Score[] memory result = new Score[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = dayScores[_offset + i];
        }
        
        return result;
    }
    
    /**
     * @notice Get player's score history
     * @param _player Address of the player
     * @param _offset Starting index
     * @param _limit Number of entries to return
     * @return Array of Score structs
     */
    function getPlayerScores(address _player, uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Score[] memory) 
    {
        Score[] storage scores = playerScores[_player];
        require(_offset < scores.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > scores.length) {
            end = scores.length;
        }
        
        uint256 resultLength = end - _offset;
        Score[] memory result = new Score[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = scores[_offset + i];
        }
        
        return result;
    }
    
    /**
     * @notice Get player statistics
     * @param _player Address of the player
     * @return PlayerStats struct
     */
    function getPlayerStats(address _player) 
        external 
        view 
        returns (PlayerStats memory) 
    {
        return playerStats[_player];
    }
    
    /**
     * @notice Get player's rank on global leaderboard
     * @param _player Address of the player
     * @return rank (0 if not on leaderboard)
     */
    function getPlayerRank(address _player) external view returns (uint256) {
        for (uint256 i = 0; i < globalLeaderboard.length; i++) {
            if (globalLeaderboard[i].player == _player) {
                return i + 1; // Rank starts at 1
            }
        }
        return 0; // Not on leaderboard
    }
    
    /**
     * @notice Get total number of entries on global leaderboard
     * @return Total entries
     */
    function getGlobalLeaderboardSize() external view returns (uint256) {
        return globalLeaderboard.length;
    }
    
    /**
     * @notice Get total number of entries on today's daily leaderboard
     * @return Total entries
     */
    function getDailyLeaderboardSize() external view returns (uint256) {
        uint256 today = _getCurrentDay();
        return dailyLeaderboards[today].length;
    }
    
    /**
     * @notice Get current day number
     * @return Day number since Unix epoch
     */
    function getCurrentDay() external view returns (uint256) {
        return _getCurrentDay();
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update minimum score required for leaderboard
     * @param _newMinimum New minimum score
     */
    function setMinimumScore(uint256 _newMinimum) external onlyOwner {
        uint256 oldMinimum = minimumScore;
        minimumScore = _newMinimum;
        emit MinimumScoreUpdated(oldMinimum, _newMinimum);
    }
    
    /**
     * @notice Update game version string
     * @param _newVersion New version string
     */
    function setGameVersion(string memory _newVersion) external onlyOwner {
        string memory oldVersion = gameVersion;
        gameVersion = _newVersion;
        emit GameVersionUpdated(oldVersion, _newVersion);
    }
    
    /**
     * @notice Pause score submissions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause score submissions
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Remove a fraudulent score from leaderboard
     * @param _player Address of the player
     * @param _gameSessionId Session ID to remove
     */
    function removeScore(address _player, bytes32 _gameSessionId) external onlyOwner {
        // Remove from player's scores
        Score[] storage scores = playerScores[_player];
        for (uint256 i = 0; i < scores.length; i++) {
            if (scores[i].gameSessionId == _gameSessionId) {
                scores[i] = scores[scores.length - 1];
                scores.pop();
                break;
            }
        }
        
        // Remove from global leaderboard
        for (uint256 i = 0; i < globalLeaderboard.length; i++) {
            if (globalLeaderboard[i].player == _player && 
                globalLeaderboard[i].gameSessionId == _gameSessionId) {
                globalLeaderboard[i] = globalLeaderboard[globalLeaderboard.length - 1];
                globalLeaderboard.pop();
                _sortLeaderboard(globalLeaderboard);
                break;
            }
        }
    }
    
    // ============ Internal Functions ============
    
    function _updateGlobalLeaderboard(Score memory _newScore) internal {
        // Add score to leaderboard
        globalLeaderboard.push(_newScore);
        
        // Sort leaderboard by score (descending)
        _sortLeaderboard(globalLeaderboard);
        
        // Trim to max size
        if (globalLeaderboard.length > MAX_LEADERBOARD_SIZE) {
            globalLeaderboard.pop();
        }
        
        // Find rank and emit event
        for (uint256 i = 0; i < globalLeaderboard.length; i++) {
            if (globalLeaderboard[i].player == _newScore.player && 
                globalLeaderboard[i].gameSessionId == _newScore.gameSessionId) {
                emit LeaderboardUpdated(_newScore.player, i + 1, _newScore.score);
                break;
            }
        }
    }
    
    function _updateDailyLeaderboard(Score memory _newScore) internal {
        uint256 today = _getCurrentDay();
        dailyLeaderboards[today].push(_newScore);
        _sortLeaderboard(dailyLeaderboards[today]);
        
        // Keep daily leaderboard at reasonable size
        if (dailyLeaderboards[today].length > MAX_LEADERBOARD_SIZE) {
            dailyLeaderboards[today].pop();
        }
    }
    
    function _sortLeaderboard(Score[] storage _leaderboard) internal {
        // Bubble sort (simple for small arrays, consider more efficient for larger)
        uint256 length = _leaderboard.length;
        for (uint256 i = 0; i < length; i++) {
            for (uint256 j = i + 1; j < length; j++) {
                if (_leaderboard[i].score < _leaderboard[j].score) {
                    Score memory temp = _leaderboard[i];
                    _leaderboard[i] = _leaderboard[j];
                    _leaderboard[j] = temp;
                }
            }
        }
    }
    
    function _getCurrentDay() internal view returns (uint256) {
        return block.timestamp / SECONDS_PER_DAY;
    }
    
    function _getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }
    
    function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) 
        internal 
        pure 
        returns (address) 
    {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }
    
    function _splitSignature(bytes memory _sig) 
        internal 
        pure 
        returns (bytes32 r, bytes32 s, uint8 v) 
    {
        require(_sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
    }
}
