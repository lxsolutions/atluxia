-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HostProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    CONSTRAINT "HostProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AirportRulePack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airport_code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "json_blob" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_at" DATETIME
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "host_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "airport_code" TEXT NOT NULL,
    "start_ts" DATETIME NOT NULL,
    "end_ts" DATETIME NOT NULL,
    "marketplace" TEXT NOT NULL,
    "ics_uid" TEXT,
    "meta" JSONB,
    "path_geojson" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ComplianceResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trip_id" TEXT NOT NULL,
    "pass" BOOLEAN NOT NULL,
    "reasons" JSONB NOT NULL,
    "fees_breakdown" JSONB NOT NULL,
    "rulepack_version" TEXT NOT NULL,
    "assessed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceResult_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "host_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "amount_usd" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "transfer_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HostProfile_userId_key" ON "HostProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AirportRulePack_checksum_key" ON "AirportRulePack"("checksum");

-- CreateIndex
CREATE INDEX "AirportRulePack_airport_code_idx" ON "AirportRulePack"("airport_code");

-- CreateIndex
CREATE INDEX "AirportRulePack_active_idx" ON "AirportRulePack"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AirportRulePack_airport_code_version_key" ON "AirportRulePack"("airport_code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_ics_uid_key" ON "Trip"("ics_uid");

-- CreateIndex
CREATE INDEX "Trip_host_id_idx" ON "Trip"("host_id");

-- CreateIndex
CREATE INDEX "Trip_airport_code_idx" ON "Trip"("airport_code");

-- CreateIndex
CREATE INDEX "Trip_start_ts_end_ts_idx" ON "Trip"("start_ts", "end_ts");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceResult_trip_id_key" ON "ComplianceResult"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_trip_id_key" ON "Payout"("trip_id");

-- CreateIndex
CREATE INDEX "Payout_host_id_idx" ON "Payout"("host_id");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");
