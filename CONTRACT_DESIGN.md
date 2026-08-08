i# Hemi Shadow Runner - Smart Contract Design

**Version**: 1.0  
**Status**: Design Phase (No Implementation Yet)  
**Target**: <150 lines of Solidity  
**Philosophy**: Simplicity, Low Gas, Clean Architecture

---

## 1. DATA STRUCTURES

### GameSession (Stored per session)

```
struct GameSession {
    address player;      // 20 bytes - who owns this session
    uint32 gameSeed;     // 4 bytes  - deterministic RNG seed
    uint32 startBlock;   // 4 bytes  - when session started
    uint16 finalScore;   // 2 bytes  - score (max 65,535)
    bool finished;       // 1 byte   - prevent double submission
}
// Total: 31 bytes per session
```

**Design Rationale**:
- `gameSeed` is `uint32` (4 billion possibilities) - sufficient entropy for game RNG
- `startBlock` is `uint32` - blocks won't overflow this for decades
- `finalScore` is `uint16` - allows scores up to 65,535 (reasonable for endless runner)
- `finished` flag prevents duplicate submissions
- Packed into single storage slot for gas efficiency

### PlayerStats (Stored per player)

```
struct PlayerStats {
    uint16 bestScore;    // 2 bytes - highest score achieved
    uint16 gamesPlayed;  // 2 bytes - total games (max 65,535 games)
}
// Total: 4 bytes per player
```

**Design Rationale**:
- Minimal stats only
- Both fit in single storage slot (ultra gas-efficient reads/writes)
- `uint16` for both is sufficient (65k games is plenty)

---

## 2. STORAGE LAYOUT

```
// Mappings
mapping(uint256 => GameSession) public sessions;
mapping(address => PlayerStats) public playerStats;

// Session counter
uint256 public nextSessionId;
```

**Design Rationale**:
- `sessions` mapping: sessionId → GameSession
- `playerStats` mapping: player address → PlayerStats
- `nextSessionId` auto-increments (simple, predictable IDs)
- No arrays (gas expensive to iterate)
- No leaderboard on-chain (can be indexed off-chain via events)

**Storage Slots**:
- 3 storage variables total
- Session lookups: O(1)
- Player stats lookups: O(1)
- Minimal storage footprint

---

## 3. FUNCTION SIGNATURES

### Write Functions

#### `startGame()`

```
function startGame() 
    external 
    returns (uint256 sessionId, uint32 gameSeed)
```

**Purpose**: Create new game session with on-chain seed

**Returns**:
- `sessionId`: Unique session identifier
- `gameSeed`: Deterministic seed for gameplay

**Logic**:
1. Increment `nextSessionId`
2. Generate `gameSeed` from block data
3. Create new `GameSession` struct
4. Store in `sessions` mapping
5. Emit `GameStarted` event
6. Return `sessionId` and `gameSeed`

**Gas Cost**: ~50k-70k (1 storage write + session data)

**Seed Generation**:
```
gameSeed = uint32(
    uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,  // or block.difficulty on older chains
        msg.sender,
        nextSessionId
    )))
)
```

---

#### `submitScore(uint256 sessionId, uint16 score)`

```
function submitScore(uint256 sessionId, uint16 score) 
    external
```

**Purpose**: Submit final score for a completed session

**Parameters**:
- `sessionId`: The session to finalize
- `score`: Final score achieved

**Validations**:
1. Session exists
2. Session belongs to `msg.sender`
3. Session not already finished
4. Score > 0 (optional sanity check)

**Logic**:
1. Load session from storage
2. Validate (revert if invalid)
3. Mark session as `finished`
4. Update session's `finalScore`
5. Increment player's `gamesPlayed`
6. Update player's `bestScore` if higher
7. Emit `GameFinished` event
8. Emit `NewHighScore` event (if applicable)

**Gas Cost**: ~30k-50k (2 storage updates: session + stats)

---

### Read Functions (View/Pure)

#### `getSession(uint256 sessionId)`

```
function getSession(uint256 sessionId) 
    external 
    view 
    returns (GameSession memory)
```

**Purpose**: Retrieve full session data

---

#### `getPlayerStats(address player)`

```
function getPlayerStats(address player) 
    external 
    view 
    returns (PlayerStats memory)
```

**Purpose**: Retrieve player statistics

---

#### `isSessionActive(uint256 sessionId)`

```
function isSessionActive(uint256 sessionId) 
    external 
    view 
    returns (bool)
```

**Purpose**: Check if session can still submit score

**Returns**: `!sessions[sessionId].finished`

---

## 4. EVENTS

### GameStarted

```
event GameStarted(
    uint256 indexed sessionId,
    address indexed player,
    uint32 gameSeed,
    uint32 startBlock
);
```

**Necessity**: ✅ **ESSENTIAL**

**Why**:
- Frontend needs to know session creation succeeded
- Off-chain indexers can track game history
- Provides audit trail of game starts
- Indexed by sessionId and player (efficient queries)

---

### GameFinished

```
event GameFinished(
    uint256 indexed sessionId,
    address indexed player,
    uint16 score,
    uint16 gamesPlayed
);
```

**Necessity**: ✅ **ESSENTIAL**

**Why**:
- Frontend confirmation of successful submission
- Off-chain leaderboard indexing (score + player)
- Historical game records
- `gamesPlayed` included for context

---

### NewHighScore

```
event NewHighScore(
    address indexed player,
    uint16 newBestScore,
    uint16 previousBestScore
);
```

**Necessity**: 🟡 **NICE TO HAVE**

**Why**:
- Celebration moment for players
- Frontend can show achievement notification
- Off-chain analytics for player progression

**Could Remove If**: Aiming for absolute minimalism (check score in `GameFinished`)

---

## 5. TRANSACTION FLOW

### Start Flow

```
┌─────────────┐
│   Player    │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Call startGame()
       │
       ▼
┌─────────────────────────┐
│   Smart Contract        │
├─────────────────────────┤
│ • Generate sessionId    │
│ • Generate gameSeed     │
│ • Create GameSession    │
│ • Store in mapping      │
│ • Emit GameStarted      │
└──────┬──────────────────┘
       │
       │ 2. Return (sessionId, gameSeed)
       │
       ▼
┌─────────────────────────┐
│   Frontend              │
├─────────────────────────┤
│ • Store sessionId       │
│ • Initialize RNG(seed)  │
│ • Start gameplay        │
│ • All gameplay off-chain│
└─────────────────────────┘
```

---

### Submit Flow

```
┌─────────────┐
│   Player    │
│  (Frontend) │
│  Game Over  │
└──────┬──────┘
       │
       │ 1. Call submitScore(sessionId, score)
       │
       ▼
┌─────────────────────────────┐
│   Smart Contract            │
├─────────────────────────────┤
│ VALIDATIONS:                │
│ • Session exists?           │
│ • Belongs to msg.sender?    │
│ • Not finished yet?         │
│                             │
│ UPDATE:                     │
│ • sessions[id].finished ✓   │
│ • sessions[id].finalScore   │
│ • playerStats.gamesPlayed++ │
│ • playerStats.bestScore?    │
│                             │
│ EMIT:                       │
│ • GameFinished              │
│ • NewHighScore? (optional)  │
└──────┬──────────────────────┘
       │
       │ 2. Transaction confirmed
       │
       ▼
┌─────────────────────────────┐
│   Frontend                  │
├─────────────────────────────┤
│ • Show final score          │
│ • Display stats             │
│ • Show high score badge?    │
└─────────────────────────────┘
```

---

## 6. SECURITY CONSIDERATIONS

### Built-In Protections

✅ **Session Ownership**
```
require(sessions[sessionId].player == msg.sender, "Not your session");
```
- Only session creator can submit score
- Simple address comparison

✅ **Duplicate Submission**
```
require(!sessions[sessionId].finished, "Already finished");
```
- Boolean flag prevents re-submission
- Gas efficient (1 storage read)

✅ **Session Existence**
```
require(sessions[sessionId].player != address(0), "Invalid session");
```
- Zero address indicates non-existent session
- Prevents submitting to non-existent IDs

✅ **Score Sanity** (Optional)
```
require(score > 0, "Invalid score");
```
- Prevents zero-score submissions
- Could be removed if zero scores are valid

---

### What We DON'T Do (By Design)

❌ **No Time Validation**
- Don't check if game finished "too fast"
- Game speed varies, would hurt UX
- Off-chain gameplay can't be proven anyway

❌ **No Signature Verification**
- Unnecessary complexity
- Gas expensive
- Session ownership is sufficient

❌ **No Score Limits**
- `uint16` max (65,535) is the limit
- Natural cap via data type
- Game design should make this reasonable

❌ **No Merkle Proofs / ZK**
- Overkill for casual game
- Would balloon contract size
- Defeats "simplicity" goal

---

### Attack Vectors & Mitigations

**Attack**: Create session, never submit (spam sessions)
**Mitigation**: No mitigation needed. Unfinished sessions waste attacker's gas, not ours.

**Attack**: Submit fake scores
**Mitigation**: None on-chain. Off-chain leaderboards can implement additional validation (e.g., flag suspicious patterns, rate limits, community reporting).

**Attack**: Front-run someone's `submitScore`
**Mitigation**: Not applicable. Session ownership prevents this.

---

## 7. EXPANDABILITY DESIGN

### Future Additions (WITHOUT Breaking Changes)

#### Daily Challenges

Add new mapping:
```
mapping(uint256 => ChallengeSession) public dailyChallenges;
```

Add new function:
```
function startDailyChallenge(uint256 challengeId) 
    external 
    returns (uint256 sessionId, uint32 gameSeed)
```

Existing `startGame()` unchanged. New function for challenges.

---

#### Tournaments

Add new struct:
```
struct Tournament {
    uint32 startTime;
    uint32 endTime;
    uint256[] sessionIds;
}
```

Add new functions:
```
function startTournamentGame(uint256 tournamentId) external
function getTournamentSessions(uint256 tournamentId) external view
```

Existing functions unchanged.

---

#### Replay Data (Deterministic Verification)

Modify `submitScore` to accept optional replay hash:
```
function submitScore(
    uint256 sessionId, 
    uint16 score,
    bytes32 replayHash  // NEW: optional replay verification
) external
```

Since Solidity allows overloading, old signature still works:
```
function submitScore(uint256 sessionId, uint16 score) external
```

Or use optional parameter pattern:
```
function submitScore(
    uint256 sessionId, 
    uint16 score,
    bytes32 replayHash
) external {
    // if replayHash == bytes32(0), skip verification
}
```

---

#### Additional Stats

Expand `PlayerStats` struct:
```
struct PlayerStats {
    uint16 bestScore;
    uint16 gamesPlayed;
    // NEW FIELDS (future expansion)
    uint16 totalCoins;
    uint8 powerUpsUsed;
    uint32 totalPlayTime;
}
```

**Storage Impact**: PlayerStats grows from 1 slot to 2 slots. Existing data preserved.

---

#### Leaderboard (If Needed Later)

Add separate leaderboard contract that indexes events:
```
LeaderboardIndexer reads GameFinished events
→ Maintains sorted list off-chain or in separate contract
→ Original game contract unchanged
```

**Better approach**: Keep leaderboard off-chain (The Graph, custom indexer).

---

## 8. GAS OPTIMIZATION TECHNIQUES

### Struct Packing

✅ **GameSession**: 31 bytes → fits in 1 storage slot
- Saves ~15k gas per read/write vs unpacked

✅ **PlayerStats**: 4 bytes → fits in 1 storage slot
- Ultra-efficient updates

### Minimal Storage

✅ **No arrays**: Arrays cost gas to iterate
✅ **No leaderboard on-chain**: Expensive to maintain sorted list
✅ **No unnecessary fields**: Every field costs gas

### Efficient Data Types

✅ **uint16 for scores**: 2 bytes vs 32 bytes = 93% storage savings
✅ **uint32 for blocks/seeds**: 4 bytes vs 32 bytes = 87% savings
✅ **bool for flags**: 1 byte (clear semantics)

### Event Indexing

✅ **Indexed parameters**: Allows efficient off-chain queries
✅ **Max 3 indexed per event**: Follows best practices

---

## 9. COST ESTIMATION

### Per-Transaction Costs (Hemi Network)

| Operation | Gas Cost | USD (30 gwei, $2000 ETH) |
|-----------|----------|--------------------------|
| **startGame()** | ~50-70k | ~$3-4 |
| **submitScore()** (first game) | ~50k | ~$3 |
| **submitScore()** (subsequent) | ~30k | ~$1.80 |
| **getSession()** (read) | 0 | $0 |
| **getPlayerStats()** (read) | 0 | $0 |

**Per Game**: ~$4-7 total (start + submit)

**Note**: Hemi gas prices are typically lower than mainnet Ethereum.

---

## 10. INTERFACE SUMMARY

### Complete Public Interface

```typescript
// ============================================
// WRITE FUNCTIONS
// ============================================

function startGame() 
    external 
    returns (uint256 sessionId, uint32 gameSeed);

function submitScore(uint256 sessionId, uint16 score) 
    external;

// ============================================
// READ FUNCTIONS
// ============================================

function getSession(uint256 sessionId) 
    external 
    view 
    returns (GameSession memory);

function getPlayerStats(address player) 
    external 
    view 
    returns (PlayerStats memory);

function isSessionActive(uint256 sessionId) 
    external 
    view 
    returns (bool);

// ============================================
// PUBLIC VARIABLES (auto-generated getters)
// ============================================

function sessions(uint256) external view returns (GameSession memory);
function playerStats(address) external view returns (PlayerStats memory);
function nextSessionId() external view returns (uint256);

// ============================================
// EVENTS
// ============================================

event GameStarted(
    uint256 indexed sessionId,
    address indexed player,
    uint32 gameSeed,
    uint32 startBlock
);

event GameFinished(
    uint256 indexed sessionId,
    address indexed player,
    uint16 score,
    uint16 gamesPlayed
);

event NewHighScore(
    address indexed player,
    uint16 newBestScore,
    uint16 previousBestScore
);
```

**Line Count Estimate**:
- Structs: ~15 lines
- Storage: ~5 lines
- startGame(): ~20 lines
- submitScore(): ~30 lines
- View functions: ~15 lines
- Events: ~10 lines

**Total**: ~95-120 lines (well under 150 target)

---

## 11. DESIGN RATIONALE

### Why This Design?

#### ✅ Simplicity
- 2 structs, 3 storage variables, 2 main functions
- No complex logic or nested structures
- Easy to audit and understand

#### ✅ Low Gas
- Struct packing maximizes storage efficiency
- Minimal storage slots used
- No expensive operations (loops, arrays, sorting)

#### ✅ Clean Architecture
- Clear separation: session management vs player stats
- Single responsibility per function
- Predictable state transitions

#### ✅ Great UX
- Two-transaction flow is intuitive
- Immediate feedback via events
- No hidden complexity for players

#### ✅ Easy Frontend Integration
- Simple function signatures
- Clear return values
- Comprehensive events for UI updates

#### ✅ Future-Proof
- Struct fields can be added
- New functions can be added
- Events provide historical data
- No breaking changes needed for expansions

---

## 12. SIMPLIFICATION ANALYSIS

### Senior Engineer Review

#### What Could Be Simpler?

**Option 1: Remove `NewHighScore` Event**
- Pro: 3 fewer lines, slightly less gas
- Con: Frontend loses celebration moment
- **Verdict**: Keep it. Good UX worth minimal cost.

**Option 2: Remove `isSessionActive()` View Function**
- Pro: Frontend can check `session.finished` directly
- Con: Less convenient, requires loading full session
- **Verdict**: Keep it. Convenience worth it.

**Option 3: Use `uint256` Instead of Packed Types**
- Pro: Simpler code (no casting)
- Con: 10-15x higher storage costs
- **Verdict**: Keep packing. Gas savings are huge.

**Option 4: Remove Score Sanity Check**
- Pro: 1 less require statement
- Con: Allows zero scores (might be valid?)
- **Verdict**: Optional. Remove if zero scores are meaningful.

**Option 5: Combine Session and Stats Mappings**
- Pro: One less storage variable
- Con: Mixing concerns, less expandable
- **Verdict**: Keep separate. Clean architecture matters.

---

### What's Already Optimal?

✅ **No Owner/Admin Functions**
- Contract is fully decentralized
- No upgrade mechanisms needed
- No admin overhead

✅ **No Pausability**
- Adds complexity and gas
- Game can always be played
- Trustless operation

✅ **No Access Control**
- Everyone can play freely
- No permission systems
- Maximally open

✅ **No Reentrancy Guards**
- No external calls = no reentrancy risk
- Don't pay gas for unnecessary protection

✅ **No SafeMath**
- Solidity 0.8+ has built-in overflow protection
- Don't import unnecessary libraries

---

## 13. IMPLEMENTATION NOTES

### When Implementing:

1. **Use Solidity 0.8.20+**
   - Built-in overflow protection
   - Gas optimizations
   - `block.prevrandao` support

2. **No External Dependencies**
   - No OpenZeppelin imports needed
   - Self-contained contract
   - Minimal attack surface

3. **Test Coverage Must Include**:
   - Starting multiple sessions
   - Submitting scores out of order
   - Attempting duplicate submission
   - Attempting to submit other's session
   - Updating high scores
   - Edge cases (uint16 max values)

4. **Deployment Checklist**:
   - Verify struct packing with `forge inspect` or similar
   - Gas profile all functions
   - Ensure <150 lines (excluding comments)
   - Test on testnet with real frontend
   - Verify events emit correctly

---

## 14. FRONTEND INTEGRATION EXAMPLE

### TypeScript Types

```typescript
interface GameSession {
    player: string;      // address
    gameSeed: number;    // uint32
    startBlock: number;  // uint32
    finalScore: number;  // uint16
    finished: boolean;
}

interface PlayerStats {
    bestScore: number;   // uint16
    gamesPlayed: number; // uint16
}
```

### Starting a Game

```typescript
// 1. Call contract
const tx = await contract.startGame();
const receipt = await tx.wait();

// 2. Extract from event or return value
const { sessionId, gameSeed } = receipt.events[0].args;

// 3. Initialize game with seed
const rng = new SeededRNG(gameSeed);
startGameplay(sessionId, rng);
```

### Submitting Score

```typescript
// 1. Game ends with final score
const finalScore = 1234;

// 2. Submit to contract
const tx = await contract.submitScore(sessionId, finalScore);
await tx.wait();

// 3. Fetch updated stats
const stats = await contract.getPlayerStats(playerAddress);
displayStats(stats);
```

---

## 15. COMPARISON WITH PREVIOUS DESIGN

### Old Contract (ShadowRunnerLeaderboard.sol)

❌ **450+ lines**
❌ **Complex leaderboard sorting on-chain**
❌ **Daily leaderboard arrays**
❌ **Historical data storage**
❌ **Admin controls (pause, remove scores)**
❌ **Multiple mappings and arrays**
❌ **OpenZeppelin dependencies**

**Gas Costs**: $9 per submission (with leaderboard updates)

---

### New Design

✅ **<150 lines**
✅ **No on-chain leaderboard**
✅ **Minimal storage (2 structs, 3 variables)**
✅ **No admin overhead**
✅ **No external dependencies**
✅ **Ultra-simple logic**

**Gas Costs**: ~$3-5 per submission

---

### Why Redesign?

The previous contract was **over-engineered** for a casual game:
- Maintaining sorted leaderboards on-chain is expensive
- Admin functions add unnecessary complexity
- Historical arrays grow indefinitely
- Not aligned with "simple arcade game" goal

The new design recognizes:
- Leaderboards can be indexed off-chain (via events)
- Game sessions are the core primitive
- Simplicity > features for v1
- Can always expand later

---

## 16. FINAL RECOMMENDATIONS

### ✅ Implement This Design If:
- You want minimal gas costs
- You value simplicity and maintainability
- You're okay with off-chain leaderboard indexing
- You want a clean foundation for future expansion

### 🟡 Consider Modifications If:
- You absolutely need on-chain leaderboards (adds ~300 lines)
- You need admin controls (adds ~50 lines)
- You want extensive stats tracking (modify PlayerStats)

### ❌ Don't Implement If:
- You need complex anti-cheat (this design trusts the seed)
- You need pausability (no emergency stop)
- You want token rewards (needs additional logic)

---

## FINAL DESIGN VERDICT

This design achieves all stated goals:

✅ **Simplicity**: 2 transactions, 5 functions, 2 structs  
✅ **Low Gas**: <$5 per game, optimized struct packing  
✅ **Clean Architecture**: Clear separation of concerns  
✅ **Great UX**: Immediate feedback, minimal friction  
✅ **Easy Integration**: Simple interface, comprehensive events  
✅ **Expandable**: Can add features without breaking changes

**Implementation Complexity**: ~100-120 lines of Solidity  
**Audit Complexity**: Low (minimal attack surface)  
**Maintenance Burden**: Minimal (self-contained, no admin)

This is a **production-ready design** for a Hemi game contest submission.

---

**END OF DESIGN DOCUMENT**

*Ready for implementation review and approval.*
