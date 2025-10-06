from prometheus_client import Counter, Histogram, Gauge, generate_latest, REGISTRY
from prometheus_client import start_http_server
import time

# Game API specific metrics
dispute_creation_duration = Histogram(
    'polyverse_games_dispute_creation_duration_seconds',
    'Duration of dispute creation in seconds',
    ['game_type']
)

payment_processing_duration = Histogram(
    'polyverse_games_payment_processing_duration_seconds',
    'Duration of payment processing in seconds',
    ['payment_type']
)

verification_duration = Histogram(
    'polyverse_games_verification_duration_seconds',
    'Duration of game verification in seconds',
    ['game_type', 'verification_method']
)

rating_update_duration = Histogram(
    'polyverse_games_rating_update_duration_seconds',
    'Duration of rating updates in seconds',
    ['rating_system']
)

subscription_creation_duration = Histogram(
    'polyverse_games_subscription_creation_duration_seconds',
    'Duration of subscription creation in seconds',
    ['plan_type']
)

webhook_processing_duration = Histogram(
    'polyverse_games_webhook_processing_duration_seconds',
    'Duration of webhook processing in seconds',
    ['webhook_type']
)

# Counters
dispute_creation_total = Counter(
    'polyverse_games_dispute_creation_total',
    'Total number of disputes created',
    ['game_type', 'status']
)

payment_processing_total = Counter(
    'polyverse_games_payment_processing_total',
    'Total number of payment processing attempts',
    ['payment_type', 'status']
)

verification_total = Counter(
    'polyverse_games_verification_total',
    'Total number of verification attempts',
    ['game_type', 'verification_method', 'status']
)

subscription_creation_total = Counter(
    'polyverse_games_subscription_creation_total',
    'Total number of subscription creations',
    ['plan_type', 'status']
)

# Gauges
active_disputes = Gauge(
    'polyverse_games_active_disputes',
    'Number of active disputes',
    ['game_type', 'status']
)

active_subscriptions = Gauge(
    'polyverse_games_active_subscriptions',
    'Number of active subscriptions',
    ['plan_type']
)

def start_metrics_server(port=8001):
    """Start the Prometheus metrics server on the specified port"""
    start_http_server(port)

def get_metrics():
    """Return the latest metrics in Prometheus format"""
    return generate_latest(REGISTRY)