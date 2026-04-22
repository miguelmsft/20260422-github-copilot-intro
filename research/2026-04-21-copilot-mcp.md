# Research Report: Model Context Protocol (MCP) in GitHub Copilot (April 2026)

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-mcp
**Sources consulted:** 20 web pages, 3 GitHub repositories

---

## Executive Summary

The **Model Context Protocol (MCP)** is an open standard — originally announced by Anthropic on November 25, 2024 ([Anthropic announcement](https://www.anthropic.com/news/model-context-protocol)) — that defines a common way for AI applications to pull context and invoke tools from external systems. GitHub Copilot now supports MCP across its major surfaces — IDEs, the GitHub Copilot CLI, and the GitHub.com cloud/coding agent — making MCP "[the] primary way to extend Copilot's agentic capabilities" per GitHub's docs ([About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp)). The official MCP docs describe MCP as "[a] USB-C port for AI applications" ([modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro)) — a single standardized connector replacing a proliferation of bespoke integrations.

Architecturally, MCP is a JSON-RPC 2.0 protocol between a **host** (the AI app, e.g. VS Code + Copilot), an **MCP client** it spawns per server, and an **MCP server** exposing three primitive capability types: **tools**, **resources**, and **prompts** ([MCP Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)). Transports are **stdio** for local servers and **Streamable HTTP** (with optional SSE) for remote servers ([MCP Transports](https://modelcontextprotocol.io/docs/concepts/transports)). Copilot surfaces vary in what they support: the GitHub Copilot CLI ships with the GitHub MCP server built in and supports local stdio, HTTP, and SSE servers ([Adding MCP servers for Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)); the cloud coding agent supports only the *tools* primitive, does not currently support OAuth-authenticated remote servers, and ships with the GitHub and Playwright MCP servers enabled by default ([Connect agents to external tools](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp); [MCP and the cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent)).

For a beginner the key takeaways are: (1) you configure MCP servers via small JSON files — `.vscode/mcp.json` in VS Code ([VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)), `~/.copilot/mcp-config.json` for the CLI ([CLI config dir reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)), or the repo's *Settings → Copilot → Coding agent → MCP configuration* on GitHub.com ([Connect agents to external tools](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)); (2) the hosted **GitHub MCP server** at `https://api.githubcopilot.com/mcp/` ([github/github-mcp-server](https://github.com/github/github-mcp-server)) exposes GitHub Issues, PRs, repos, Actions, code security, and more, grouped into "toolsets"; (3) an MCP server runs arbitrary code — Copilot therefore asks per-tool approval in interactive surfaces (VS Code and CLI, [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)) and **does not** ask for approval in the autonomous cloud agent, which is why GitHub "strongly recommend[s]" allowlisting specific read-only tools there ([Connect agents to external tools](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)).

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Key Concepts](#2-key-concepts)
- [3. Getting Started](#3-getting-started)
- [4. Core Usage: Adding MCP Servers in Each Copilot Surface](#4-core-usage-adding-mcp-servers-in-each-copilot-surface)
- [5. Configuration & Best Practices](#5-configuration--best-practices)
- [6. Advanced Topics](#6-advanced-topics)
- [7. Ecosystem & Alternatives](#7-ecosystem--alternatives)
- [8. Research Limitations](#8-research-limitations)
- [9. Complete Reference List](#9-complete-reference-list)

---

## 1. Overview

### What It Is

The Model Context Protocol is an open, vendor-neutral protocol that lets AI applications ("hosts") discover and call external **tools**, read external **resources**, and use external **prompts** through a uniform JSON-RPC interface ([MCP Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)). It was introduced by Anthropic in late 2024 ([Anthropic announcement](https://www.anthropic.com/news/model-context-protocol)). GitHub Docs lists adopters including Copilot, Claude, Cursor, Windsurf, Zed and others; the MCP site additionally shows SDKs for multiple languages ([About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp); [modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro)).

> "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems… Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems."
> — Source: [What is the Model Context Protocol (MCP)? — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro)

> "Today, we're open-sourcing the Model Context Protocol (MCP), a new standard for connecting AI assistants to the systems where data lives, including content repositories, business tools, and development environments."
> — Source: [Introducing the Model Context Protocol — Anthropic, Nov 25 2024](https://www.anthropic.com/news/model-context-protocol)

In the GitHub Copilot context:

> "The Model Context Protocol (MCP) is an open standard that defines how applications share context with large language models (LLMs)… You can use MCP to extend the capabilities of GitHub Copilot by integrating it with a wide range of existing tools and services. MCP works across all major Copilot surfaces—whether you're working in an IDE, using GitHub Copilot CLI, or delegating tasks to an agent on GitHub.com."
> — Source: [About Model Context Protocol (MCP) — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp)

### Why It Matters

Before MCP, every AI product had its own plugin format ("ChatGPT plugins", custom tools, etc.), forcing tool authors to re-implement each integration per host. MCP collapses that N×M problem: one MCP server works with *any* MCP-compatible client ([Introducing the Model Context Protocol — Anthropic](https://www.anthropic.com/news/model-context-protocol); [What is the Model Context Protocol (MCP)? — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro)). For Copilot users specifically, MCP is the official, supported way to:

- Give Copilot access to your private APIs, internal docs, databases, and SaaS tools such as Sentry, Notion, Atlassian, Azure, Cloudflare, and Azure DevOps — all shown as first-party cloud-agent examples in [Extend the coding agent with MCP — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp).
- Let Copilot Chat, Copilot CLI, and Copilot's autonomous cloud agent all share the same tool integrations ([About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp)).
- Expose GitHub itself (issues, PRs, Actions, code scanning, …) as callable tools via the hosted GitHub MCP server ([github/github-mcp-server](https://github.com/github/github-mcp-server); [About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp)).

### Key Features

- Open standard, language-agnostic (official SDKs listed on [modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro) include Python, TypeScript, Kotlin, Java, C#, Swift, Ruby, and Go).
- Three primitives: **tools**, **resources**, **prompts** (plus client-side primitives: sampling, elicitation, logging) — see [MCP Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture).
- Two standard transports: **stdio** (local subprocess) and **Streamable HTTP** (remote, with optional SSE streaming) — see [Transports](https://modelcontextprotocol.io/docs/concepts/transports).
- Capability negotiation at connection time, so clients and servers can advertise which features they support ([Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)).
- Supported across VS Code, Visual Studio, JetBrains IDEs, Xcode, Eclipse, GitHub Copilot CLI, and the GitHub Copilot cloud/coding agent, per [About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp); and across Claude Desktop, Cursor, Windsurf, Zed and others per the MCP site.

---

## 2. Key Concepts

### 2.1 Host, Client, Server

MCP uses a **host / client / server** topology. A host can have many clients; each client speaks to exactly one server.

> "MCP follows a client-server architecture where an MCP host — an AI application like Claude Code or Claude Desktop — establishes connections to one or more MCP servers. The MCP host accomplishes this by creating one MCP client for each MCP server. Each MCP client maintains a dedicated connection with its corresponding MCP server."
> — Source: [Architecture overview — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/learn/architecture)

- **Host**: The AI app coordinating everything. For us: VS Code + Copilot Chat, the `copilot` CLI, or the GitHub.com cloud agent runtime.
- **Client**: An in-host object that owns one connection to one server and negotiates capabilities with it.
- **Server**: A program that exposes tools/resources/prompts — runs either locally (stdio) or remotely (HTTP).

### 2.2 How MCP Plugs Into Copilot (Slide-Ready Diagram)

```
   ┌──────────────────────────── GitHub Copilot (host) ────────────────────────────┐
   │                                                                                │
   │   VS Code Chat / JetBrains / VS / Xcode      Copilot CLI        GitHub.com     │
   │         (interactive, asks approval)       (terminal agent)     cloud agent    │
   │                                                                                │
   │          ┌──── MCP Client A ────┐    ┌──── MCP Client B ────┐   ┌── Client C ──┐
   │          │ capabilities negotiated│    │                      │   │             │
   └──────────┼────────────────────────┼────┼──────────────────────┼───┼─────────────┼─
              │ stdio (JSON-RPC 2.0)   │    │ Streamable HTTP      │   │  http       │
              ▼                        ▼    ▼                      ▼   ▼
        ┌──────────┐              ┌──────────┐              ┌──────────────────────┐
        │ Local    │              │ Remote   │              │  GitHub MCP server   │
        │ MCP svr  │              │ MCP svr  │              │  api.githubcopilot   │
        │ (e.g.    │              │ (Sentry, │              │  .com/mcp/ (HTTP)    │
        │ Playwright│             │ Notion,  │              │  Tools: repos,       │
        │ fetch,   │              │ Atlassian│              │  issues, PRs, actions│
        │ filesys) │              │ , ...)   │              │  code_security, …    │
        └──────────┘              └──────────┘              └──────────────────────┘
              │                        │                               │
              ▼                        ▼                               ▼
        Local files /            SaaS API over               GitHub REST/GraphQL
        browser / shell          HTTPS + token/OAuth         (scoped by OAuth/PAT)
```
> — Source: Synthesized from [About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp), [MCP Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture), and [github/github-mcp-server](https://github.com/github/github-mcp-server) | Provenance: synthesized

The host decides which surfaces, primitives, and transports it supports; the server decides which tools it exposes.

### 2.3 Two Layers: Data and Transport

> "MCP consists of two layers:
> - **Data layer**: Defines the JSON-RPC based protocol for client-server communication, including lifecycle management, and core primitives, such as tools, resources, prompts and notifications.
> - **Transport layer**: Defines the communication mechanisms and channels that enable data exchange between clients and servers, including transport-specific connection establishment, message framing, and authorization."
> — Source: [Architecture overview — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/learn/architecture)

**Data layer**: JSON-RPC 2.0. After connecting, the client sends `initialize` to negotiate protocol version and capabilities, then uses methods like `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, `prompts/get`.

**Transport layer**:

> "MCP uses JSON-RPC to encode messages… The protocol currently defines two standard transport mechanisms for client-server communication:
> 1. stdio, communication over standard in and standard out
> 2. Streamable HTTP"
> — Source: [Transports — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/concepts/transports)

- **stdio**: Host launches the server as a subprocess and exchanges newline-delimited JSON-RPC over stdin/stdout. Best for local-only servers.
- **Streamable HTTP**: Single HTTP endpoint that accepts POST (requests) and GET (optional SSE stream for server → client messages). Replaces the older HTTP+SSE transport from protocol version 2024-11-05. The GitHub MCP server uses this at `https://api.githubcopilot.com/mcp/`.

### 2.4 Primitives (What Servers Expose)

> "MCP defines three core primitives that servers can expose:
> - **Tools**: Executable functions that AI applications can invoke to perform actions (e.g., file operations, API calls, database queries)
> - **Resources**: Data sources that provide contextual information to AI applications (e.g., file contents, database records, API responses)
> - **Prompts**: Reusable templates that help structure interactions with language models (e.g., system prompts, few-shot examples)"
> — Source: [Architecture overview — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/learn/architecture)

Each primitive has `*/list` (discover) and retrieval methods (`tools/call`, `resources/read`, `prompts/get`). Dynamic changes are announced with notifications like `tools/list_changed`.

Clients can also expose primitives back to servers: **sampling** (let server request a model completion from the host), **elicitation** (ask user for more input), and **logging**.

### 2.5 Lifecycle

Every session starts with an `initialize` handshake that negotiates protocol version and capabilities. As of this research, the MCP site's left-nav references a `2025-11-25` revision, but that revision was not deeply reviewed for this report (see Section 8); the request/response example below uses the `2025-06-18` protocol version string that appears in the Architecture overview example and is what most deployed hosts/servers currently negotiate. Treat the specific version literal as illustrative — real handshakes will carry whatever version the client and server agree on.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": { "elicitation": {} },
    "clientInfo": { "name": "example-client", "version": "1.0.0" }
  }
}
```
> — Source: [Architecture overview — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/learn/architecture) | Provenance: verbatim (version literal illustrative only; see Section 8)

---

## 3. Getting Started

### Prerequisites

- An active GitHub Copilot subscription (Free, Pro, Pro+, Business, or Enterprise — MCP is available on all tiers).
- For Business/Enterprise users: the **"MCP servers in Copilot"** policy must be enabled by an org or enterprise admin ([About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp)). Per the docs:

  > "Enterprises and organizations can choose to enable or disable use of MCP for members of their organization or enterprise with the **MCP servers in Copilot** policy. The policy is disabled by default… The MCP policy **only** applies to users who have a Copilot Business or Copilot Enterprise subscription… Copilot Free, Copilot Pro, or Copilot Pro+ **do not** have their MCP access governed by this policy."
  > — Source: [About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp)

- For VS Code: **Visual Studio Code 1.99 or later** (1.101+ recommended for remote MCP + OAuth), per [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers).
- For Visual Studio: **17.14 or later** is the minimum version called out by [About MCP — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp).
- For Copilot CLI: a recent `copilot` binary, installable via `npm i -g @github/copilot` ([Copilot CLI install — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-cli/install-copilot-cli)).
- For local servers you'll likely need **Node.js** (for `npx`-based servers like Playwright) and/or **Python + `uv`/`uvx`** (for servers like `mcp-server-fetch`), per [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers).

### Installation & Setup

#### Install a common MCP runtime

```bash
# Node + npx is needed for many MCP servers (e.g. Playwright, Azure DevOps MCP)
node --version        # should be >= 18
npm --version

# uv/uvx is the recommended Python runner for MCP servers
# (installs both tools)
pipx install uv       # or: curl -LsSf https://astral.sh/uv/install.sh | sh

# Sanity-check by running an official reference server
npx -y @modelcontextprotocol/server-memory
uvx mcp-server-fetch
```
> — Source: [modelcontextprotocol/servers README](https://github.com/modelcontextprotocol/servers) | Provenance: adapted

Reference commands come from [modelcontextprotocol/servers README](https://github.com/modelcontextprotocol/servers):

> "For example, this will start the Memory server: `npx -y @modelcontextprotocol/server-memory`… For example, this will start the Git server: `uvx mcp-server-git`"
> — Source: [modelcontextprotocol/servers — Getting Started](https://github.com/modelcontextprotocol/servers)

#### Install Copilot CLI

```bash
# Install (npm), then log in with the device flow
npm install -g @github/copilot
copilot login
```
> — Source: [Copilot CLI install — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-cli/install-copilot-cli) and [CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) | Provenance: adapted

> "`copilot login` [OPTION] | Authenticate with Copilot via the OAuth device flow."
> — Source: [Copilot CLI command reference — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

---

## 4. Core Usage: Adding MCP Servers in Each Copilot Surface

Copilot supports MCP on three surfaces, each with its own config location. The JSON shape is **very similar but not identical** across them — always read the surface-specific docs before copy-pasting.

### 4.1 VS Code (and other IDEs)

VS Code stores MCP config in `mcp.json`. Two scopes:

- **Workspace**: `.vscode/mcp.json` (commit to the repo so teammates get the same servers).
- **User**: `mcp.json` in your user profile, opened via the **MCP: Open User Configuration** command.

> "You can manually configure MCP servers by editing the `mcp.json` file. There are two locations for this file:
> - **Workspace**: create or open `.vscode/mcp.json` in your project. Include this file in source control to share MCP server configurations with your team.
> - **User profile**: run the **MCP: Open User Configuration** command to open the `mcp.json` file in your user profile folder."
> — Source: [Add and manage MCP servers in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)

Example `.vscode/mcp.json` with a remote (GitHub) and a local (Playwright) server:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/mcp-server-playwright"]
    }
  }
}
```
> — Source: [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) | Provenance: verbatim

GitHub's own doc shows a slightly different shape that includes an `inputs` block for secret prompts:

```jsonc
{
  "inputs": [
    { "type": "promptString" }
  ],
  "servers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```
> — Source: [Extending GitHub Copilot Chat with MCP servers — GitHub Docs](https://docs.github.com/en/copilot/how-tos/context/model-context-protocol/extending-copilot-chat-with-mcp) | Provenance: verbatim

After saving, click the **Start** CodeLens button above a server, open Copilot Chat, switch to **Agent** mode, and open the tool picker to see the newly-discovered tools. You can also browse/install servers by typing `@mcp` in the VS Code Extensions panel search (this uses the **GitHub MCP Registry**).

**Picking up an existing Claude Desktop config:** set `"chat.mcp.discovery.enabled": true` in `settings.json` and VS Code will reuse it.

**Install from the command line:**

```bash
code --add-mcp "{\"name\":\"my-server\",\"command\":\"uvx\",\"args\":[\"mcp-server-fetch\"]}"
```
> — Source: [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) | Provenance: verbatim

### 4.2 GitHub Copilot CLI

The CLI reads MCP servers from `~/.copilot/mcp-config.json` (user-level) and supports project-level overrides in `.mcp.json` or `.github/mcp.json`. The **GitHub MCP server is built in** — no config required.

> "The GitHub MCP server is built into Copilot CLI and is already available without any additional configuration. The steps below are for adding other MCP servers."
> — Source: [Adding MCP servers for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)

> "`mcp-config.json` — Defines MCP (Model Context Protocol) servers available at the user level. These servers are available in all your sessions, regardless of which project directory you're in. Project-level MCP configurations (in `.mcp.json` or `.github/mcp.json`) take precedence over user-level definitions when server names conflict."
> — Source: [Copilot CLI configuration directory — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)

Interactive management from inside the CLI:

```text
/mcp add                 # interactive add form (Local/STDIO, HTTP, SSE)
/mcp show                # list configured servers + status
/mcp show <server>       # details for one server
/mcp edit <server>       # edit configuration
/mcp delete <server>
/mcp disable <server>    # keep config but don't use this session
/mcp enable <server>
/mcp auth <server>       # run OAuth flow for remote server
/mcp reload
```
> — Source: [Copilot CLI command reference — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) | Provenance: adapted

Equivalent `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "local",
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {},
      "tools": ["*"]
    },
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": { "CONTEXT7_API_KEY": "YOUR-API-KEY" },
      "tools": ["*"]
    }
  }
}
```
> — Source: [Adding MCP servers for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) | Provenance: verbatim

**Key CLI flags** (all documented in the CLI command reference):

```bash
# Add an MCP server for this session only (JSON string or @file.json)
copilot --additional-mcp-config='{"mcpServers":{"fetch":{"type":"local","command":"uvx","args":["mcp-server-fetch"]}}}'
copilot --additional-mcp-config=@./my-mcp.json

# Widen or narrow the built-in GitHub MCP server
copilot --add-github-mcp-tool=get_file_contents --add-github-mcp-tool=list_issues
copilot --add-github-mcp-toolset=pull_requests --add-github-mcp-toolset=actions
copilot --enable-all-github-mcp-tools        # overrides the two above

# Disable MCP servers
copilot --disable-mcp-server=playwright
copilot --disable-builtin-mcps               # turn off the built-in github-mcp-server

# Pre-approve MCP tool calls (skips approval prompts)
copilot --allow-tool='MyMCP(create_issue)'   # one tool
copilot --allow-tool='MyMCP'                 # all tools from one server
```
> — Source: [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) | Provenance: verbatim

Representative flag descriptions from the same reference:

> "`--additional-mcp-config=JSON` | Add an MCP server for this session only. The server configuration can be supplied as a JSON string or a file path (prefix with `@`). Augments the configuration from `~/.copilot/mcp-config.json`. Overrides any installed MCP server configuration with the same name."
>
> "`--add-github-mcp-tool=TOOL` | Add a tool to enable for the GitHub MCP server, instead of the default CLI subset (can be used multiple times). Use `*` for all tools."
>
> "`--disable-builtin-mcps` | Disable all built-in MCP servers (currently: `github-mcp-server`)."
> — Source: [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

### 4.3 GitHub.com Copilot Cloud Agent (the "coding agent")

This is the autonomous Copilot that runs in GitHub Actions runners when you assign an issue or ask it to open a PR. MCP config lives at the **repository** level.

**Where:** *Repository → Settings → Copilot → Cloud agent → MCP configuration* (JSON textarea). Secrets referenced from MCP configs must be defined in a Copilot environment (`Settings → Environments → copilot`) and **must start with `COPILOT_MCP_`**.

**Default servers enabled for every task:**

> "The following MCP servers are configured automatically for Copilot cloud agent:
> - **GitHub**: The GitHub MCP server gives Copilot access to GitHub data like issues and pull requests… By default, the GitHub MCP server connects to GitHub using a specially scoped token that only has read-only access to the current repository.
> - **Playwright**: The Playwright MCP server gives Copilot access to web pages, including the ability to read, interact and take screenshots… By default, the Playwright MCP server is only able to access web resources hosted within Copilot's own environment, accessible on `localhost` or `127.0.0.1`."
> — Source: [MCP and GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent)

**Important constraints** unique to the cloud agent:

> "- Copilot cloud agent only supports tools provided by MCP servers. It does not support resources or prompts.
> - Copilot cloud agent does not currently support remote MCP servers that leverage OAuth for authentication and authorization."
> — Source: [Connect agents to external tools — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)

**Config schema (repo-level MCP configuration)** — this is a *schematic* example showing all optional keys in one place; it is not copy-paste runnable (the `type` value is a choice list, `args`/`url` are placeholders):

```jsonc
{
  "mcpServers": {
    "MY_SERVER": {
      // Choose ONE of: "local", "stdio", "http", or "sse"
      "type": "local",
      "command": "npx",
      "args": ["<package-or-script>"],
      "env": { "TOKEN": "$COPILOT_MCP_TOKEN" },
      "url": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer $COPILOT_MCP_TOKEN" },
      "tools": ["read_issue", "list_issues"]
    }
  }
}
```
> — Source: [Connect agents to external tools — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp) | Provenance: synthesized (schematic, not runnable)

> "**Required keys for local and remote MCP servers**
> - `tools` (`string[]`): The tools from the MCP server to enable… We strongly recommend that you allowlist specific read-only tools, since the agent will be able to use these tools autonomously and will not ask you for approval first. You can also enable all tools by including `*` in the array.
> - `type` (`string`): Copilot cloud agent accepts `"local"`, `"stdio"`, `"http"`, or `"sse"`."
> — Source: [Connect agents to external tools](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)

> "Warning: Once you've configured an MCP server, Copilot will be able to use the tools provided by the server autonomously, and will not ask for your approval before using them."
> — Source: [Connect agents to external tools](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)

**Example: widen the built-in GitHub MCP server for the cloud agent** (replaces the default read-only/current-repo behavior):

```jsonc
{
  "mcpServers": {
    "github-mcp-server": {
      "type": "http",
      // Remove "/readonly" to enable wider access to all tools.
      "url": "https://api.githubcopilot.com/mcp/readonly",
      "tools": ["*"],
      "headers": {
        "X-MCP-Toolsets": "repos,issues,users,pull_requests,code_security,secret_protection,actions,web_search"
      }
    }
  }
}
```
> — Source: [Connect agents to external tools — Customizing the built-in GitHub MCP server](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp) | Provenance: verbatim

If your MCP server needs a non-default runtime (e.g. `uv`, `pipx`), create a `copilot-setup-steps.yml` workflow to install it — see [Configure the development environment](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment).

**Validating:** Assign an issue to Copilot, open the resulting PR's session logs, expand the **Start MCP Servers** step — successfully started servers list their tools at the bottom.

---

## 5. Configuration & Best Practices

### 5.1 The Built-in GitHub MCP Server

The hosted GitHub MCP server is the single most important MCP server for Copilot users. Endpoint: `https://api.githubcopilot.com/mcp/`. For read-only use: `https://api.githubcopilot.com/mcp/readonly`.

**Available toolsets** (groups of related tools):

> "| Toolset | Description
> | `context` | **Strongly recommended**: Tools that provide context about the current user and GitHub context you are operating in
> | `actions` | GitHub Actions workflows and CI/CD operations
> | `code_security` | Code security related tools, such as GitHub Code Scanning
> | `copilot` | Copilot related tools
> | `dependabot` | Dependabot tools
> | `discussions` | GitHub Discussions related tools
> | `gists` | GitHub Gist related tools
> | `git` | GitHub Git API related tools for low-level Git operations
> | `issues` | GitHub Issues related tools
> | `labels` | GitHub Labels related tools
> | `notifications` | GitHub Notifications related tools
> | `orgs` | GitHub Organization related tools
> | `projects` | GitHub Projects related tools
> | `pull_requests` | GitHub Pull Request related tools
> | `repos` | GitHub Repository related tools
> | `secret_protection` | Secret protection related tools, such as GitHub Secret Scanning
> | `security_advisories` | Security advisories related tools
> | `stargazers` | GitHub Stargazers related tools
> | `users` | GitHub User related tools"
> — Source: [github/github-mcp-server README — Available Toolsets](https://github.com/github/github-mcp-server)

**Default toolset** (when you specify nothing):

> "The default configuration is:
> - context
> - repos
> - issues
> - pull_requests
> - users"
> — Source: [github/github-mcp-server README](https://github.com/github/github-mcp-server)

**Selecting toolsets** — for the remote server, use the `X-MCP-Toolsets` header (shown above). For the local binary or Docker image, use `--toolsets` or `GITHUB_TOOLSETS`:

```bash
github-mcp-server --toolsets repos,issues,pull_requests,actions,code_security
GITHUB_TOOLSETS="default,stargazers" ./github-mcp-server
```
> — Source: [github/github-mcp-server README](https://github.com/github/github-mcp-server) | Provenance: verbatim

### 5.2 Permission Model

- **VS Code / IDEs**: Every tool call prompts for approval; you can **Continue** once, always-allow for that server, or decline.
  > "If Copilot asks you to confirm that you want to proceed, click **Continue**."
  > — Source: [Extending GitHub Copilot Chat with MCP servers](https://docs.github.com/en/copilot/how-tos/context/model-context-protocol/extending-copilot-chat-with-mcp)

  VS Code also supports **sandboxing** stdio MCP servers on macOS/Linux via `"sandboxEnabled": true` plus `sandbox.filesystem.allowWrite` / `sandbox.network.allowedDomains`. Sandboxed tool calls are auto-approved. Sandboxing is **not available on Windows** yet ([Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)).

- **Copilot CLI**: Per-tool approval prompts by default. You can pre-approve at the command line with `--allow-tool='Server(tool)'`, `--allow-all-tools`, or `--allow-all`. The `/allow` slash command and the approval-response table list fine-grained options ([Copilot CLI command reference — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)).

- **Cloud agent**: No interactive approval — the agent runs non-interactively, so only tools listed in the `tools` array are callable; everything else is blocked. Strongly prefer allowlisting specific **read-only** tools ([Extend the coding agent with MCP — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp); [MCP and GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent)).

### 5.3 Common Pitfalls & Anti-Patterns

- **Running untrusted servers.** A local MCP server can execute arbitrary code.
  > "Local MCP servers can run arbitrary code on your machine. Only add servers from trusted sources, and review the publisher and server configuration before starting it."
  > — Source: [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- Putting the same server in both user and workspace config → VS Code explicitly warns against this; use one location per server ([Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)).
- Hardcoding secrets into `mcp.json`. Use VS Code `inputs` of type `promptString` / env vars ([Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)), or `COPILOT_MCP_*` secrets for the cloud agent ([Extend the coding agent with MCP — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)).
- Using `"tools": ["*"]` on a high-privilege server in the cloud agent. Write access to issues/PRs is silently autonomous ([Extend the coding agent with MCP — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)).
- Forgetting that the cloud agent's default GitHub MCP token is **read-only on the current repo**. To let the agent touch other repos, you must supply a PAT via `COPILOT_MCP_GITHUB_PERSONAL_ACCESS_TOKEN` in the `copilot` environment ([Extend the coding agent with MCP — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp); [MCP and GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent)).
- Expecting **resources** and **prompts** to work in the cloud agent — they don't. Tools only ([MCP and GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent)).
- Expecting OAuth-authenticated remote MCP servers to work in the cloud agent — they don't yet ([MCP and GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent); [Extend the coding agent with MCP — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)).

### 5.4 Recommended Configuration

For a beginner on VS Code, a sensible starting `.vscode/mcp.json` is:

```json
{
  "servers": {
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" },
    "playwright": { "command": "npx", "args": ["-y", "@microsoft/mcp-server-playwright"] },
    "fetch": { "command": "uvx", "args": ["mcp-server-fetch"] }
  }
}
```
> — Source: Derived from [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) and [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | Provenance: synthesized

---

## 6. Advanced Topics

### 6.1 Writing a Minimal MCP Server (Python)

The MCP Python SDK (`mcp` on PyPI) provides `FastMCP`, which turns Python type hints + docstrings into tool schemas automatically.

```python
# weather.py — a minimal stdio MCP server
# Source: https://modelcontextprotocol.io/quickstart/server (adapted)

from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"

async def make_nws_request(url: str) -> dict[str, Any] | None:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/geo+json"}
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(url, headers=headers, timeout=30.0)
            r.raise_for_status()
            return r.json()
        except Exception:
            return None

@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state.

    Args:
        state: Two-letter US state code (e.g. CA, NY)
    """
    data = await make_nws_request(f"{NWS_API_BASE}/alerts/active/area/{state}")
    if not data or not data.get("features"):
        return "No active alerts for this state."
    return "\n---\n".join(
        f'{f["properties"].get("event","?")} — {f["properties"].get("areaDesc","?")}'
        for f in data["features"]
    )

def main() -> None:
    mcp.run(transport="stdio")

if __name__ == "__main__":
    main()
```
> — Source: [Quickstart: build an MCP server — modelcontextprotocol.io](https://modelcontextprotocol.io/quickstart/server) | Provenance: adapted

Install and register:

```bash
# Install the SDK and http client
uv add "mcp[cli]" httpx
# Run (stdio)
uv run weather.py
```
> — Source: [Quickstart: build an MCP server — modelcontextprotocol.io](https://modelcontextprotocol.io/quickstart/server) and [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) | Provenance: adapted

Then in `.vscode/mcp.json` (replace `/abs/path/to/project` with the real path — this example is schematic):

```json
{
  "servers": {
    "weather": {
      "command": "uv",
      "args": ["--directory", "/abs/path/to/project", "run", "weather.py"]
    }
  }
}
```
> — Source: [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) | Provenance: synthesized (schematic)

### 6.2 Streamable HTTP Details & Security

> "Servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks… When running locally, servers **SHOULD** bind only to localhost (127.0.0.1) rather than all network interfaces (0.0.0.0)."
> — Source: [Transports — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/concepts/transports)

The current transport is **Streamable HTTP**; the older **HTTP+SSE** transport from protocol version 2024-11-05 is deprecated but still supported for backwards compatibility — Copilot CLI exposes both as separate `"sse"` and `"http"` server types, with `http` using Streamable HTTP.

### 6.3 Toolsets vs. Tools vs. Dynamic Toolsets (GitHub MCP server)

The local `github-mcp-server` binary supports three overlapping knobs:

- `--toolsets X,Y,Z` — enable entire groups.
- `--tools tool_a,tool_b` — add individual tools.
- `--dynamic-toolsets` — expose meta-tools (`enable_toolset`, `list_available_toolsets`, `get_toolset_tools`) that let the model *turn on* toolsets at runtime — useful when you don't know in advance what the model will need.

Combining them is additive. The special toolset `all` enables everything; `default` is `context, repos, issues, pull_requests, users`.

### 6.4 Cross-Surface Configuration Reuse

- VS Code → Cloud agent: take your `.vscode/mcp.json`, rename `servers` → `mcpServers`, drop `inputs`/`envFile` in favor of explicit `env`, and add a `tools` allowlist per server. See the official porting checklist in [Reusing your MCP configuration from VS Code](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp).
- Claude Desktop → VS Code: set `"chat.mcp.discovery.enabled": true`.
- VS Code → CLI: the CLI `mcpServers` shape is closest to the cloud agent's, so you'll often tweak `servers` → `mcpServers` and add `type` fields.

### 6.5 Troubleshooting

- **Server doesn't start.** In VS Code: run **MCP: List Servers** and check its logs. In the CLI: `/mcp show <name>` and `/env`. In the cloud agent: the **Start MCP Servers** log step.
- **Tools don't appear in the tool picker.** Confirm (a) the server actually started, (b) you're in **Agent** mode (VS Code), (c) your org policy allows MCP (Business/Enterprise).
- **Auth fails on remote server.** For the GitHub MCP server in VS Code, click **Auth** on the CodeLens above the server to run OAuth. For the cloud agent, remember OAuth is not supported — use a PAT and a `COPILOT_MCP_*` secret.
- **Secrets aren't reaching a cloud-agent MCP server.** Variable/secret names *must* start with `COPILOT_MCP_`; substitutions use `$VAR`, `${VAR}`, or `${VAR:-default}` per the cloud-agent doc.
- **Push protection blocks responses.** That's intentional — the GitHub MCP server is wrapped by secret-scanning push protection in public and GHAS-covered private repos.

---

## 7. Ecosystem & Alternatives

### 7.1 Popular MCP Servers for Beginners

Reference servers maintained by the MCP steering group (all live in `modelcontextprotocol/servers`):

> "🌟 Reference Servers
> - **Fetch** — Web content fetching and conversion for efficient LLM usage.
> - **Filesystem** — Secure file operations with configurable access controls.
> - **Git** — Tools to read, search, and manipulate Git repositories.
> - **Memory** — Knowledge graph-based persistent memory system.
> - **Sequential Thinking** — Dynamic and reflective problem-solving through thought sequences.
> - **Time** — Time and timezone conversion capabilities."
> — Source: [modelcontextprotocol/servers README](https://github.com/modelcontextprotocol/servers)

Widely-used third-party servers you'll see in the Copilot docs:

- **GitHub MCP server** (`github/github-mcp-server`) — the big one; hosted remote + local binary + Docker.
- **Playwright MCP** (`@microsoft/mcp-server-playwright` / `@playwright/mcp`) — browser automation. Built into the cloud agent.
- **Context7** — library/framework docs lookup.
- **Sentry**, **Notion**, **Azure DevOps**, **Atlassian (Jira/Confluence/Compass)**, **Cloudflare**, **Azure** — all have example cloud-agent configs in the GitHub docs.

Discovery: GitHub publishes a curated **GitHub MCP Registry** at `https://github.com/mcp`, browsable from inside VS Code by typing `@mcp` in the Extensions panel.

### 7.2 Alternatives / Adjacent Tech

- **OpenAI function calling / tool-calling**: model-level, not a protocol — you still have to write one integration per host.
- **ChatGPT plugins (deprecated for most use cases)** and **OpenAI's Apps SDK** — OpenAI-specific, not cross-host.
- **VS Code language extensions / tasks** — not AI-aware, purely editor extensibility.
- **Copilot Extensions (GitHub Apps)** — a GitHub-specific way to add skills to Copilot Chat on GitHub.com; useful for non-tool integrations and marketplace distribution, but MCP is now the recommended route for giving Copilot new tools cross-surface.

When to choose what: If you want one integration that works in VS Code, the CLI, the cloud agent, Claude Desktop, Cursor, and Windsurf, write an MCP server. If you want a marketplace-distributed GitHub-only experience with rich chat UI, a Copilot Extension may still fit better.

---

## 8. Research Limitations

- **No GitHub Blog / Changelog deep-read.** Attempts to fetch `github.blog/news-insights/…github-mcp-server-public-preview/` returned 404 (the canonical announcement URL has moved since publication); the changelog index page returned but is a navigation stub. Historical dates for specific Copilot-MCP milestones (preview → GA) are therefore taken only from current docs and not double-checked against the original blog announcements.
- **GA vs. preview status** is stated as it appears in the current docs (e.g., "GitHub MCP Registry is in public preview"). Preview status may have changed since last crawl.
- **Cloud-agent OAuth support** is documented as "not currently supported" — this is a moving target; always verify with the live docs before relying on it.
- **Surface coverage for non-VS Code IDEs** (JetBrains, Visual Studio proper, Xcode, Eclipse) was only spot-checked via the GitHub Docs "Extending Copilot Chat" page; behavior specifics (e.g., exact UI gestures, sandboxing) for those IDEs were not separately verified.
- **Windows sandboxing** for MCP servers in VS Code is explicitly unavailable as of this research; Linux/macOS behavior is based on the VS Code docs only.
- The **protocol version** cited (`2025-06-18`) is what the MCP architecture doc example shows; a newer spec revision (`2025-11-25`) is referenced by the MCP site's left-nav but was not deeply reviewed.
- The **Copilot CLI MCP feature set** was derived from GitHub Docs; no hands-on verification of flag behavior was performed.
- Out of scope: enterprise governance UI walk-throughs, custom-agent YAML frontmatter MCP blocks (only briefly mentioned), full MCP specification details (lifecycle error codes, pagination semantics, etc.).

---

## 9. Complete Reference List

### Documentation & Articles

- [What is the Model Context Protocol (MCP)? — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/getting-started/intro) — Top-level MCP intro and the "USB-C for AI" analogy.
- [Architecture overview — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/learn/architecture) — Host/client/server topology, data + transport layers, primitives, initialize handshake.
- [Transports — modelcontextprotocol.io](https://modelcontextprotocol.io/docs/concepts/transports) — stdio and Streamable HTTP specification.
- [Quickstart: Build an MCP server — modelcontextprotocol.io](https://modelcontextprotocol.io/quickstart/server) — Python/FastMCP weather-server tutorial used for the minimal server example.
- [Introducing the Model Context Protocol — Anthropic, Nov 25 2024](https://www.anthropic.com/news/model-context-protocol) — Original MCP announcement and origin story.
- [About Model Context Protocol (MCP) — GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp) — Copilot-centric MCP overview, availability matrix, GitHub MCP server overview (canonical path; the older `/copilot/concepts/about-mcp` slug redirects here).
- [Extending GitHub Copilot Chat with Model Context Protocol (MCP) servers — GitHub Docs](https://docs.github.com/en/copilot/how-tos/context/model-context-protocol/extending-copilot-chat-with-mcp) — `.vscode/mcp.json` setup, VS/JetBrains/Xcode/Eclipse specifics.
- [Connect agents to external tools (Cloud agent MCP) — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp) — Repo-level MCP config schema, `COPILOT_MCP_*` secrets, Sentry/Notion/Azure/Cloudflare/ADO/Atlassian examples, customizing the built-in GitHub MCP server.
- [MCP and GitHub Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/mcp-and-cloud-agent) — Default servers (GitHub, Playwright) and cloud-agent limitations (tools-only, no OAuth).
- [Customize the agent environment — GitHub Docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment) — `copilot-setup-steps.yml` for installing MCP-server runtimes.
- [Adding MCP servers for GitHub Copilot CLI — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) — `/mcp add`, `~/.copilot/mcp-config.json`, managing servers.
- [Copilot CLI command reference — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) — `--additional-mcp-config`, `--add-github-mcp-tool`, `--add-github-mcp-toolset`, `--disable-builtin-mcps`, `--allow-tool`, etc.
- [Copilot CLI configuration directory — GitHub Docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference) — `~/.copilot/` layout including `mcp-config.json` and `permissions-config.json`.
- [Add and manage MCP servers in VS Code — code.visualstudio.com](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) — `mcp.json` schema, `--add-mcp` CLI flag, sandboxing, discovery, MCP Apps.

### GitHub Repositories

- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) — Official reference servers (Fetch, Filesystem, Git, Memory, Sequential Thinking, Time).
- [github/github-mcp-server](https://github.com/github/github-mcp-server) — The GitHub MCP server: toolsets, `X-MCP-Toolsets` header, default toolset, remote-only additional toolsets, Docker/self-host instructions.
- [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) — `FastMCP` and the protocol SDK used in the minimal Python server example.

### Code Samples

- [Weather MCP server (Python / FastMCP / stdio)](https://modelcontextprotocol.io/quickstart/server) — Python, demonstrates decorator-based tool definition.
- [Cloud-agent MCP example configs — Sentry, Notion, Azure, Cloudflare, Azure DevOps, Atlassian](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp) — JSON snippets showing `COPILOT_MCP_*` secret substitution and `tools` allowlisting for the cloud agent.

---

## Revision Round 2 — 2026-04-21

This round addresses every 🔴 Critical and 🟡 Important finding from `agent-reviews/2026-04-21-web-research-reviewer-copilot-mcp.md` (Round 1, verdict: APPROVED WITH EDITS). There were no Critical findings. All Important findings are now ✅ fixed:

- ✅ fixed — **Executive Summary citation coverage** (🟡 Important): Rewrote all three paragraphs with inline citations for the cross-surface adoption claim, capability matrix (IDEs/CLI/cloud agent), default cloud-agent servers, GitHub MCP server positioning, and the approval/allowlisting guidance. Sources now visible per-claim rather than trailing synthesis.
- ✅ fixed — **Overview / Prerequisites / Permission Model citation gaps** (🟡 Important): Added inline source links for multi-host adoption, the SDK language list, the VS Code 1.99 / Visual Studio 17.14 minimum version claims, CLI install path, local-runtime prerequisites, and the MCP-policy-by-tier statement. All reference the primary GitHub Docs and MCP site pages.
- ✅ fixed — **Protocol-version self-conflict in Section 2.5 vs Section 8** (🟡 Important): Reworded Section 2.5 so it no longer presents `2025-06-18` as "current". The body now states the literal comes from the Architecture overview example and explicitly flags the newer `2025-11-25` revision referenced by the MCP site's left-nav (which remains unreviewed and is disclosed in Section 8). Provenance of the JSON example now says "verbatim (version literal illustrative only; see Section 8)".
- ✅ fixed — **Missing `> — Source: … | Provenance: …` attribution after fenced blocks** (🟡 Important): Added the required post-block attribution line to: Section 2.2 diagram, Section 3 install-runtime, Section 3 install-CLI, Section 4.3 cloud-agent schema, Section 6.1 install/register, and Section 6.1 `.vscode/mcp.json` blocks.
- ✅ fixed — **Section 4.2 `/mcp` block missing `| Provenance:` field** (🟡 Important): Appended `| Provenance: adapted` to the attribution line.
- ✅ fixed — **Orphaned entries in Section 9 Reference List** (🟡 Important): Removed `Tools`, `Resources`, `Prompts`, and the Memory / Fetch subtree code samples (not cited in body). Kept `MCP Specification 2025-06-18` and rewrote its description to reflect its actual use (matches the `protocolVersion` literal in Section 2.5). `python-sdk` and `Customize the agent environment` are now each cited in-body (Sections 6.1 and 4.3 respectively), so they stay.

🟢 Minor findings — dispositions:

- ✅ fixed (cheap + clear win) — **Stale `/copilot/concepts/about-mcp` citation** (🟢 Minor): Updated all in-body and reference-list links to the canonical `/copilot/concepts/context/mcp` path.
- ✅ fixed — **Schematic-config clarity** (🟢 Minor): Added explicit "schematic, not runnable" notes to the Section 4.3 cloud-agent config schema and the Section 6.1 `.vscode/mcp.json` example, and narrowed `"type": "local | stdio | http | sse"` to a single valid value plus a comment.

CLI-vs-VS Code MCP nuance coverage (per user directive) was preserved and strengthened — the Executive Summary now explicitly contrasts the three surfaces at the citation level, and Sections 4.1, 4.2, 4.3, 5.2, and 6.4 continue to cover config shape, invocation, approval, and OAuth-support differences between surfaces.

## Revision Round 3 — 2026-04-21

Addressed both remaining 🟡 Important must-fix items from Round 2: added inline citations for every operational/security claim in **Why It Matters** and in **§§5.2–5.3** (sandboxing, CLI approval behavior, cloud-agent non-interactive autonomy, PAT guidance, duplicate-config warning, and OAuth/resources/prompts cloud-agent limitations); and removed the orphaned `MCP Specification 2025-06-18` entry from §9 since it was never cited in-body.

