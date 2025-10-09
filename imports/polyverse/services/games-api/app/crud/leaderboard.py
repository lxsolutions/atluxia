










from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from app.models import dispute as dispute_model
from app.models import user as user_model
from app.schemas import dispute as dispute_schema


def get_leaderboards(
    db: Session,
    game_id: int,
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "rank"
) -> List[dispute_schema.Leaderboard]:
    query = db.query(
        dispute_model.Leaderboard,
        user_model.User.username
    ).join(
        user_model.User,
        dispute_model.Leaderboard.user_id == user_model.User.id
    ).filter(
        dispute_model.Leaderboard.game_id == game_id
    )
    
    # Apply sorting
    if sort_by == "rank":
        query = query.order_by(asc(dispute_model.Leaderboard.rank))
    elif sort_by == "wins":
        query = query.order_by(desc(dispute_model.Leaderboard.wins))
    elif sort_by == "win_rate":
        query = query.order_by(desc(dispute_model.Leaderboard.win_rate))
    elif sort_by == "total_tribute":
        query = query.order_by(desc(dispute_model.Leaderboard.total_tribute))
    elif sort_by == "elo_rating":
        query = query.order_by(desc(dispute_model.Leaderboard.elo_rating))
    elif sort_by == "glicko_rating":
        query = query.order_by(desc(dispute_model.Leaderboard.glicko_rating))
    elif sort_by == "current_streak":
        query = query.order_by(desc(dispute_model.Leaderboard.current_streak))
    else:
        query = query.order_by(asc(dispute_model.Leaderboard.rank))
    
    return query.offset(skip).limit(limit).all()


def get_leaderboards_count(db: Session, game_id: int) -> int:
    return db.query(dispute_model.Leaderboard).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).count()


def get_user_leaderboards(db: Session, user_id: int) -> List[dispute_schema.Leaderboard]:
    return db.query(dispute_model.Leaderboard).filter(
        dispute_model.Leaderboard.user_id == user_id
    ).all()


def get_global_leaderboard(
    db: Session, 
    game_id: int, 
    limit: int = 100
) -> List[dispute_schema.Leaderboard]:
    return db.query(
        dispute_model.Leaderboard,
        user_model.User.username
    ).join(
        user_model.User,
        dispute_model.Leaderboard.user_id == user_model.User.id
    ).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).order_by(asc(dispute_model.Leaderboard.rank)).limit(limit).all()


def get_game_stats(db: Session, game_id: int) -> Dict[str, Any]:
    total_players = db.query(dispute_model.Leaderboard).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).count()
    
    avg_win_rate = db.query(func.avg(dispute_model.Leaderboard.win_rate)).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).scalar() or 0
    
    total_matches = db.query(func.sum(
        dispute_model.Leaderboard.wins + dispute_model.Leaderboard.losses
    )).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).scalar() or 0
    
    total_tribute = db.query(func.sum(dispute_model.Leaderboard.total_tribute)).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).scalar() or 0
    
    return {
        "total_players": total_players,
        "average_win_rate": round(avg_win_rate, 2),
        "total_matches": total_matches,
        "total_tribute": round(total_tribute, 2)
    }


def get_user_rank(db: Session, user_id: int, game_id: int) -> Optional[int]:
    return db.query(dispute_model.Leaderboard).filter(
        dispute_model.Leaderboard.game_id == game_id,
        dispute_model.Leaderboard.user_id == user_id
    ).first()


def get_user_achievements(db: Session, user_id: int) -> Dict[str, Any]:
    # Get user's overall stats across all games
    user_stats = db.query(
        func.sum(dispute_model.Leaderboard.wins).label('total_wins'),
        func.sum(dispute_model.Leaderboard.losses).label('total_losses'),
        func.sum(dispute_model.Leaderboard.total_tribute).label('total_tribute'),
        func.max(dispute_model.Leaderboard.elo_rating).label('max_elo'),
        func.max(dispute_model.Leaderboard.current_streak).label('max_streak')
    ).join(
        dispute_model.Leaderboard,
        user_model.User.id == dispute_model.Leaderboard.user_id
    ).filter(
        user_model.User.id == user_id
    ).first()
    
    if not user_stats:
        return {}
    
    total_matches = (user_stats.total_wins or 0) + (user_stats.total_losses or 0)
    win_rate = (user_stats.total_wins / total_matches * 100) if total_matches > 0 else 0
    
    return {
        "total_wins": user_stats.total_wins or 0,
        "total_losses": user_stats.total_losses or 0,
        "total_matches": total_matches,
        "win_rate": round(win_rate, 2),
        "total_tribute": round(user_stats.total_tribute or 0, 2),
        "max_elo_rating": user_stats.max_elo or 0,
        "max_streak": user_stats.max_streak or 0
    }


def get_trending_players(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    # Get players with highest ELO rating gain in last 30 days
    from datetime import datetime, timedelta
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    return db.query(
        user_model.User.username,
        dispute_model.Leaderboard.elo_rating,
        user_model.User.total_wins,
        user_model.User.total_losses
    ).join(
        dispute_model.Leaderboard,
        user_model.User.id == dispute_model.Leaderboard.user_id
    ).filter(
        dispute_model.Leaderboard.updated_at >= thirty_days_ago
    ).order_by(desc(dispute_model.Leaderboard.elo_rating)).limit(limit).all()


def get_all_time_leaderboard(
    db: Session, 
    game_id: int, 
    limit: int = 100
) -> List[dispute_schema.Leaderboard]:
    return db.query(
        dispute_model.Leaderboard,
        user_model.User.username
    ).join(
        user_model.User,
        dispute_model.Leaderboard.user_id == user_model.User.id
    ).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).order_by(desc(dispute_model.Leaderboard.elo_rating)).limit(limit).all()


def get_recent_matches(
    db: Session, 
    game_id: int, 
    limit: int = 20
) -> List[Dict[str, Any]]:
    return db.query(
        dispute_model.Dispute.title,
        dispute_model.Dispute.challenger_side,
        dispute_model.Dispute.opponent_side,
        dispute_model.Dispute.winner_id,
        user_model.User.username.label('winner_username'),
        dispute_model.Dispute.completed_at,
        dispute_model.Dispute.entry_fee
    ).join(
        user_model.User,
        dispute_model.Dispute.winner_id == user_model.User.id
    ).filter(
        dispute_model.Dispute.game_id == game_id,
        dispute_model.Dispute.completed_at.isnot(None)
    ).order_by(desc(dispute_model.Dispute.completed_at)).limit(limit).all()


def get_head_to_head_stats(
    db: Session, 
    player1_id: int, 
    player2_id: int
) -> Dict[str, Any]:
    # Get matches between these two players
    matches = db.query(dispute_model.Dispute).filter(
        dispute_model.Dispute.game_id.in_(
            db.query(dispute_model.Leaderboard.game_id).filter(
                dispute_model.Leaderboard.user_id.in_([player1_id, player2_id])
            )
        ),
        dispute_model.Dispute.status == dispute_model.DisputeStatus.COMPLETED,
        func.or_(
            and_(
                dispute_model.Dispute.challenger_id == player1_id,
                dispute_model.Dispute.opponent_id == player2_id
            ),
            and_(
                dispute_model.Dispute.challenger_id == player2_id,
                dispute_model.Dispute.opponent_id == player1_id
            )
        )
    ).all()
    
    player1_wins = sum(1 for match in matches if match.winner_id == player1_id)
    player2_wins = sum(1 for match in matches if match.winner_id == player2_id)
    
    return {
        "player1_id": player1_id,
        "player2_id": player2_id,
        "total_matches": len(matches),
        "player1_wins": player1_wins,
        "player2_wins": player2_wins,
        "player1_win_rate": (player1_wins / len(matches) * 100) if matches else 0,
        "player2_win_rate": (player2_wins / len(matches) * 100) if matches else 0
    }


def get_win_rate_distribution(db: Session, game_id: int) -> List[Dict[str, Any]]:
    # Get distribution of win rates
    return db.query(
        func.case(
            (dispute_model.Leaderboard.win_rate < 25, '0-25%'),
            (dispute_model.Leaderboard.win_rate < 50, '25-50%'),
            (dispute_model.Leaderboard.win_rate < 75, '50-75%'),
            else_='75-100%'
        ).label('win_rate_range'),
        func.count(dispute_model.Leaderboard.id).label('count')
    ).filter(
        dispute_model.Leaderboard.game_id == game_id
    ).group_by('win_rate_range').all()


def get_current_streaks(db: Session, game_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    return db.query(
        user_model.User.username,
        dispute_model.Leaderboard.current_streak,
        dispute_model.Leaderboard.elo_rating,
        dispute_model.Leaderboard.wins,
        dispute_model.Leaderboard.losses
    ).join(
        dispute_model.Leaderboard,
        user_model.User.id == dispute_model.Leaderboard.user_id
    ).filter(
        dispute_model.Leaderboard.game_id == game_id,
        dispute_model.Leaderboard.current_streak > 0
    ).order_by(desc(dispute_model.Leaderboard.current_streak)).limit(limit).all()


def get_user_performance(
    db: Session, 
    user_id: int, 
    game_id: int
) -> Dict[str, Any]:
    performance = db.query(dispute_model.Leaderboard).filter(
        dispute_model.Leaderboard.user_id == user_id,
        dispute_model.Leaderboard.game_id == game_id
    ).first()
    
    if not performance:
        return {}
    
    return {
        "user_id": user_id,
        "game_id": game_id,
        "rank": performance.rank,
        "wins": performance.wins,
        "losses": performance.losses,
        "win_rate": round(performance.win_rate, 2),
        "total_tribute": round(performance.total_tribute, 2),
        "current_streak": performance.current_streak,
        "longest_streak": performance.longest_streak,
        "elo_rating": performance.elo_rating
    }





