





// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract JobEscrow is ReentrancyGuard {
    struct JobTerms {
        uint256 amount;
        address requester;
        string jobId;
        uint256 deadline; // timestamp
        bool completed;
        bytes32 resultHash;
    }

    mapping(string => JobTerms) private jobs;

    event JobCreated(string jobId, address requester, uint256 amount);
    event PaymentStreamed(address provider, string jobId, uint256 amount);
    event JobFinalized(string jobId, bool success);

    /// @notice Create a new job escrow
    /// @param _jobId Unique identifier for the job
    /// @param _amount Amount to deposit in USDC
    function createJob(
        string memory _jobId,
        uint256 _amount
    ) external payable nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");

        jobs[_jobId] = JobTerms({
            amount: _amount,
            requester: msg.sender,
            jobId: _jobId,
            deadline: block.timestamp + 1 hours,
            completed: false
        });

        emit JobCreated(_jobId, msg.sender, _amount);
    }

    /// @notice Stream payment to a provider for work done
    /// @param _jobId The job identifier
    /// @param _provider The provider address
    /// @param _amount Amount to pay (in USDC)
    function streamTo(address _provider, string memory _jobId, uint256 _amount) external nonReentrant {
        JobTerms storage job = jobs[_jobId];
        require(job.amount >= _amount, "Insufficient funds in escrow");
        require(block.timestamp <= job.deadline, "Job deadline passed");

        // In a real implementation, we would transfer USDC tokens here
        // For MVP, we'll just track the payment

        job.amount -= _amount;

        emit PaymentStreamed(_provider, _jobId, _amount);
    }

    /// @notice Finalize the job and release any remaining funds
    /// @param _jobId The job identifier
    /// @param _resultHash Hash of the result for verification
    function finalizeJob(string memory _jobId, bytes32 _resultHash) external nonReentrant {
        JobTerms storage job = jobs[_jobId];
        require(!job.completed, "Job already completed");
        require(msg.sender == job.requester || msg.sender == address(0), "Only requester can finalize");

        job.completed = true;
        job.resultHash = _resultHash;

        // In a real implementation, refund remaining funds to requester
        uint256 remaining = job.amount;
        if (remaining > 0) {
            payable(job.requester).transfer(remaining);
        }

        emit JobFinalized(_jobId, true);
    }
}





