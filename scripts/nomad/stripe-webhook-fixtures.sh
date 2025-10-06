#!/bin/bash

# Stripe Webhook Fixtures Script
# This script generates test webhook events using Stripe CLI for integration testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="${WEBHOOK_URL:-http://localhost:3001/api/webhooks/stripe}"
FIXTURES_DIR="${FIXTURES_DIR:-./fixtures}"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Stripe CLI is installed
check_stripe_cli() {
    if ! command -v stripe &> /dev/null; then
        log_error "Stripe CLI is not installed. Please install it from: https://stripe.com/docs/stripe-cli"
        exit 1
    fi
}

# Create fixtures directory
create_fixtures_dir() {
    mkdir -p "$FIXTURES_DIR"
    log_info "Fixtures directory created: $FIXTURES_DIR"
}

# Generate account.updated webhook fixture
generate_account_updated_fixture() {
    local account_id="acct_test_$(date +%s)"
    local fixture_file="$FIXTURES_DIR/account_updated.json"
    
    cat > "$fixture_file" << EOF
{
  "id": "evt_$(date +%s)",
  "object": "event",
  "api_version": "2023-10-16",
  "created": $(date +%s),
  "data": {
    "object": {
      "id": "$account_id",
      "object": "account",
      "charges_enabled": true,
      "payouts_enabled": true,
      "requirements": {
        "currently_due": [],
        "eventually_due": [],
        "past_due": [],
        "pending_verification": []
      },
      "details_submitted": true
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_$(date +%s)",
    "idempotency_key": "$(uuidgen)"
  },
  "type": "account.updated"
}
EOF
    
    log_info "Generated account.updated fixture: $fixture_file"
}

# Generate payment_intent.succeeded webhook fixture
generate_payment_succeeded_fixture() {
    local payment_intent_id="pi_test_$(date +%s)"
    local fixture_file="$FIXTURES_DIR/payment_succeeded.json"
    
    cat > "$fixture_file" << EOF
{
  "id": "evt_$(date +%s)",
  "object": "event",
  "api_version": "2023-10-16",
  "created": $(date +%s),
  "data": {
    "object": {
      "id": "$payment_intent_id",
      "object": "payment_intent",
      "amount": 10000,
      "amount_received": 10000,
      "currency": "usd",
      "payment_method": "pm_test_$(date +%s)",
      "customer": "cus_test_$(date +%s)",
      "metadata": {
        "bookingId": "booking_$(date +%s)",
        "userId": "user_$(date +%s)"
      }
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_$(date +%s)",
    "idempotency_key": "$(uuidgen)"
  },
  "type": "payment_intent.succeeded"
}
EOF
    
    log_info "Generated payment_intent.succeeded fixture: $fixture_file"
}

# Generate payment_intent.payment_failed webhook fixture
generate_payment_failed_fixture() {
    local payment_intent_id="pi_test_$(date +%s)"
    local fixture_file="$FIXTURES_DIR/payment_failed.json"
    
    cat > "$fixture_file" << EOF
{
  "id": "evt_$(date +%s)",
  "object": "event",
  "api_version": "2023-10-16",
  "created": $(date +%s),
  "data": {
    "object": {
      "id": "$payment_intent_id",
      "object": "payment_intent",
      "last_payment_error": {
        "code": "card_declined",
        "message": "Your card was declined.",
        "type": "card_error"
      },
      "metadata": {
        "bookingId": "booking_$(date +%s)",
        "userId": "user_$(date +%s)"
      }
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_$(date +%s)",
    "idempotency_key": "$(uuidgen)"
  },
  "type": "payment_intent.payment_failed"
}
EOF
    
    log_info "Generated payment_intent.payment_failed fixture: $fixture_file"
}

# Send webhook using Stripe CLI
send_webhook() {
    local fixture_file="$1"
    local event_type="$2"
    
    if [ ! -f "$fixture_file" ]; then
        log_error "Fixture file not found: $fixture_file"
        return 1
    fi
    
    log_info "Sending $event_type webhook..."
    
    stripe fixtures "$fixture_file" --forward-to "$WEBHOOK_URL"
    
    if [ $? -eq 0 ]; then
        log_info "Successfully sent $event_type webhook"
    else
        log_error "Failed to send $event_type webhook"
        return 1
    fi
}

# Main function
main() {
    log_info "Starting Stripe webhook fixtures generation..."
    
    check_stripe_cli
    create_fixtures_dir
    
    # Generate fixtures
    generate_account_updated_fixture
    generate_payment_succeeded_fixture
    generate_payment_failed_fixture
    
    log_info "All fixtures generated successfully!"
    
    # Ask if user wants to send test webhooks
    read -p "Do you want to send test webhooks to $WEBHOOK_URL? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        send_webhook "$FIXTURES_DIR/account_updated.json" "account.updated"
        send_webhook "$FIXTURES_DIR/payment_succeeded.json" "payment_intent.succeeded"
        send_webhook "$FIXTURES_DIR/payment_failed.json" "payment_intent.payment_failed"
    fi
    
    log_info "Stripe webhook fixtures setup completed!"
}

# Run main function
main "$@"