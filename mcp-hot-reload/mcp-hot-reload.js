// MCP Server Hot Reload System
// This system provides hot reloading and management for MCP servers

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const chokidar = require('chokidar');
const EventEmitter = require('events');

class MCPServerManager extends EventEmitter {
  constructor(configPath = '~/.config/claude-desktop/claude_desktop_config.json') {
    super();
    this.configPath = path.expanduser(configPath);
    this.servers = new Map();
    this.watchers = new Map();
    this.config = null;
    this.isEnabled = true;
    
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.setupConfigWatcher();
    this.startAllServers();
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  async loadConfig() {
    try {
      const configData = await fs.promises.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('✅ Configuration loaded successfully');
      this.emit('configLoaded', this.config);
    } catch (error) {
      console.error('❌ Failed to load configuration:', error.message);
      this.config = { mcpServers: {} };
    }
  }

  setupConfigWatcher() {
    const watcher = chokidar.watch(this.configPath, {
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async () => {
      console.log('🔄 Configuration file changed, reloading...');
      await this.hotReload();
    });

    console.log('👀 Watching configuration file for changes');
  }

  async hotReload() {
    const oldConfig = { ...this.config };
    await this.loadConfig();
    
    if (!this.config.mcpServers) return;

    // Stop removed servers
    for (const [name, serverInfo] of this.servers) {
      if (!this.config.mcpServers[name]) {
        console.log(`🛑 Stopping removed server: ${name}`);
        await this.stopServer(name);
      }
    }

    // Start or restart modified servers
    for (const [name, serverConfig] of Object.entries(this.config.mcpServers)) {
      if (!oldConfig.mcpServers || 
          JSON.stringify(oldConfig.mcpServers[name]) !== JSON.stringify(serverConfig)) {
        console.log(`🔄 Restarting modified server: ${name}`);
        await this.restartServer(name);
      } else if (!this.servers.has(name)) {
        console.log(`🚀 Starting new server: ${name}`);
        await this.startServer(name, serverConfig);
      }
    }

    this.emit('hotReload', { oldConfig, newConfig: this.config });
  }

  async startServer(name, config) {
    if (!this.isEnabled) return;
    
    try {
      const { command, args = [], env = {}, cwd } = config;
      
      const serverProcess = spawn(command, args, {
        cwd: cwd || process.cwd(),
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const serverInfo = {
        process: serverProcess,
        config,
        status: 'starting',
        startTime: new Date(),
        restartCount: 0
      };

      this.servers.set(name, serverInfo);

      serverProcess.on('spawn', () => {
        serverInfo.status = 'running';
        console.log(`✅ Server "${name}" started (PID: ${serverProcess.pid})`);
        this.emit('serverStarted', { name, pid: serverProcess.pid });
      });

      serverProcess.on('error', (error) => {
        serverInfo.status = 'error';
        console.error(`❌ Server "${name}" error:`, error.message);
        this.emit('serverError', { name, error });
      });

      serverProcess.on('exit', (code, signal) => {
        serverInfo.status = 'stopped';
        console.log(`🛑 Server "${name}" exited (code: ${code}, signal: ${signal})`);
        this.servers.delete(name);
        this.emit('serverStopped', { name, code, signal });
        
        // Auto-restart on unexpected exit
        if (code !== 0 && signal !== 'SIGTERM' && this.isEnabled) {
          setTimeout(() => this.autoRestart(name, config), 2000);
        }
      });

      // Pipe output for debugging
      serverProcess.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`[${name}] ${data.toString().trim()}`);
      });

    } catch (error) {
      console.error(`❌ Failed to start server "${name}":`, error.message);
      this.emit('serverError', { name, error });
    }
  }

  async stopServer(name) {
    const serverInfo = this.servers.get(name);
    if (!serverInfo) return;

    try {
      serverInfo.status = 'stopping';
      serverInfo.process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.servers.has(name)) {
          serverInfo.process.kill('SIGKILL');
        }
      }, 5000);
      
    } catch (error) {
      console.error(`❌ Failed to stop server "${name}":`, error.message);
    }
  }

  async restartServer(name) {
    const config = this.config.mcpServers[name];
    if (!config) return;

    await this.stopServer(name);
    
    // Wait for process to fully stop
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await this.startServer(name, config);
  }

  async autoRestart(name, config) {
    const serverInfo = this.servers.get(name);
    if (serverInfo && serverInfo.restartCount < 3) {
      serverInfo.restartCount++;
      console.log(`🔄 Auto-restarting "${name}" (attempt ${serverInfo.restartCount}/3)`);
      await this.startServer(name, config);
    } else {
      console.error(`❌ Server "${name}" failed to restart after 3 attempts`);
    }
  }

  async startAllServers() {
    if (!this.config.mcpServers) return;
    
    console.log('🚀 Starting all MCP servers...');
    for (const [name, config] of Object.entries(this.config.mcpServers)) {
      await this.startServer(name, config);
    }
  }

  async stopAllServers() {
    console.log('🛑 Stopping all MCP servers...');
    const stopPromises = Array.from(this.servers.keys()).map(name => this.stopServer(name));
    await Promise.all(stopPromises);
  }

  toggleServer(name, enabled) {
    if (enabled && !this.servers.has(name)) {
      const config = this.config.mcpServers[name];
      if (config) {
        this.startServer(name, config);
      }
    } else if (!enabled && this.servers.has(name)) {
      this.stopServer(name);
    }
  }

  getServerStatus() {
    const status = {};
    for (const [name, info] of this.servers) {
      status[name] = {
        status: info.status,
        pid: info.process?.pid,
        startTime: info.startTime,
        restartCount: info.restartCount
      };
    }
    return status;
  }

  async updateServerConfig(name, newConfig) {
    const updatedConfig = { ...this.config };
    if (!updatedConfig.mcpServers) {
      updatedConfig.mcpServers = {};
    }
    
    updatedConfig.mcpServers[name] = newConfig;
    
    try {
      await fs.promises.writeFile(this.configPath, JSON.stringify(updatedConfig, null, 2));
      console.log(`✅ Updated configuration for server "${name}"`);
    } catch (error) {
      console.error(`❌ Failed to update configuration:`, error.message);
      throw error;
    }
  }

  async removeServer(name) {
    await this.stopServer(name);
    
    const updatedConfig = { ...this.config };
    if (updatedConfig.mcpServers) {
      delete updatedConfig.mcpServers[name];
    }
    
    try {
      await fs.promises.writeFile(this.configPath, JSON.stringify(updatedConfig, null, 2));
      console.log(`✅ Removed server "${name}" from configuration`);
    } catch (error) {
      console.error(`❌ Failed to remove server configuration:`, error.message);
      throw error;
    }
  }

  enable() {
    this.isEnabled = true;
    this.startAllServers();
  }

  disable() {
    this.isEnabled = false;
    this.stopAllServers();
  }

  async shutdown() {
    console.log('🔄 Shutting down MCP Server Manager...');
    this.isEnabled = false;
    
    // Stop all watchers
    for (const watcher of this.watchers.values()) {
      await watcher.close();
    }
    
    await this.stopAllServers();
    console.log('✅ MCP Server Manager shut down successfully');
  }
}

// CLI Interface
class MCPServerCLI {
  constructor(manager) {
    this.manager = manager;
    this.setupCommands();
  }

  setupCommands() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'mcp> '
    });

    rl.prompt();

    rl.on('line', (line) => {
      const [command, ...args] = line.trim().split(' ');
      this.handleCommand(command, args);
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('Goodbye!');
      this.manager.shutdown();
      process.exit(0);
    });
  }

  async handleCommand(command, args) {
    try {
      switch (command) {
        case 'status':
          this.showStatus();
          break;
        case 'restart':
          if (args[0]) {
            await this.manager.restartServer(args[0]);
            console.log(`🔄 Restarted server: ${args[0]}`);
          } else {
            console.log('Usage: restart <server-name>');
          }
          break;
        case 'stop':
          if (args[0]) {
            await this.manager.stopServer(args[0]);
            console.log(`🛑 Stopped server: ${args[0]}`);
          } else {
            console.log('Usage: stop <server-name>');
          }
          break;
        case 'start':
          if (args[0]) {
            const config = this.manager.config.mcpServers[args[0]];
            if (config) {
              await this.manager.startServer(args[0], config);
              console.log(`🚀 Started server: ${args[0]}`);
            } else {
              console.log(`❌ Server "${args[0]}" not found in configuration`);
            }
          } else {
            console.log('Usage: start <server-name>');
          }
          break;
        case 'toggle':
          if (args[0] && args[1]) {
            const enabled = args[1] === 'on';
            this.manager.toggleServer(args[0], enabled);
            console.log(`${enabled ? '✅' : '❌'} Toggled server "${args[0]}" ${enabled ? 'on' : 'off'}`);
          } else {
            console.log('Usage: toggle <server-name> <on|off>');
          }
          break;
        case 'reload':
          await this.manager.hotReload();
          console.log('🔄 Configuration reloaded');
          break;
        case 'enable':
          this.manager.enable();
          console.log('✅ MCP Server Manager enabled');
          break;
        case 'disable':
          this.manager.disable();
          console.log('❌ MCP Server Manager disabled');
          break;
        case 'help':
          this.showHelp();
          break;
        default:
          console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
      }
    } catch (error) {
      console.error(`❌ Error executing command:`, error.message);
    }
  }

  showStatus() {
    const status = this.manager.getServerStatus();
    console.log('\n📊 MCP Server Status:');
    console.log('═'.repeat(50));
    
    if (Object.keys(status).length === 0) {
      console.log('No servers running');
      return;
    }

    for (const [name, info] of Object.entries(status)) {
      const statusIcon = info.status === 'running' ? '✅' : 
                        info.status === 'error' ? '❌' : 
                        info.status === 'starting' ? '🔄' : '⭕';
      
      console.log(`${statusIcon} ${name}`);
      console.log(`   Status: ${info.status}`);
      console.log(`   PID: ${info.pid || 'N/A'}`);
      console.log(`   Started: ${info.startTime?.toLocaleString() || 'N/A'}`);
      console.log(`   Restarts: ${info.restartCount}`);
      console.log('');
    }
  }

  showHelp() {
    console.log(`
📖 MCP Server Manager Commands:
═════════════════════════════════
status                 - Show status of all servers
start <name>          - Start a specific server
stop <name>           - Stop a specific server
restart <name>        - Restart a specific server
toggle <name> <on|off> - Toggle server on/off
reload                - Reload configuration
enable                - Enable the manager
disable               - Disable the manager
help                  - Show this help message
`);
  }
}

// Web Interface (Express.js)
function createWebInterface(manager) {
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // API endpoints
  app.get('/api/servers', (req, res) => {
    res.json(manager.getServerStatus());
  });

  app.post('/api/servers/:name/restart', async (req, res) => {
    try {
      await manager.restartServer(req.params.name);
      res.json({ success: true, message: `Server ${req.params.name} restarted` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/servers/:name/toggle', async (req, res) => {
    try {
      const { enabled } = req.body;
      manager.toggleServer(req.params.name, enabled);
      res.json({ success: true, message: `Server ${req.params.name} ${enabled ? 'enabled' : 'disabled'}` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/reload', async (req, res) => {
    try {
      await manager.hotReload();
      res.json({ success: true, message: 'Configuration reloaded' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return app;
}

// Usage Example
async function main() {
  const manager = new MCPServerManager();
  
  // Setup event listeners
  manager.on('serverStarted', ({ name, pid }) => {
    console.log(`🎉 Server "${name}" is now running with PID ${pid}`);
  });

  manager.on('serverError', ({ name, error }) => {
    console.log(`💥 Server "${name}" encountered an error: ${error.message}`);
  });

  manager.on('hotReload', () => {
    console.log('🔥 Hot reload completed!');
  });

  // Start CLI interface
  new MCPServerCLI(manager);

  // Start web interface (optional)
  const app = createWebInterface(manager);
  const server = app.listen(3001, () => {
    console.log('🌐 Web interface available at http://localhost:3001');
  });

  return { manager, server };
}

// Export for use as module
module.exports = {
  MCPServerManager,
  MCPServerCLI,
  createWebInterface,
  main
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}