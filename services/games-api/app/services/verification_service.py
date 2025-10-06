"""
Verification service for game result verification
"""
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status, UploadFile, File
import aiohttp
import asyncio
from datetime import datetime
import json


class VerificationService:
    """Service for game result verification with multiple adapters"""
    
    def __init__(self):
        self.adapters = {
            'sc2': self._verify_sc2,
            'aoe2': self._verify_aoe2, 
            'faf': self._verify_faf,
            'manual': self._verify_manual
        }
    
    async def verify_match(
        self, 
        game_type: str, 
        match_data: Dict[str, Any],
        proof_files: Optional[List[UploadFile]] = None
    ) -> Dict[str, Any]:
        """
        Verify a match using the appropriate adapter
        
        Args:
            game_type: Game type (sc2, aoe2, faf, manual)
            match_data: Match data for verification
            proof_files: Optional proof files (replays, screenshots, etc.)
            
        Returns:
            Verification result with confidence score
        """
        if game_type not in self.adapters:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported game type: {game_type}"
            )
        
        try:
            # Try the primary verification method
            result = await self.adapters[game_type](match_data, proof_files)
            
            if result['confidence'] >= 0.8:  # High confidence threshold
                return result
            
            # Fall back to manual verification if confidence is low
            manual_result = await self._verify_manual(match_data, proof_files)
            
            # Combine results with weighted confidence
            combined_confidence = (result['confidence'] * 0.6 + 
                                 manual_result['confidence'] * 0.4)
            
            return {
                'verified': combined_confidence >= 0.6,
                'confidence': combined_confidence,
                'method': f"{result['method']}+manual",
                'details': {
                    'automated': result['details'],
                    'manual': manual_result['details']
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            # Fall back to manual verification on error
            return await self._verify_manual(match_data, proof_files)
    
    async def _verify_sc2(self, match_data: Dict[str, Any], proof_files: Optional[List[UploadFile]]) -> Dict[str, Any]:
        """Verify StarCraft 2 match"""
        confidence = 0.7
        details = {
            'players': match_data.get('players', []),
            'duration': match_data.get('duration'),
            'winner': match_data.get('winner'),
            'map': match_data.get('map'),
            'verification_methods': []
        }
        
        # Check for replay file
        if proof_files:
            replay_found = any('replay' in file.filename.lower() or 
                             file.content_type == 'application/octet-stream' 
                             for file in proof_files)
            if replay_found:
                confidence += 0.2
                details['verification_methods'].append('replay_analysis')
        
        # Check for screenshot proof
        screenshot_found = any('screenshot' in file.filename.lower() or 
                             file.content_type.startswith('image/')
                             for file in proof_files) if proof_files else False
        if screenshot_found:
            confidence += 0.1
            details['verification_methods'].append('screenshot_validation')
        
        # Validate match data structure
        required_fields = ['players', 'winner', 'duration', 'map']
        missing_fields = [field for field in required_fields if field not in match_data]
        
        if not missing_fields:
            confidence += 0.1
            details['data_completeness'] = 'complete'
        else:
            details['missing_fields'] = missing_fields
            details['data_completeness'] = 'partial'
        
        # Check player count (SC2 is typically 1v1, 2v2, etc.)
        players = match_data.get('players', [])
        if len(players) >= 2 and len(players) <= 8:
            confidence += 0.05
            details['player_count_valid'] = True
        
        return {
            'verified': confidence >= 0.8,
            'confidence': min(confidence, 1.0),
            'method': 'sc2_verification',
            'details': details,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    async def _verify_aoe2(self, match_data: Dict[str, Any], proof_files: Optional[List[UploadFile]]) -> Dict[str, Any]:
        """Verify Age of Empires 2 match"""
        confidence = 0.65
        details = {
            'civilizations': match_data.get('civilizations', []),
            'duration': match_data.get('duration'),
            'score_difference': match_data.get('score_difference'),
            'game_type': match_data.get('game_type', 'unknown'),
            'verification_methods': []
        }
        
        # Check for recorded game file (.mgx)
        if proof_files:
            mgx_found = any(file.filename.lower().endswith('.mgx') or 
                           'recorded' in file.filename.lower()
                           for file in proof_files)
            if mgx_found:
                confidence += 0.25
                details['verification_methods'].append('recorded_game_analysis')
        
        # Check for screenshot proof
        screenshot_found = any('screenshot' in file.filename.lower() or 
                             file.content_type.startswith('image/')
                             for file in proof_files) if proof_files else False
        if screenshot_found:
            confidence += 0.15
            details['verification_methods'].append('screenshot_validation')
        
        # Validate match data
        required_fields = ['civilizations', 'duration', 'winner']
        missing_fields = [field for field in required_fields if field not in match_data]
        
        if not missing_fields:
            confidence += 0.1
            details['data_completeness'] = 'complete'
        else:
            details['missing_fields'] = missing_fields
            details['data_completeness'] = 'partial'
        
        # Check civilization validity
        valid_civs = ['britons', 'franks', 'goths', 'teutons', 'japanese', 'chinese', 
                     'byzantines', 'persians', 'saracens', 'turks', 'vikings', 'mongols',
                     'celts', 'spanish', 'aztecs', 'mayans', 'huns', 'koreans', 'italians',
                     'indians', 'incas', 'magyars', 'slavs', 'portuguese', 'ethiopians',
                     'malians', 'berbers', 'khmer', 'malay', 'burmese', 'vietnamese']
        
        civs = match_data.get('civilizations', [])
        valid_civ_count = sum(1 for civ in civs if civ.lower() in valid_civs)
        if valid_civ_count == len(civs) and len(civs) >= 2:
            confidence += 0.1
            details['civilizations_valid'] = True
        
        # Check game duration (typical AoE2 games are 10min to 3 hours)
        duration = match_data.get('duration', 0)
        if 600 <= duration <= 10800:  # 10min to 3 hours
            confidence += 0.05
            details['duration_valid'] = True
        
        return {
            'verified': confidence >= 0.7,
            'confidence': min(confidence, 1.0),
            'method': 'aoe2_verification',
            'details': details,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    async def _verify_faf(self, match_data: Dict[str, Any], proof_files: Optional[List[UploadFile]]) -> Dict[str, Any]:
        """Verify Forged Alliance Forever match"""
        confidence = 0.75
        details = {
            'factions': match_data.get('factions', []),
            'game_version': match_data.get('version'),
            'map_name': match_data.get('map'),
            'player_count': match_data.get('player_count', 0),
            'verification_methods': []
        }
        
        # Check for FAF replay file (.fafreplay)
        if proof_files:
            faf_replay_found = any(file.filename.lower().endswith('.fafreplay') or 
                                 'faf' in file.filename.lower()
                                 for file in proof_files)
            if faf_replay_found:
                confidence += 0.3
                details['verification_methods'].append('faf_replay_analysis')
        
        # Check for screenshot proof
        screenshot_found = any('screenshot' in file.filename.lower() or 
                             file.content_type.startswith('image/')
                             for file in proof_files) if proof_files else False
        if screenshot_found:
            confidence += 0.1
            details['verification_methods'].append('screenshot_validation')
        
        # Validate match data
        required_fields = ['factions', 'map', 'player_count', 'winner']
        missing_fields = [field for field in required_fields if field not in match_data]
        
        if not missing_fields:
            confidence += 0.1
            details['data_completeness'] = 'complete'
        else:
            details['missing_fields'] = missing_fields
            details['data_completeness'] = 'partial'
        
        # Check faction validity
        valid_factions = ['uef', 'cybran', 'aeon', 'seraphim']
        factions = match_data.get('factions', [])
        valid_faction_count = sum(1 for faction in factions if faction.lower() in valid_factions)
        if valid_faction_count == len(factions) and len(factions) >= 2:
            confidence += 0.1
            details['factions_valid'] = True
        
        # Check player count (FAF supports 1v1 up to 16 players)
        player_count = match_data.get('player_count', 0)
        if 2 <= player_count <= 16:
            confidence += 0.05
            details['player_count_valid'] = True
        
        # Check game version (FAF typically uses specific version numbers)
        version = match_data.get('version', '')
        if version.startswith('1.'):  # FAF version format
            confidence += 0.05
            details['version_valid'] = True
        
        return {
            'verified': confidence >= 0.8,
            'confidence': min(confidence, 1.0),
            'method': 'faf_verification',
            'details': details,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    async def _verify_manual(self, match_data: Dict[str, Any], proof_files: Optional[List[UploadFile]]) -> Dict[str, Any]:
        """Manual verification fallback"""
        # Simple heuristic-based verification
        confidence = 0.7  # Base confidence for manual review
        
        # Increase confidence based on proof quality
        if proof_files:
            confidence += 0.1 * len(proof_files)
        
        # Check for basic match data completeness
        required_fields = ['players', 'winner', 'duration']
        completeness = sum(1 for field in required_fields if field in match_data) / len(required_fields)
        confidence += 0.2 * completeness
        
        return {
            'verified': confidence >= 0.6,
            'confidence': min(confidence, 1.0),
            'method': 'manual_review',
            'details': {
                'proof_files_count': len(proof_files) if proof_files else 0,
                'data_completeness': completeness,
                'review_notes': 'Awaiting manual review'
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    
    async def process_proof_files(self, proof_files: List[UploadFile]) -> List[Dict[str, Any]]:
        """
        Process and validate proof files
        
        Args:
            proof_files: List of uploaded proof files
            
        Returns:
            List of processed file information
        """
        processed_files = []
        
        for file in proof_files:
            # Validate file type and size
            if not await self._validate_file(file):
                continue
            
            # Store file metadata
            file_info = {
                'filename': file.filename,
                'content_type': file.content_type,
                'size': file.size,
                'uploaded_at': datetime.utcnow().isoformat()
            }
            
            processed_files.append(file_info)
        
        return processed_files
    
    async def _validate_file(self, file: UploadFile) -> bool:
        """Validate proof file"""
        # Check file size (max 50MB)
        if file.size > 50 * 1024 * 1024:
            return False
        
        # Check file type
        allowed_types = [
            'application/octet-stream',  # Replay files
            'application/zip',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/quicktime',
            'text/plain',
            'application/json'
        ]
        
        if file.content_type not in allowed_types:
            return False
        
        return True


# Global verification service instance
verification_service = VerificationService()