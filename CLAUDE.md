# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

STIG Manager Watcher is a CLI client that watches a path for STIG test result files (CKL, XCCDF, CKLB formats) and posts the results to a STIG Manager Collection. It's designed to run as a service/daemon, scheduled task, or in automated pipelines.

## Common Development Commands

### Testing
```bash
# Run tests with coverage
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

### Running the Application
```bash
# Run from source
node index.js [options]

# Global install method
npm install --global @nuwcdivnpt/stigman-watcher
stigman-watcher [options]
```

### Building
```bash
# Build binary (uses esbuild via build.sh)
./build.sh
```

## Architecture

The application follows a modular architecture with distinct operational modes:

### Core Components
- **index.js**: Main entry point, handles initialization, preflight checks, and process lifecycle
- **lib/args.js**: Command-line argument parsing and configuration validation using Commander.js
- **lib/logger.js**: Winston-based logging with configurable levels
- **lib/auth.js**: OAuth2/OIDC authentication handling with token management
- **lib/api.js**: STIG Manager API client with caching and error handling
- **lib/alarm.js**: Centralized alarm/error state management system

### Operational Modes
1. **Events Mode** (default): Uses chokidar to watch filesystem for new files
2. **Scan Mode**: Periodically scans directories for files, maintains history to avoid reprocessing

### Processing Pipeline
- **lib/events.js** or **lib/scan.js**: File discovery and initial filtering
- **lib/parse.js**: Parse queue that processes CKL/XCCDF/CKLB files 
- **lib/cargo.js**: Timed cargo queue that batches parsed results for API submission

### Key Design Patterns
- Queue-based processing with better-queue for parsing and cargo handling
- Alarm system for centralized error state management and recovery
- Configuration via CLI arguments with environment variable fallbacks
- Preflight validation of API connectivity and permissions before starting operations

### File Processing Flow
1. Files discovered by events or scan mode
2. Queued to parseQueue for CKL/XCCDF parsing
3. Parsed results queued to cargoQueue for batched API submission
4. API calls create/update Assets and post Reviews to STIG Manager

## Configuration
Uses dotenv for environment variables. Key configuration handled via:
- CLI arguments (processed by Commander.js)
- Environment variables with `WATCHER_` prefix
- Configuration validation on startup with early exit on invalid config

## Dependencies
- **@nuwcdivnpt/stig-manager-client-modules**: STIG Manager API client
- **chokidar**: File system watching (events mode)
- **better-queue**: Queue management for processing pipeline
- **winston**: Logging framework
- **commander**: CLI argument parsing
- **got**: HTTP client for API requests
- **fast-glob**: File globbing (scan mode)