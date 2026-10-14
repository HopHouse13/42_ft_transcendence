#!/bin/bash

# Path resolution
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl/"
KEY_FILE="$SSL_DIR/nginx-selfsigned.key"
CRT_FILE="$SSL_DIR/nginx-selfsigned.crt"

# Pre-existence check
if [ -f "$KEY_FILE" ] && [ -f "$CRT_FILE" ]; then
  echo "SSL certificates already exist."
  exit 0
fi

# Host OS resolution (`hostname -I`` doesnt work on macOS)
if [ "$(uname)" = "Darwin" ]; then
  HOST_IP=$(ifconfig -l | xargs -n1 ipconfig getifaddr 2>/dev/null | head -n 1)
else
  HOST_IP=$(hostname -I | awk '{print $1}')
fi

HOST_DNS=$(hostname)

# SSL certificate generation
echo "Creating SSL certificates ..."

mkdir -p "$SSL_DIR"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CRT_FILE" \
  -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:$HOST_DNS,IP:127.0.0.1,IP:$HOST_IP"

echo "✅ SSL certificates correctly generated."

# req -x509: OpenSSL output a self-signed certficate instead of a certificate signing request
# -nodes: "no DES" prevents OpenSSL fron encrypting the private key with a password (otherwise Nginx will pause, waiting for human input of a password)
# -days 365: certificate validity duration
# -newkey rsa:2048: explicitly tells OpenSSL to generate a brand new RSA private key of size 2048 bits (best practice for encryption type and strength);
# -sha256: explicitly tell OpenSSL to use SHA-256 (more secure than SHA-1)
# -keyout: where to save the private key (decryption key)
# -out: where to save the SSL certificate (public key/encryption key)
# -subj: pre-fills the certificate details (country, state, locality, organization, org unit, common name, User ID)
# -addext: Add Extension, add SAN (subjectAltName) extension
