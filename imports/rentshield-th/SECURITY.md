

# Security Policy

## Supported Versions

We release security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of RentShield TH seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

Send an email to security@rentshield.th with the following information:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any proof-of-concept code

We will acknowledge your email within 48 hours and will send a more detailed response within 72 hours indicating the next steps in handling your report.

### What to Expect

After you've submitted a vulnerability report:

1. **Confirmation**: We'll confirm receipt of your report within 48 hours
2. **Investigation**: Our team will investigate and verify the vulnerability
3. **Update**: We'll keep you informed about our progress
4. **Resolution**: We'll work on a fix and coordinate disclosure

### Disclosure Policy

We follow responsible disclosure practices:

- We will credit you for discovering the vulnerability (unless you prefer to remain anonymous)
- We will not take legal action against you if you act in good faith
- We ask that you not disclose the vulnerability publicly until we've had time to address it

## Security Best Practices

### For Developers

- Never commit secrets or credentials to version control
- Use environment variables for configuration
- Validate and sanitize all user inputs
- Implement proper authentication and authorization
- Keep dependencies up to date
- Use HTTPS in production
- Implement rate limiting

### For Users

- Use strong, unique passwords
- Enable two-factor authentication when available
- Keep your software up to date
- Be cautious of phishing attempts
- Report suspicious activity immediately

## Security Features

### Authentication & Authorization
- Role-based access control (RBAC)
- Secure session management
- Password hashing with bcrypt
- JWT token validation

### Data Protection
- Encryption at rest for sensitive data
- TLS/SSL for data in transit
- Input validation and sanitization
- SQL injection prevention

### Privacy Compliance
- PDPA/GDPR compliant data handling
- User consent management
- Data export and deletion capabilities
- Privacy-by-design architecture

## Dependency Security

We regularly:
- Monitor for vulnerable dependencies using `pnpm audit`
- Update dependencies with security patches
- Use dependabot for automated dependency updates
- Review third-party libraries for security practices

## Incident Response

In case of a security incident:

1. **Containment**: Isolate affected systems
2. **Assessment**: Determine scope and impact
3. **Notification**: Inform affected users if necessary
4. **Remediation**: Apply fixes and patches
5. **Post-mortem**: Analyze and improve processes

## Security Updates

- We release security patches as soon as possible
- Critical vulnerabilities may receive out-of-band releases
- All security updates are documented in release notes
- Users are encouraged to update promptly

## Contact

- **Security Team**: security@rentshield.th
- **PGP Key**: Available upon request
- **Response Time**: Within 72 hours for initial response

Thank you for helping keep RentShield TH secure!

