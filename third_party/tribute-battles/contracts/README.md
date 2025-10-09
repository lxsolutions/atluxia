





# Tribute Battles Smart Contracts

This directory contains the Solidity smart contracts for Tribute Battles, specifically for handling USDC escrow on Polygon/Base networks.

## Overview

The smart contracts provide secure escrow functionality for:
- Depositing entry fees in USDC
- Releasing funds to winners
- Handling dispute resolution
- Managing tournament prize pools

## Contract Structure

- `TributeEscrow.sol` - Main escrow contract for handling dispute funds
- `Tournament.sol` - Tournament-specific escrow logic
- `USDC.sol` - USDC token interface (using existing deployed contract)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile contracts:
   ```bash
   npx hardhat compile
   ```

3. Run tests:
   ```bash
   npx hardhat test
   ```

## Deployment

### Polygon Network
```bash
npx hardhat run scripts/deploy.js --network polygon
```

### Base Network
```bash
npx hardhat run scripts/deploy.js --network base
```

## Usage

### Creating a Dispute Escrow
```solidity
TributeEscrow escrow = new TributeEscrow(usdcAddress);
escrow.createDisputeEscrow(disputeId, challengerAddress, opponentAddress, entryFee);
```

### Releasing Funds to Winner
```solidity
escrow.releaseFunds(disputeId, winnerAddress);
```

### Refunding Dispute
```solidity
escrow.refundDispute(disputeId);
```

## Security Considerations

- All contract functions include access control
- Reentrancy protection is implemented
- Proper error handling and validation
- Time-locked dispute resolution

## Phase 1 (MVP)
Manual payout release by platform administrators.

## Phase 2 (Future)
Automated payout release through oracles and dispute resolution mechanisms.

## Phase 3 (Future)
Full automation with decentralized dispute resolution.

## License

MIT License

