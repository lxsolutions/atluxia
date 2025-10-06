package jwt

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTManager handles JWT token creation and verification
type JWTManager struct {
	secretKey     []byte
	algorithm     string
	tokenDuration time.Duration
}

// NewJWTManager creates a new JWT manager with configuration from environment
func NewJWTManager() (*JWTManager, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is required")
	}

	algorithm := os.Getenv("JWT_ALGORITHM")
	if algorithm == "" {
		algorithm = "HS256"
	}

	// Default token duration: 30 days
	tokenDuration := 30 * 24 * time.Hour

	return &JWTManager{
		secretKey:     []byte(secret),
		algorithm:     algorithm,
		tokenDuration: tokenDuration,
	}, nil
}

// Claims represents the JWT claims structure
type Claims struct {
	DID string `json:"did"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for a given DID
func (m *JWTManager) GenerateToken(did string) (string, error) {
	claims := &Claims{
		DID: did,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.tokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   did,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secretKey)
}

// VerifyToken verifies a JWT token and returns the DID if valid
func (m *JWTManager) VerifyToken(tokenString string) (string, error) {
	claims := &Claims{}
	
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return m.secretKey, nil
	})

	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	return claims.DID, nil
}