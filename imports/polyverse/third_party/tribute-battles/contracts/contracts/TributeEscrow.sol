










// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TributeEscrow
 * @dev Smart contract for handling dispute escrow in Tribute Battles platform
 * Manages USDC deposits for game disputes and handles payout to winners
 */
contract TributeEscrow is Ownable, ReentrancyGuard {
    // State variables
    IERC20 public usdcToken;
    
    // Mapping from dispute ID to dispute details
    mapping(uint256 => Dispute) public disputes;
    
    // Mapping from user to their total deposited amount
    mapping(address => uint256) public userDeposits;
    
    // Mapping from dispute ID to whether it's been resolved
    mapping(uint256 => bool) public isDisputeResolved;
    
    // Events
    event DisputeCreated(
        uint256 indexed disputeId,
        address indexed challenger,
        address indexed opponent,
        uint256 entryFee,
        uint256 timestamp
    );
    
    event FundsDeposited(
        uint256 indexed disputeId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event WinnerClaimed(
        uint256 indexed disputeId,
        address indexed winner,
        uint256 amount,
        uint256 timestamp
    );
    
    event DisputeRefunded(
        uint256 indexed disputeId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    // Structs
    struct Dispute {
        uint256 id;
        address challenger;
        address opponent;
        uint256 entryFee;
        uint256 totalDeposited;
        bool isResolved;
        address winner;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    // Constructor
    constructor(address _usdcTokenAddress) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    // Modifiers
    modifier onlyDisputeParticipants(uint256 _disputeId) {
        require(
            msg.sender == disputes[_disputeId].challenger || 
            msg.sender == disputes[_disputeId].opponent,
            "Only dispute participants can call this function"
        );
        _;
    }

    modifier disputeNotResolved(uint256 _disputeId) {
        require(!isDisputeResolved[_disputeId], "Dispute already resolved");
        _;
    }

    /**
     * @dev Create a new dispute escrow
     * @param _disputeId Unique identifier for the dispute
     * @param _challenger Address of the challenger
     * @param _opponent Address of the opponent
     * @param _entryFee Entry fee amount in USDC (6 decimals)
     */
    function createDisputeEscrow(
        uint256 _disputeId,
        address _challenger,
        address _opponent,
        uint256 _entryFee
    ) external onlyOwner {
        require(_challenger != address(0), "Invalid challenger address");
        require(_opponent != address(0), "Invalid opponent address");
        require(_challenger != _opponent, "Challenger and opponent must be different");
        require(_entryFee > 0, "Entry fee must be greater than 0");
        require(disputes[_disputeId].challenger == address(0), "Dispute already exists");

        disputes[_disputeId] = Dispute({
            id: _disputeId,
            challenger: _challenger,
            opponent: _opponent,
            entryFee: _entryFee,
            totalDeposited: 0,
            isResolved: false,
            winner: address(0),
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        emit DisputeCreated(_disputeId, _challenger, _opponent, _entryFee, block.timestamp);
    }

    /**
     * @dev Deposit entry fee for a dispute
     * @param _disputeId ID of the dispute
     */
    function depositEntryFee(uint256 _disputeId) external disputeNotResolved(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];
        require(
            msg.sender == dispute.challenger || msg.sender == dispute.opponent,
            "Only dispute participants can deposit"
        );

        uint256 amount = dispute.entryFee;
        require(amount > 0, "Entry fee not set");

        // Transfer USDC from user to contract
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        dispute.totalDeposited += amount;
        userDeposits[msg.sender] += amount;

        emit FundsDeposited(_disputeId, msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Claim winnings by the winner (Phase 1 - Manual)
     * @param _disputeId ID of the dispute
     * @param _winner Address of the winner
     * @param _proofHash Hash of the proof (e.g., screenshot hash)
     */
    function claimWinnings(
        uint256 _disputeId,
        address _winner,
        bytes32 _proofHash
    ) external onlyOwner disputeNotResolved(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];
        require(
            _winner == dispute.challenger || _winner == dispute.opponent,
            "Invalid winner address"
        );

        dispute.isResolved = true;
        dispute.winner = _winner;
        dispute.resolvedAt = block.timestamp;
        isDisputeResolved[_disputeId] = true;

        // Transfer total amount to winner (2x entry fee)
        uint256 totalAmount = dispute.totalDeposited;
        bool success = usdcToken.transfer(_winner, totalAmount);
        require(success, "USDC transfer failed");

        emit WinnerClaimed(_disputeId, _winner, totalAmount, block.timestamp);
    }

    /**
     * @dev Refund dispute (for cancelled or invalid disputes)
     * @param _disputeId ID of the dispute
     */
    function refundDispute(uint256 _disputeId) external onlyOwner disputeNotResolved(_disputeId) {
        Dispute storage dispute = disputes[_disputeId];
        
        // Mark as resolved
        dispute.isResolved = true;
        dispute.resolvedAt = block.timestamp;
        isDisputeResolved[_disputeId] = true;

        // Refund both participants
        uint256 challengerAmount = dispute.entryFee;
        uint256 opponentAmount = dispute.entryFee;

        if (challengerAmount > 0) {
            bool success = usdcToken.transfer(dispute.challenger, challengerAmount);
            require(success, "Challenger refund failed");
            emit DisputeRefunded(_disputeId, dispute.challenger, challengerAmount, block.timestamp);
        }

        if (opponentAmount > 0) {
            bool success = usdcToken.transfer(dispute.opponent, opponentAmount);
            require(success, "Opponent refund failed");
            emit DisputeRefunded(_disputeId, dispute.opponent, opponentAmount, block.timestamp);
        }
    }

    /**
     * @dev Get dispute details
     * @param _disputeId ID of the dispute
     * @return Dispute details
     */
    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        return disputes[_disputeId];
    }

    /**
     * @dev Get user's total deposits
     * @param _user Address of the user
     * @return Total deposited amount
     */
    function getUserDeposits(address _user) external view returns (uint256) {
        return userDeposits[_user];
    }

    /**
     * @dev Get contract balance
     * @return USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @dev Emergency function to recover stuck tokens
     * @param _tokenAddress Address of the token to recover
     * @param _amount Amount to recover
     */
    function recoverTokens(address _tokenAddress, uint256 _amount) external onlyOwner {
        require(_tokenAddress != address(usdcToken), "Cannot recover USDC");
        
        // This is a simplified recovery function
        // In production, you'd want more sophisticated recovery logic
        require(_amount > 0, "Amount must be greater than 0");
        
        // Note: This is a simplified example. In production, you'd need
        // to handle different token standards and add proper checks
    }
}












