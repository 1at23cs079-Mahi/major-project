#!/usr/bin/env bash
# ============================================================================
# Snyk Security Test Script for HiReady
# ============================================================================
# Usage:
#   chmod +x snyk-test.sh
#   ./snyk-test.sh
#
# Prerequisites:
#   npm install -g snyk
#   snyk auth
# ============================================================================

set -e

echo "========================================"
echo "  HiReady - Snyk Security Scan"
echo "========================================"
echo ""

# Check if snyk is installed
if ! command -v snyk &> /dev/null; then
    echo "[!] Snyk CLI not found. Installing..."
    npm install -g snyk
    echo "[+] Snyk installed."
    echo ""
    echo "[!] You need to authenticate first:"
    echo "    Run: snyk auth"
    echo ""
    exit 1
fi

# Check authentication
echo "[1/4] Checking authentication..."
if ! snyk auth check &> /dev/null 2>&1; then
    echo "[!] Not authenticated. Running snyk auth..."
    snyk auth
fi
echo "  OK"
echo ""

# Run open source vulnerability test
echo "[2/4] Scanning npm dependencies for vulnerabilities..."
echo "----------------------------------------"
snyk test --severity-threshold=low --json > snyk-report.json 2>&1 || true
snyk test --severity-threshold=low 2>&1 || true
echo ""

# Run code analysis (SAST)
echo "[3/4] Running static code analysis (Snyk Code)..."
echo "----------------------------------------"
snyk code test 2>&1 || true
echo ""

# Monitor (optional - registers project for continuous monitoring)
echo "[4/4] Registering project for continuous monitoring..."
echo "----------------------------------------"
snyk monitor 2>&1 || true
echo ""

echo "========================================"
echo "  Scan Complete"
echo "========================================"
echo ""
echo "Results:"
echo "  - Console output above"
echo "  - JSON report: snyk-report.json"
echo "  - Dashboard:   https://app.snyk.io"
echo ""
echo "To test the GitHub repo directly:"
echo "  snyk test https://github.com/1at23cs079-Mahi/major-project"
echo ""
