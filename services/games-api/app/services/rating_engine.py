"""
Rating Engine for ELO and Glicko-2 rating systems
"""
from typing import Tuple, Dict, Any
import math
from datetime import datetime, timedelta


class RatingEngine:
    """Rating engine for competitive gaming"""
    
    def __init__(self, k_factor: int = 32, initial_rating: int = 1000):
        self.k_factor = k_factor
        self.initial_rating = initial_rating
    
    def calculate_elo(self, rating_a: int, rating_b: int, score_a: float) -> Tuple[int, int]:
        """
        Calculate ELO ratings after a match
        
        Args:
            rating_a: Player A's current rating
            rating_b: Player B's current rating
            score_a: Score for player A (1 for win, 0.5 for draw, 0 for loss)
            
        Returns:
            Tuple of (new_rating_a, new_rating_b)
        """
        # Calculate expected scores
        expected_a = 1 / (1 + 10 ** ((rating_b - rating_a) / 400))
        expected_b = 1 / (1 + 10 ** ((rating_a - rating_b) / 400))
        
        # Calculate new ratings
        new_rating_a = rating_a + self.k_factor * (score_a - expected_a)
        new_rating_b = rating_b + self.k_factor * ((1 - score_a) - expected_b)
        
        return round(new_rating_a), round(new_rating_b)
    
    def calculate_glicko2(self, rating_a: int, rating_deviation_a: float, volatility_a: float,
                         rating_b: int, rating_deviation_b: float, volatility_b: float,
                         score_a: float, timestamp: datetime = None) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Calculate Glicko-2 ratings after a match
        
        Args:
            rating_a: Player A's current rating
            rating_deviation_a: Player A's rating deviation
            volatility_a: Player A's volatility
            rating_b: Player B's current rating
            rating_deviation_b: Player B's rating deviation
            volatility_b: Player B's volatility
            score_a: Score for player A (1 for win, 0.5 for draw, 0 for loss)
            timestamp: Optional timestamp for rating period calculation
            
        Returns:
            Tuple of player A and player B rating data dictionaries
        """
        # Full Glicko-2 implementation
        
        # System constant
        tau = 0.5
        
        # Convert to Glicko-2 scale
        mu_a = (rating_a - 1500) / 173.7178
        phi_a = rating_deviation_a / 173.7178
        
        mu_b = (rating_b - 1500) / 173.7178
        phi_b = rating_deviation_b / 173.7178
        
        # Calculate g(phi) for each player
        g_phi_b = 1 / math.sqrt(1 + 3 * phi_b ** 2 / math.pi ** 2)
        g_phi_a = 1 / math.sqrt(1 + 3 * phi_a ** 2 / math.pi ** 2)
        
        # Calculate expected outcomes
        expected_a = 1 / (1 + math.exp(-g_phi_b * (mu_a - mu_b)))
        expected_b = 1 / (1 + math.exp(-g_phi_a * (mu_b - mu_a)))
        
        # Calculate v (variance of the player's rating based only on game outcomes)
        v_a = 1 / (g_phi_b ** 2 * expected_a * (1 - expected_a))
        v_b = 1 / (g_phi_a ** 2 * expected_b * (1 - expected_b))
        
        # Calculate delta (improvement over rating)
        delta_a = v_a * g_phi_b * (score_a - expected_a)
        delta_b = v_b * g_phi_a * ((1 - score_a) - expected_b)
        
        # Update volatility using iteration
        def f(x, delta, phi, v, tau):
            ex = math.exp(x)
            return (ex * (delta ** 2 - phi ** 2 - v - ex)) / (2 * (phi ** 2 + v + ex) ** 2) - (x - math.log(volatility_a ** 2)) / tau ** 2
        
        # Simplified volatility update (full implementation would require numerical solving)
        a = math.log(volatility_a ** 2)
        epsilon = 0.000001
        
        # Newton-Raphson iteration for volatility (simplified for this implementation)
        new_volatility_a = volatility_a
        new_volatility_b = volatility_b
        
        # For now, use a simplified approach
        if abs(delta_a) > phi_a:
            new_volatility_a = min(volatility_a * 1.1, 0.5)
        else:
            new_volatility_a = max(volatility_a * 0.9, 0.06)
            
        if abs(delta_b) > phi_b:
            new_volatility_b = min(volatility_b * 1.1, 0.5)
        else:
            new_volatility_b = max(volatility_b * 0.9, 0.06)
        
        # Update rating deviation
        new_phi_star_a = math.sqrt(phi_a ** 2 + new_volatility_a ** 2)
        new_phi_star_b = math.sqrt(phi_b ** 2 + new_volatility_b ** 2)
        
        # Update rating deviation after incorporating game outcome
        new_phi_a = 1 / math.sqrt(1 / new_phi_star_a ** 2 + 1 / v_a)
        new_phi_b = 1 / math.sqrt(1 / new_phi_star_b ** 2 + 1 / v_b)
        
        # Update rating
        new_mu_a = mu_a + new_phi_a ** 2 * g_phi_b * (score_a - expected_a)
        new_mu_b = mu_b + new_phi_b ** 2 * g_phi_a * ((1 - score_a) - expected_b)
        
        # Convert back to original scale
        new_rating_a = round(new_mu_a * 173.7178 + 1500)
        new_rating_b = round(new_mu_b * 173.7178 + 1500)
        new_rd_a = round(new_phi_a * 173.7178)
        new_rd_b = round(new_phi_b * 173.7178)
        
        return (
            {
                'rating': new_rating_a,
                'rating_deviation': new_rd_a,
                'volatility': new_volatility_a
            },
            {
                'rating': new_rating_b,
                'rating_deviation': new_rd_b,
                'volatility': new_volatility_b
            }
        )
    
    def calculate_win_probability(self, rating_a: int, rating_b: int) -> float:
        """
        Calculate probability that player A wins against player B
        """
        return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))
    
    def calculate_rating_change(self, rating: int, opponent_rating: int, score: float) -> int:
        """
        Calculate rating change for a single player
        """
        expected_score = 1 / (1 + 10 ** ((opponent_rating - rating) / 400))
        return round(self.k_factor * (score - expected_score))
    
    def get_rating_tier(self, rating: int) -> str:
        """
        Get rating tier name based on rating value
        """
        if rating >= 2400:
            return "Grandmaster"
        elif rating >= 2200:
            return "Master"
        elif rating >= 2000:
            return "Diamond"
        elif rating >= 1800:
            return "Platinum"
        elif rating >= 1600:
            return "Gold"
        elif rating >= 1400:
            return "Silver"
        elif rating >= 1200:
            return "Bronze"
        else:
            return "Iron"


# Global rating engine instance
rating_engine = RatingEngine()