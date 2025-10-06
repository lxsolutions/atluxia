"""
Blockchain service for handling USDC escrow and smart contract interactions
"""
import json
import asyncio
from typing import Dict, Any, Optional, List
from web3 import Web3
from web3.middleware import geth_poa_middleware
from fastapi import HTTPException, status
from app.core.config import settings


class BlockchainService:
    """Service for handling blockchain interactions and USDC escrow"""
    
    def __init__(self):
        self.w3 = None
        self.contracts = {}
        self.initialized = False
        
    async def initialize(self):
        """Initialize blockchain connections and load contracts"""
        if self.initialized:
            return
            
        # Configure networks
        networks = {
            'polygon': {
                'rpc_url': settings.POLYGON_RPC_URL,
                'usdc_address': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                'chain_id': 137
            },
            'base': {
                'rpc_url': settings.BASE_RPC_URL,
                'usdc_address': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                'chain_id': 8453
            },
            'sepolia': {
                'rpc_url': settings.SEPOLIA_RPC_URL,
                'usdc_address': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
                'chain_id': 11155111
            }
        }
        
        # Load contract ABIs
        with open('app/services/contracts/TributeEscrow.json', 'r') as f:
            escrow_data = json.load(f)
            self.escrow_abi = escrow_data['abi']
            # For now, we'll use a placeholder for bytecode
            # In production, this would be loaded from the compiled contract
            self.escrow_bytecode = "0x" + "00" * 32  # Placeholder
            
        with open('app/services/contracts/ERC20.json', 'r') as f:
            self.erc20_abi = json.load(f)
        
        # Initialize Web3 connections
        for network_name, config in networks.items():
            if config['rpc_url']:
                w3 = Web3(Web3.HTTPProvider(config['rpc_url']))
                
                # Add POA middleware for networks that need it
                if network_name in ['polygon', 'base']:
                    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
                
                if w3.is_connected():
                    self.w3 = w3
                    
                    # Load contracts
                    self.contracts[network_name] = {
                        'usdc': w3.eth.contract(
                            address=Web3.to_checksum_address(config['usdc_address']),
                            abi=self.erc20_abi
                        ),
                        'escrow': None  # Will be set when deployed
                    }
                    
                    print(f"Connected to {network_name} network")
                    break
        
        self.initialized = True
    
    async def deploy_escrow_contract(self, network: str, private_key: str) -> Dict[str, Any]:
        """Deploy TributeEscrow contract to the specified network"""
        await self.initialize()
        
        if network not in self.contracts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Network {network} not configured"
            )
        
        try:
            w3 = self.w3
            account = w3.eth.account.from_key(private_key)
            
            # Get USDC address for the network
            usdc_address = self.contracts[network]['usdc'].address
            
            # Deploy contract
            contract = w3.eth.contract(abi=self.escrow_abi, bytecode=self.escrow_bytecode)
            
            # Build transaction
            transaction = contract.constructor(usdc_address).build_transaction({
                'from': account.address,
                'nonce': w3.eth.get_transaction_count(account.address),
                'gas': 2000000,
                'gasPrice': w3.eth.gas_price
            })
            
            # Sign and send transaction
            signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Store contract instance
            escrow_contract = w3.eth.contract(
                address=receipt.contractAddress,
                abi=self.escrow_abi
            )
            
            self.contracts[network]['escrow'] = escrow_contract
            
            return {
                'contract_address': receipt.contractAddress,
                'transaction_hash': tx_hash.hex(),
                'block_number': receipt.blockNumber,
                'network': network
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Contract deployment failed: {str(e)}"
            )
    
    async def create_dispute_escrow(
        self, 
        network: str, 
        dispute_id: int, 
        challenger_address: str, 
        opponent_address: str, 
        entry_fee: int
    ) -> Dict[str, Any]:
        """Create a new dispute escrow on the blockchain"""
        await self.initialize()
        
        if network not in self.contracts or not self.contracts[network]['escrow']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Escrow contract not deployed on {network}"
            )
        
        try:
            contract = self.contracts[network]['escrow']
            
            # Call createDisputeEscrow function
            transaction = contract.functions.createDisputeEscrow(
                dispute_id,
                Web3.to_checksum_address(challenger_address),
                Web3.to_checksum_address(opponent_address),
                entry_fee
            ).build_transaction({
                'from': settings.ESCROW_OWNER_ADDRESS,
                'nonce': self.w3.eth.get_transaction_count(settings.ESCROW_OWNER_ADDRESS),
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            # Sign and send transaction (in production, this would use a secure key management system)
            # For now, we'll just return the transaction data
            
            return {
                'dispute_id': dispute_id,
                'transaction_data': transaction,
                'network': network
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Escrow creation failed: {str(e)}"
            )
    
    async def deposit_entry_fee(self, network: str, dispute_id: int, user_address: str, private_key: str) -> Dict[str, Any]:
        """Deposit entry fee for a dispute"""
        await self.initialize()
        
        if network not in self.contracts or not self.contracts[network]['escrow']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Escrow contract not deployed on {network}"
            )
        
        try:
            contract = self.contracts[network]['escrow']
            usdc_contract = self.contracts[network]['usdc']
            
            # First, approve USDC transfer
            dispute = await self.get_dispute(network, dispute_id)
            entry_fee = dispute['entryFee']
            
            approve_tx = usdc_contract.functions.approve(
                contract.address,
                entry_fee
            ).build_transaction({
                'from': user_address,
                'nonce': self.w3.eth.get_transaction_count(user_address),
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            # Then deposit entry fee
            deposit_tx = contract.functions.depositEntryFee(dispute_id).build_transaction({
                'from': user_address,
                'nonce': self.w3.eth.get_transaction_count(user_address) + 1,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            return {
                'approve_transaction': approve_tx,
                'deposit_transaction': deposit_tx,
                'dispute_id': dispute_id,
                'entry_fee': entry_fee
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Deposit failed: {str(e)}"
            )
    
    async def claim_winnings(self, network: str, dispute_id: int, winner_address: str, proof_hash: str) -> Dict[str, Any]:
        """Claim winnings for a resolved dispute"""
        await self.initialize()
        
        if network not in self.contracts or not self.contracts[network]['escrow']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Escrow contract not deployed on {network}"
            )
        
        try:
            contract = self.contracts[network]['escrow']
            
            transaction = contract.functions.claimWinnings(
                dispute_id,
                Web3.to_checksum_address(winner_address),
                proof_hash
            ).build_transaction({
                'from': settings.ESCROW_OWNER_ADDRESS,
                'nonce': self.w3.eth.get_transaction_count(settings.ESCROW_OWNER_ADDRESS),
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            return {
                'transaction_data': transaction,
                'dispute_id': dispute_id,
                'winner_address': winner_address
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Claim failed: {str(e)}"
            )
    
    async def get_dispute(self, network: str, dispute_id: int) -> Dict[str, Any]:
        """Get dispute details from the blockchain"""
        await self.initialize()
        
        if network not in self.contracts or not self.contracts[network]['escrow']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Escrow contract not deployed on {network}"
            )
        
        try:
            contract = self.contracts[network]['escrow']
            dispute = contract.functions.getDispute(dispute_id).call()
            
            return {
                'id': dispute[0],
                'challenger': dispute[1],
                'opponent': dispute[2],
                'entryFee': dispute[3],
                'totalDeposited': dispute[4],
                'isResolved': dispute[5],
                'winner': dispute[6],
                'createdAt': dispute[7],
                'resolvedAt': dispute[8]
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to get dispute: {str(e)}"
            )
    
    async def get_contract_balance(self, network: str) -> Dict[str, Any]:
        """Get USDC balance of the escrow contract"""
        await self.initialize()
        
        if network not in self.contracts or not self.contracts[network]['escrow']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Escrow contract not deployed on {network}"
            )
        
        try:
            contract = self.contracts[network]['escrow']
            balance = contract.functions.getContractBalance().call()
            
            return {
                'balance': balance,
                'network': network,
                'contract_address': contract.address
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to get balance: {str(e)}"
            )


# Global blockchain service instance
blockchain_service = BlockchainService()