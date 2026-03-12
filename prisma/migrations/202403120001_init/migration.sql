-- CreateTable
CREATE TABLE IF NOT EXISTS "Puzzle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numbers" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "solveRate" REAL,
    "solutions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LeaderboardEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "puzzlesSolved" INTEGER NOT NULL,
    "totalAttempts" INTEGER NOT NULL,
    "invalidAttempts" INTEGER NOT NULL,
    "averageSolveMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "LeaderboardEntry_mode_timeLimit_idx" ON "LeaderboardEntry"("mode", "timeLimit");
