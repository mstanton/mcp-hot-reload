# 🔥 MCP Server Hot Reload System

A powerful development tool that brings hot reloading and live management to Model Context Protocol (MCP) servers. Never restart Claude Desktop again when developing MCP servers!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)
![Status](https://img.shields.io/badge/status-stable-brightgreen.svg)

## ✨ Features

### 🔄 **Hot Reload System**
- **Intelligent File Watching**: Monitors your Claude Desktop configuration for changes
- **Smart Reloading**: Only restarts affected servers, preserves unchanged ones
- **Zero Downtime**: Seamless server transitions without losing connections
- **Configuration Validation**: Real-time validation of MCP server configurations

### 🎛️ **Process Management**
- **Graceful Lifecycle**: Proper startup, shutdown, and restart procedures
- **Auto-Recovery**: Automatic restart on failures with intelligent retry logic
- **Resource Monitoring**: Process ID tracking, memory usage, and uptime stats
- **Environment Support**: Full environment variable and working directory control

### 🖥️ **Multiple Interfaces**
- **Web Dashboard**: Beautiful, responsive UI with real-time updates
- **CLI Tool**: Interactive command-line interface for power users
- **REST API**: Programmatic control for automation and scripting
- **Event System**: Real-time notifications and logging

### 📊 **Monitoring & Debugging**
- **Live Logs**: Real-time log streaming with syntax highlighting
- **Status Indicators**: Visual server health monitoring
- **Performance Metrics**: Restart counts, uptime tracking, and error reporting
- **Debug Mode**: Detailed process information and troubleshooting tools

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** or **Docker** (for containerized deployment)
- **Claude Desktop** with MCP servers configured
- **Git** for version control

### Installation Options

#### Option 1: Direct Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-hot-reload.git
cd mcp-hot-reload

# Install dependencies and start
make install
make start
```

#### Option 2: Docker (Recommended)
```bash
# Clone and start with Docker
git clone https://github.com/yourusername/mcp-hot-reload.git
cd mcp-hot-reload

# Start with Docker Compose
make up

# Or for development with hot reload
make up-dev
```

#### Option 3: Global Installation
```bash
# Install globally via npm
npm install -g mcp-hot-reload

# Run from anywhere
mcp-hot-reload --help
```

### Access the Interface

- **Web Dashboard**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/servers
- **CLI**: Run `make dev` for interactive terminal interface

## 📖 Usage

### Quick Commands (Makefile)

The project includes a comprehensive Makefile for easy development:

```bash
# Development
make dev                # Start development server with hot reload
make test               # Run tests with coverage
make lint               # Check code quality
make format             # Format code

# Docker Development
make docker-dev         # Run in Docker with hot reload
make up-dev            # Start with docker-compose in dev mode
make logs              # View all service logs

# Production
make build             # Build and test
make docker-build      # Create production Docker image
make up                # Start production services
make deploy            # Build and deploy to registry

# Monitoring
make up-monitoring     # Start with Prometheus/Grafana
make health           # Check application health
make status           # Show complete system status

# Cleanup
make clean            # Clean build artifacts
make docker-clean     # Clean Docker resources
make clean-all        # Clean everything
```

### Command Line Interface

Start the interactive CLI:
```bash
make dev
# or
node mcp-hot-reload.js
```

**Available Commands:**
```bash
mcp> status                    # Show all server statuses
mcp> start <server-name>       # Start a specific server
mcp> stop <server-name>        # Stop a specific server
mcp> restart <server-name>     # Restart a specific server
mcp> toggle <server-name> on   # Enable a server
mcp> toggle <server-name> off  # Disable a server
mcp> reload                    # Force configuration reload
mcp> enable                    # Enable the entire system
mcp> disable                   # Disable the entire system
mcp> help                      # Show help message
```

### Web Dashboard

The web interface provides:

- **Server Grid**: Visual cards showing each server's status
- **Toggle Switches**: One-click enable/disable for each server
- **Bulk Actions**: Start all, stop all, reload configuration
- **Live Logs**: Real-time system and server logs
- **Status Indicators**: Color-coded server health monitoring
- **Auto-refresh**: Updates every 5 seconds automatically

### REST API

**Base URL**: `http://localhost:3001/api`

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/servers` | Get status of all servers |
| `POST` | `/servers/:name/restart` | Restart a specific server |
| `POST` | `/servers/:name/toggle` | Toggle server on/off |
| `POST` | `/reload` | Reload configuration |

**Example Usage:**
```bash
# Get server status
curl http://localhost:3001/api/servers

# Restart a server
curl -X POST http://localhost:3001/api/servers/my-server/restart

# Toggle server
curl -X POST http://localhost:3001/api/servers/my-server/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Reload configuration
curl -X POST http://localhost:3001/api/reload
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build development image
make docker-build-dev

# Run with hot reload
make docker-dev

# Or use docker-compose for full development stack
make up-dev
```

### Production Deployment

```bash
# Build production image
make docker-build

# Deploy with docker-compose
make up

# Or run standalone container
make docker-run
```

### Docker Compose Services

The project includes several optional services:

```bash
# Basic deployment
make up

# With Redis for session storage
docker-compose --profile redis up -d

# With Nginx reverse proxy
docker-compose --profile nginx up -d

# Full monitoring stack (Prometheus + Grafana)
make up-monitoring

# Everything together
make up-full
```

**Available Services:**
- **mcp-hot-reload**: Main application
- **redis**: Session storage and caching (optional)
- **nginx**: Reverse proxy with SSL support (optional)
- **prometheus**: Metrics collection (optional)
- **grafana**: Metrics visualization (optional)

### Environment Configuration

Create a `.env` file for customization:

```bash
# Application
NODE_ENV=production
MCP_WEB_PORT=3001
MCP_LOG_LEVEL=info
MCP_CONFIG_PATH=/config/claude_desktop_config.json

# Docker
DOCKER_TARGET=production
CLAUDE_CONFIG_PATH=~/.config/claude-desktop

# Monitoring
GRAFANA_PASSWORD=secure_password
```

## 📊 Monitoring & Observability

### Built-in Monitoring

- **Health Checks**: Automated container health monitoring
- **Metrics API**: Prometheus-compatible metrics endpoint
- **Structured Logging**: JSON logs with correlation IDs
- **Performance Tracking**: Request timing and resource usage

### Grafana Dashboards

When running with monitoring stack:

- **System Overview**: Server status, uptime, resource usage
- **Performance Metrics**: Response times, error rates, throughput
- **Process Monitoring**: Individual MCP server health
- **Alerts**: Configurable alerts for failures and performance issues

Access Grafana at: http://localhost:3000

## ⚙️ Configuration

### Claude Desktop Configuration

The system automatically detects your Claude Desktop configuration at:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude-desktop/claude_desktop_config.json`

**Example MCP Server Configuration:**
```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["./my-server/index.js"],
      "env": {
        "DEBUG": "true",
        "API_KEY": "your-api-key"
      },
      "cwd": "/path/to/server/directory"
    },
    "python-server": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "env": {
        "PYTHONPATH": "/custom/python/path"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_CONFIG_PATH` | Custom path to Claude config | Auto-detected |
| `MCP_WEB_PORT` | Web interface port | `3001` |
| `MCP_LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |
| `MCP_RESTART_DELAY` | Delay between restarts (ms) | `2000` |
| `MCP_MAX_RESTARTS` | Max auto-restart attempts | `3` |

## 🛠️ Development

### Development Workflow

```bash
# Setup project
git clone https://github.com/yourusername/mcp-hot-reload.git
cd mcp-hot-reload
make install

# Start development
make dev                    # Development server with hot reload
make test-watch            # Tests in watch mode
make lint                  # Code quality checks

# Docker development
make docker-dev            # Containerized development
make up-dev               # Full development stack

# Code quality
make lint                 # ESLint checks
make format               # Prettier formatting  
make test-coverage        # Test coverage report

# Git workflow
make git-setup           # Setup git hooks
git commit -m "feat: add new feature"  # Conventional commits
```

### Project Structure

```
mcp-hot-reload/
├── mcp-hot-reload.js          # Main application
├── package.json               # Dependencies and scripts
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Service orchestration
├── Makefile                   # Development commands
├── bin/                       # CLI executables
│   └── cli.js                # Global CLI entry point
├── lib/                      # Core library modules
│   ├── server-manager.js     # MCP server management
│   ├── file-watcher.js       # Configuration file watching
│   ├── web-server.js         # Express web server
│   └── utils.js              # Utility functions
├── public/                   # Web interface assets
│   ├── index.html           # Dashboard UI
│   ├── css/                 # Stylesheets
│   └── js/                  # Client-side JavaScript
├── tests/                   # Test suite
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test fixtures
├── docs/                    # Documentation
├── examples/               # Example configurations
├── monitoring/             # Monitoring configuration
│   ├── prometheus.yml      # Prometheus config
│   └── grafana/           # Grafana dashboards
└── logs/                   # Application logs
```

### Testing

```bash
# Run all tests
make test

# Watch mode for development
make test-watch

# Coverage report
make test-coverage

# Specific test files
npm test -- server-manager.test.js

# Integration tests
npm run test:integration
```

**Test Structure:**
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing
- **API Tests**: REST endpoint validation
- **Docker Tests**: Container functionality verification

### Development Tools

**Code Quality:**
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality gates
- **lint-staged**: Pre-commit checks

**Development Server:**
- **Nodemon**: Auto-restart on file changes
- **Debug**: Structured logging with namespaces
- **Source Maps**: Full debugging support
- **Hot Reload**: Live configuration updates

### API Integration

Use the system programmatically:

```javascript
const { MCPServerManager } = require('mcp-hot-reload');

const manager = new MCPServerManager({
  configPath: '/custom/path/config.json',
  port: 3001,
  logLevel: 'debug'
});

// Listen for events
manager.on('serverStarted', ({ name, pid }) => {
  console.log(`Server ${name} started with PID ${pid}`);
});

manager.on('hotReload', () => {
  console.log('Configuration hot reloaded!');
});

manager.on('serverError', ({ name, error }) => {
  console.error(`Server ${name} error:`, error);
});

// Control servers
await manager.startServer('my-server', config);
await manager.stopServer('my-server');
await manager.restartServer('my-server');
await manager.updateServerConfig('my-server', newConfig);

// Get status
const status = manager.getServerStatus();
const health = await manager.healthCheck();
```

### Custom Extensions

**Adding New Features:**

1. **Server Plugins**: Extend server management with custom logic
2. **Web Components**: Add new UI components to the dashboard
3. **API Endpoints**: Create custom REST endpoints
4. **Event Handlers**: Hook into the event system
5. **Monitoring**: Add custom metrics and alerts

**Example Plugin:**

```javascript
// plugins/slack-notifications.js
class SlackNotificationPlugin {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  init(manager) {
    manager.on('serverError', this.notifyError.bind(this));
    manager.on('serverRecovered', this.notifyRecovery.bind(this));
  }

  async notifyError({ name, error }) {
    // Send Slack notification
  }
}

module.exports = SlackNotificationPlugin;
```

## 🚨 Troubleshooting

### Quick Diagnostics

```bash
# Check system health
make health

# View comprehensive status
make status

# Check all logs
make logs

# Debug mode
DEBUG=mcp:* make dev
```

### Common Issues

**Servers won't start**
- Check that the command and args are correct in your configuration
- Verify environment variables and working directory paths
- Look at the logs for specific error messages
- Ensure proper file permissions

```bash
# Debug server startup
make logs
# or
docker-compose logs mcp-hot-reload
```

**Configuration not reloading**
- Ensure the configuration file path is correct
- Check file permissions (should be readable by the process)
- Verify JSON syntax is valid
- Watch for filesystem events:

```bash
# Test file watching
DEBUG=mcp:watcher make dev
```

**Web interface not accessible**
- Confirm port 3001 is available
- Check firewall settings
- Try accessing via `127.0.0.1:3001` instead of `localhost`
- Verify container networking:

```bash
# Check port binding
docker ps
netstat -tulpn | grep 3001
```

**Docker Issues**

*Container won't start:*
```bash
# Check container logs
docker logs mcp-hot-reload

# Inspect container
docker inspect mcp-hot-reload

# Check resource usage
docker stats
```

*Volume mounting problems:*
```bash
# Verify volume mounts
docker inspect mcp-hot-reload | grep -A 10 "Mounts"

# Check file permissions
ls -la ~/.config/claude-desktop/
```

*Network connectivity:*
```bash
# Test container networking
docker exec -it mcp-hot-reload curl http://localhost:3001/api/servers

# Check docker-compose network
docker network ls
```

**Process Management Issues**

*Processes not stopping cleanly:*
- Some servers may need custom shutdown procedures
- Check if processes are holding onto resources
- Use process monitoring:

```bash
# Find stuck processes
ps aux | grep mcp
pgrep -f "mcp-hot-reload"

# Force cleanup
make stop
pkill -f "mcp-hot-reload"
```

*Memory/CPU issues:*
```bash
# Monitor resource usage
top -p $(pgrep -f "mcp-hot-reload")

# Docker resource monitoring
docker stats mcp-hot-reload
```

### Debug Mode

Enable detailed logging:

```bash
# Application debug
DEBUG=mcp:* make dev

# Specific components
DEBUG=mcp:server,mcp:watcher make dev

# Docker with debug
docker-compose up -d && docker-compose logs -f
```

### Log Analysis

**Log Locations:**
- **Development**: Console output
- **Docker**: `docker-compose logs`
- **Production**: `./logs/mcp-manager.log`
- **System**: `journalctl -u mcp-hot-reload` (systemd)

**Log Levels:**
```bash
# Set log level
MCP_LOG_LEVEL=debug make dev

# Available levels: error, warn, info, debug, trace
```

**Common Log Patterns:**
```bash
# Server startup issues
grep "Failed to start" logs/mcp-manager.log

# Configuration problems
grep "Configuration error" logs/mcp-manager.log

# Network issues
grep "ECONNREFUSED\|ENOTFOUND" logs/mcp-manager.log
```

### Performance Troubleshooting

**High CPU usage:**
```bash
# Profile the application
NODE_ENV=development node --prof mcp-hot-reload.js
node --prof-process isolate-*.log > processed.txt
```

**Memory leaks:**
```bash
# Monitor memory usage
NODE_ENV=development node --trace-gc mcp-hot-reload.js

# Heap snapshots
kill -USR2 $(pgrep -f "mcp-hot-reload")
```

**File descriptor limits:**
```bash
# Check limits
ulimit -n

# Increase limits (temporary)
ulimit -n 4096
```

### Configuration Validation

**Validate Claude Desktop config:**
```bash
# Check JSON syntax
python -m json.tool ~/.config/claude-desktop/claude_desktop_config.json

# Validate MCP server configs
node -e "
const config = require(process.env.HOME + '/.config/claude-desktop/claude_desktop_config.json');
console.log('Valid config:', !!config.mcpServers);
Object.entries(config.mcpServers || {}).forEach(([name, cfg]) => {
  console.log(\`\${name}: \${cfg.command} \${(cfg.args || []).join(' ')}\`);
});
"
```

### Recovery Procedures

**Reset everything:**
```bash
# Stop all services
make down

# Clean all resources
make clean-all

# Restart fresh
make install
make up
```

**Backup and restore config:**
```bash
# Backup configuration
cp ~/.config/claude-desktop/claude_desktop_config.json \
   ~/.config/claude-desktop/claude_desktop_config.json.backup

# Restore from backup
cp ~/.config/claude-desktop/claude_desktop_config.json.backup \
   ~/.config/claude-desktop/claude_desktop_config.json
```

### Getting Help

**Check system information:**
```bash
make info
node --version
docker --version
docker-compose --version
```

**Collect debug information:**
```bash
# Generate debug report
{
  echo "=== System Info ==="
  make info
  echo "=== Status ==="
  make status 2>&1 || echo "Status check failed"
  echo "=== Recent Logs ==="
  make logs --tail=50 2>&1 || echo "No logs available"
  echo "=== Configuration ==="
  cat ~/.config/claude-desktop/claude_desktop_config.json 2>&1 || echo "Config not found"
} > debug-report.txt
```

## 🤝 Contributing

We welcome contributions! This project follows modern development practices with comprehensive tooling for quality and collaboration.

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/yourusername/mcp-hot-reload.git
cd mcp-hot-reload

# Setup development environment
make install
make git-setup

# Start development
make dev

# Run tests
make test
```

### Development Workflow

1. **Setup**: Fork the repository and clone locally
2. **Branch**: Create a feature branch: `git checkout -b feature/amazing-feature`
3. **Develop**: Make changes with hot reload: `make dev`
4. **Test**: Ensure all tests pass: `make test`
5. **Quality**: Check code quality: `make lint format`
6. **Commit**: Use conventional commits: `git commit -m 'feat: add amazing feature'`
7. **Push**: Push to your branch: `git push origin feature/amazing-feature`
8. **PR**: Open a Pull Request with detailed description

### Code Standards

**Automated Quality Checks:**
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent formatting (runs on save)
- **Husky**: Pre-commit hooks ensure quality
- **Jest**: Comprehensive test coverage (>80%)
- **Docker**: Containerized testing for consistency

**Manual Review Process:**
- Code review required for all PRs
- CI/CD pipeline must pass
- Documentation updates for new features
- Backward compatibility maintained

### Testing Guidelines

```bash
# Run full test suite
make test

# Watch mode during development
make test-watch

# Coverage report
make test-coverage

# Integration tests
npm run test:integration

# Docker testing
make docker-build && make test
```

**Test Types:**
- **Unit Tests**: Individual function/class testing
- **Integration Tests**: Component interaction testing
- **API Tests**: REST endpoint validation
- **E2E Tests**: Complete user workflow testing
- **Docker Tests**: Container functionality verification

### Documentation

**Code Documentation:**
- JSDoc comments for all public APIs
- Inline comments for complex logic
- README updates for new features
- API documentation generation

**Examples and Guides:**
- Add examples to `examples/` directory
- Update troubleshooting for new issues
- Create tutorials for complex features

### Commit Message Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```bash
feat: add server auto-discovery
fix: resolve memory leak in file watcher
docs: update API documentation
style: format code with prettier
refactor: simplify server management logic
test: add integration tests for hot reload
chore: update dependencies
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes  
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

### Release Process

**Versioning:**
- Follow [Semantic Versioning](https://semver.org/)
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

**Release Steps:**
```bash
# Update version
npm version patch|minor|major

# Create release
make release

# Deploy to registry
make deploy
```

### Issue Guidelines

**Bug Reports:**
- Use the bug report template
- Include steps to reproduce
- Provide system information
- Add relevant logs/screenshots

**Feature Requests:**
- Use the feature request template
- Describe the use case clearly
- Consider backward compatibility
- Discuss implementation approach

### Community Guidelines

**Code of Conduct:**
- Be respectful and inclusive
- Constructive feedback only
- Help newcomers get started
- Follow project conventions

**Communication:**
- Use GitHub Issues for bugs/features
- Use GitHub Discussions for questions
- Join community chat for real-time help
- Follow project announcements

### Development Environment

**Recommended Setup:**
- **VS Code** with recommended extensions
- **Node.js 18+** with npm 8+
- **Docker** for containerized development
- **Git** with conventional commit setup

**VS Code Extensions:**
- ESLint
- Prettier
- Docker
- GitLens
- Thunder Client (API testing)

### Architecture Guidelines

**Code Organization:**
- Modular design with clear separation
- Event-driven architecture for extensibility
- Minimal dependencies
- Performance-conscious implementations

**Adding New Features:**
- Design document for major features
- Backward compatibility consideration
- Test coverage requirements
- Documentation updates

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

