# Quick Start Guide

Welcome to **hzn-cli** (Open Horizon CLI Toolkit)! This guide will help you get started with managing Open Horizon edge agents and services in minutes.

## What is hzn-cli?

hzn-cli is a command-line toolkit that simplifies Open Horizon/IEAM edge computing deployments. It helps you:
- Deploy and manage edge agents
- Publish and register services
- Configure policies and patterns
- Handle Model Management Service (MMS) operations
- Manage Kubernetes-based mesh deployments

## Prerequisites

Before you begin, ensure you have:
- **Docker** installed and running
- **Node.js** (v14 or later) and npm
- Network connectivity to your Open Horizon Management Hub
- Valid credentials (API key or user authentication)

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g hzn-cli
```

### Option 2: Install from Source

```bash
git clone https://github.com/playground/hzn-cli.git
cd hzn-cli
npm install
npm run build
npm install -g
```

### Verify Installation

```bash
oh --help
```

You should see the main help menu with available commands.

## Initial Configuration

### Step 1: Create Configuration File

Create a configuration file (e.g., `config.json`) with your Open Horizon environment details:

```json
{
  "org": {
    "HZN_ORG_ID": "myorg",
    "HZN_EXCHANGE_USER_AUTH": "iamapikey:your-api-key-here",
    "HZN_EXCHANGE_URL": "http://your-hub.example.com:3090/v1",
    "HZN_FSS_CSSURL": "http://your-hub.example.com:9443/",
    "HZN_DEVICE_ID": "my-edge-device",
    "HZN_DEVICE_TOKEN": "my-device-token"
  },
  "service": {
    "SERVICE_NAME": "my-service",
    "SERVICE_VERSION": "1.0.0"
  },
  "local": {
    "YOUR_DOCKERHUB_ID": "your-dockerhub-username",
    "DOCKER_REGISTRY": "hub.docker.com"
  }
}
```

### Step 2: Interactive Setup

Alternatively, run the interactive setup wizard:

```bash
oh deploy setup
```

This will prompt you for all required configuration values and create the necessary configuration files.

## Quick Start Scenarios

### Scenario 1: Deploy a Containerized Agent (Easiest)

Perfect for development and testing.

```bash
# Run automatic setup with your config file
oh deploy autoSetupContainer --config_file config.json

# Verify agent is running
oh deploy listNode
```

This will:
- Install CLI tools in a container
- Deploy Anax agent in a container
- Register the agent with your Management Hub

### Scenario 2: Deploy Agent Directly on Host

For production edge devices.

```bash
# Install and configure agent on host
oh deploy autoSetupCliOnly --config_file config.json

# Verify installation
oh deploy showHznInfo
oh deploy checkConfigState
```

### Scenario 3: All-In-One Development Environment

Complete stack on a single machine for development.

```bash
# Deploy Management Hub + Agent + CLI
oh deploy autoSetupAllInOne --config_file config.json

# This installs everything locally - perfect for testing!
```

### Scenario 4: Kubernetes Mesh Deployment

For Kubernetes edge clusters.

```bash
# Deploy with K3S (lightweight)
oh deploy autoSetupOpenHorizonMesh --config_file config.json --k8s K3S

# Or with full Kubernetes
oh deploy autoSetupOpenHorizonMesh --config_file config.json --k8s K8S

# List mesh agents
oh deploy meshPodList
```

## Working with Services

### Publish a Service

1. **Build your service image:**

```bash
oh deploy buildServiceImage
```

2. **Push to registry:**

```bash
oh deploy pushServiceImage
```

3. **Publish service definition:**

```bash
oh deploy publishService
```

4. **Publish pattern:**

```bash
oh deploy publishPattern
```

Or do all steps at once:

```bash
oh deploy buildPublishAndRegister
```

### Register Agent with Service Pattern

```bash
oh deploy registerAgent
```

### Verify Service Deployment

```bash
# Check agreements
oh deploy listAgreement

# List running services
oh deploy listService

# Watch agreement formation
oh deploy listAgreement --watch true
```

## Working with Policies

Policies provide dynamic service placement based on constraints and properties.

### Add Node Policy

```bash
oh deploy addPolicy
```

This defines capabilities and properties of your edge node.

### Add Deployment Policy

```bash
oh deploy addDeploymentPolicy
```

This defines where and how services should be deployed.

### Check Policy Compatibility

```bash
oh deploy deployCheck --name my-deployment-policy
```

## Model Management Service (MMS)

MMS enables over-the-air updates of models and configuration files.

### Publish MMS Object

```bash
# Publish with pattern
oh deploy publishMMSObjectPattern --object=/path/to/model.zip

# Or publish with policy
oh deploy publishMMSObjectPolicy --object=/path/to/model.zip
```

### List MMS Objects

```bash
oh deploy listObject
```

### Remove MMS Object

```bash
oh deploy removeObject
```

## Common Commands

### Agent Status

```bash
# Check if agent is configured
oh deploy isConfigured

# View configuration state
oh deploy checkConfigState

# Show Horizon info
oh deploy showHznInfo

# List node details
oh deploy listNode
```

### Service Management

```bash
# List all services
oh deploy listAllServices

# List specific service
oh deploy listService --name my-service

# Remove service
oh deploy removeService --name my-service --org myorg
```

### Agreement Management

```bash
# List agreements
oh deploy listAgreement

# List with specific node
oh deploy listNode --name my-device-id
```

### Unregister Agent

```bash
# Unregister and remove services
oh deploy unregisterAgent

# For mesh agents
oh deploy unregisterMeshAgent
```

### Cleanup

```bash
# Uninstall Horizon
oh deploy uninstallHorizon

# Remove containers
oh deploy stopRemoveContainer

# Complete cleanup
oh deploy cleanUp
```

## Troubleshooting

### Agent Not Registering

```bash
# Check configuration
oh deploy checkConfigState

# Verify connectivity
oh deploy showHznInfo

# Review node status
oh deploy listNode
```

### Service Not Deploying

```bash
# Check agreements
oh deploy listAgreement

# Review service definition
oh deploy reviewServiceDefinition

# Check policy compatibility
oh deploy deployCheck --name my-policy
```

### View Logs

**Containerized Agent:**
```bash
docker logs horizon1
```

**Host Agent:**
```bash
journalctl -u horizon -f
```

**Mesh Agent:**
```bash
oh deploy meshAgentEventLog --name agent-pod-name
```

## Next Steps

Now that you have the basics:

1. **Read the full documentation:** Check out [AGENTS.md](./AGENTS.md) for detailed agent architecture and deployment patterns
2. **Explore service development:** Learn how to build and publish your own edge services
3. **Implement policies:** Set up policy-based deployment for dynamic service placement
4. **Configure MMS:** Enable over-the-air updates for your edge deployments

## Getting Help

```bash
# Main help
oh --help

# Deploy command help
oh deploy --help

# List all available actions
oh deploy <action>
```

### Available Actions

The CLI provides 80+ actions including:
- Agent setup and configuration
- Service publishing and management
- Policy configuration (node, deployment, service)
- Pattern management
- MMS operations
- Kubernetes mesh deployment
- Troubleshooting utilities

### Support

- **GitHub Issues:** https://github.com/playground/hzn-cli/issues
- **Email:** ljeff@us.ibm.com
- **Documentation:** [AGENTS.md](./AGENTS.md)

## Example Workflow

Here's a complete workflow from setup to deployment:

```bash
# 1. Install CLI
npm install -g hzn-cli

# 2. Setup configuration
oh deploy setup

# 3. Deploy containerized agent
oh deploy autoSetupContainer --config_file config.json

# 4. Verify agent is registered
oh deploy listNode

# 5. Build and publish your service
oh deploy buildServiceImage
oh deploy pushServiceImage
oh deploy publishService
oh deploy publishPattern

# 6. Register agent with service
oh deploy registerAgent

# 7. Watch agreement formation
oh deploy listAgreement --watch true

# 8. Verify service is running
oh deploy listService
```

## Configuration Reference

### Essential Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HZN_ORG_ID` | Your organization ID | `myorg` |
| `HZN_EXCHANGE_USER_AUTH` | Authentication credentials | `iamapikey:xxxxx` |
| `HZN_EXCHANGE_URL` | Exchange API endpoint | `http://hub:3090/v1` |
| `HZN_FSS_CSSURL` | CSS/MMS endpoint | `http://hub:9443/` |
| `HZN_DEVICE_ID` | Unique device identifier | `my-edge-device` |
| `HZN_DEVICE_TOKEN` | Device registration token | `my-token` |

### Service Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVICE_NAME` | Service name | `my-service` |
| `SERVICE_VERSION` | Service version | `1.0.0` |
| `SERVICE_CONTAINER_NAME` | Container name | `my-service-container` |
| `DOCKER_REGISTRY` | Docker registry | `hub.docker.com` |

## Tips and Best Practices

1. **Use containerized agents for development** - Easier to manage and clean up
2. **Start with patterns** - Simpler than policies for initial deployments
3. **Verify connectivity first** - Use `oh deploy showHznInfo` before registration
4. **Watch agreement formation** - Use `--watch true` flag to monitor real-time
5. **Keep device IDs unique** - Each agent needs a unique identifier
6. **Use configuration files** - Store your config in version control (without secrets!)
7. **Test locally first** - Use `autoSetupAllInOne` for development
8. **Monitor regularly** - Check agreements and service status periodically

---

**Ready to get started?** Install hzn-cli and run your first agent deployment today!

```bash
npm install -g hzn-cli
oh deploy setup
oh deploy autoSetupContainer --config_file config.json
```

Happy edge computing!
