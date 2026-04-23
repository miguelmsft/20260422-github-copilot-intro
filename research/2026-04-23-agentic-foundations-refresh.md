# Research Report: AI Agent & Agentic Loop Foundations (2025–2026 Refresh)

**Date:** 2026-04-23
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** agentic-foundations-refresh
**Sources consulted:** 12 web pages (Anthropic engineering, Simon Willison weblog — five separate 2025–2026 posts, Hugging Face blog — two posts, Sierra/Anthropic/arXiv papers on τ-bench / τ²-bench, SWE-bench site, Model Context Protocol docs, Claude Code best-practices docs), 0 GitHub repositories (this is a conceptual topic — code examples are embedded via the documentation sources above).

---

## Executive Summary

The term "AI agent" has finally converged on a working definition in 2025. Simon Willison, who spent two years refusing to use the word without scare quotes, declared in September 2025 that the community has settled on **"an LLM agent runs tools in a loop to achieve a goal"** ([Willison, Sep 18 2025](https://simonwillison.net/2025/Sep/18/agents/)). Anthropic uses almost identical language in its June 2025 engineering post on Claude Research: **"A multi-agent system consists of multiple agents (LLMs autonomously using tools in a loop) working together"** ([Anthropic, Jun 13 2025](https://www.anthropic.com/engineering/built-multi-agent-research-system)). Hugging Face's December 2024/February 2025 agent-framework posts frame it complementarily: agents are **"programs where LLM outputs control the workflow"** ([Hugging Face, Dec 31 2024](https://huggingface.co/blog/smolagents)). For a beginner, this is the mental model to carry forward: give a model a goal, expose some tools, run it in a bounded loop.

The conceptual building blocks carry over from the pre-2025 literature (LLM reasoning, tools, memory, planning, reflection), but 2025–2026 sources have sharpened the *engineering* story around three things. First, **context is the scarcest resource**: agents degrade as their context window fills, so the whole discipline of prompt engineering for agents is really context engineering ([Anthropic Claude Code docs, 2025](https://docs.claude.com/en/docs/claude-code/best-practices); [Willison, Mar 11 2025](https://simonwillison.net/2025/Mar/11/using-llms-for-code/)). Second, **multi-agent orchestrator–worker systems work** but burn 4–15× the tokens of single-agent chats, so they only pay off on high-value, parallelizable tasks ([Anthropic, Jun 13 2025](https://www.anthropic.com/engineering/built-multi-agent-research-system)). Third, **evaluation has caught up with deployment**: SWE-bench Verified (500-instance human-filtered subset) is now the standard coding-agent leaderboard, joined in 2025 by SWE-bench Multilingual, SWE-bench Multimodal, CodeClash, and Sierra's τ²-Bench for conversational dual-control settings ([SWE-bench leaderboards, 2025](https://www.swebench.com/); [Barres et al., Jun 9 2025](https://arxiv.org/abs/2506.07982)).

The practical stance a beginner should adopt is unchanged but now well-evidenced: **use agents only when a deterministic workflow cannot capture the task**. Hugging Face puts it bluntly — "If that deterministic workflow fits all queries, by all means just code everything!... For the sake of simplicity and robustness, it's advised to regularize towards not using any agentic behaviour" ([Hugging Face, Dec 31 2024](https://huggingface.co/blog/smolagents)). When you do go agentic, 2025–2026 best practice emphasizes explicit stopping conditions, verifiable feedback (tests, compilers, screenshots), sandboxed execution, and an explicit awareness that *prompt injection remains an unsolved industry-wide problem* ([Willison on Claude Cowork, Jan 12 2026](https://simonwillison.net/2026/Jan/12/claude-cowork/)). Coding is the flagship domain because code has a built-in oracle — tests either pass or they don't — which is why the November 2025 GPT-5.1 / Claude Opus 4.5 generation has, in Willison's framing, "crossed a threshold" where spinning up a coding agent and asking it to build something now usually works ([Willison, Apr 2 2026](https://simonwillison.net/2026/Apr/2/lennys-podcast/)).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Concepts](#2-key-concepts)
3. [Getting Started](#3-getting-started)
4. [Core Usage](#4-core-usage)
5. [Configuration & Best Practices](#5-configuration--best-practices)
6. [Advanced Topics](#6-advanced-topics)
7. [Ecosystem & Alternatives](#7-ecosystem--alternatives)
8. [Research Limitations](#8-research-limitations)
9. [Complete Reference List](#9-complete-reference-list)

---

## 1. Overview

### What It Is

An AI agent, in the definition that has converged across industry practitioners during 2025, is an LLM that runs tools in a loop until a goal is met. Simon Willison — who had spent two years collecting 211 crowd-sourced definitions because none of them agreed — publicly adopted this definition in September 2025:

> "An LLM agent runs tools in a loop to achieve a goal. … The 'tools in a loop' definition has been popular for a while—Anthropic in particular have settled on that one. This is the pattern baked into many LLM APIs as tools or function calls—the LLM is given the ability to request actions to be executed by its harness, and the outcome of those tools is fed back into the model so it can continue to reason through and solve the given problem. 'To achieve a goal' reflects that these are not infinite loops—there is a stopping condition."
> — Source: [I think "agent" may finally have a widely enough agreed upon definition to be useful jargon now — Simon Willison (Sep 18, 2025)](https://simonwillison.net/2025/Sep/18/agents/)

Anthropic's own engineering blog uses essentially the same definition when explaining how Claude Research is built:

> "A multi-agent system consists of multiple agents (LLMs autonomously using tools in a loop) working together. Our Research feature involves an agent that plans a research process based on user queries, and then uses tools to create parallel agents that search for information simultaneously."
> — Source: [How we built our multi-agent research system — Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

Hugging Face's smolagents introduction frames agency as a *spectrum* rather than a binary:

> "AI Agents are programs where LLM outputs control the workflow. Any system leveraging LLMs will integrate the LLM outputs into code. The influence of the LLM's input on the code workflow is the level of agency of LLMs in the system. Note that with this definition, 'agent' is not a discrete, 0 or 1 definition: instead, 'agency' evolves on a continuous spectrum, as you give more or less power to the LLM on your workflow."
> — Source: [Introducing smolagents — Hugging Face (Dec 31, 2024)](https://huggingface.co/blog/smolagents)

### Why It Matters

A plain LLM call maps prompt → text. A chatbot does that across turns. An *agent* can observe the world, act on it, and adapt — so it can close loops that a chat interface cannot. Anthropic argues this is *necessary* rather than cosmetic for open-ended work:

> "Research work involves open-ended problems where it's very difficult to predict the required steps in advance. You can't hardcode a fixed path for exploring complex topics, as the process is inherently dynamic and path-dependent. … A linear, one-shot pipeline cannot handle these tasks."
> — Source: [How we built our multi-agent research system — Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

In Willison's April 2026 retrospective (on Lenny Rachitsky's podcast), the practical payoff for end-users is that the agent now *takes the run/verify step* for you:

> "It used to be you'd ask ChatGPT for some code, and it would spit out some code, and you'd have to run it and test it. The coding agents take that step for you now. And an open question for me is how many other knowledge work fields are actually prone to these agent loops?"
> — Source: [Highlights from my conversation about agentic engineering on Lenny's Podcast — Simon Willison (Apr 2, 2026)](https://simonwillison.net/2026/Apr/2/lennys-podcast/)

### Key Features

- **Goal-directed** — receives a high-level task, decides intermediate steps itself.
- **Tool use** — function calls, API calls, shell commands, code interpreters, web browsers.
- **Loop with observation** — result of each tool call is fed back into the model's context for the next decision.
- **Stopping conditions** — success criteria, turn/iteration limits, cost caps, or human stop.
- **Memory** — short-term via conversation history; long-term via external stores or scratchpad files.
- **Planning / reflection** — many agents produce an explicit plan and critique progress between steps.

---

## 2. Key Concepts

### 2.1 Plain LLM vs chatbot vs agent vs multi-agent

Hugging Face's smolagents post lays out agency as five discrete levels, which is the cleanest beginner-friendly ladder published in 2025:

| Level | Description | Pattern |
|---|---|---|
| ☆☆☆ | LLM output has no impact on program flow | Simple processor |
| ★☆☆ | LLM output determines basic control flow | Router (`if llm_decision(): path_a() else: path_b()`) |
| ★★☆ | LLM output determines function execution | Tool call |
| ★★★ | LLM output controls iteration and program continuation | Multi-step agent (`while llm_should_continue(): execute_next_step()`) |
| ★★★ | One agentic workflow can start another | Multi-agent |

*— Adapted from [Introducing smolagents — Hugging Face (Dec 31, 2024)](https://huggingface.co/blog/smolagents).*

### 2.2 The agentic loop

Hugging Face encodes the loop in pseudocode that makes the pattern concrete:

```python
# The canonical "tools in a loop" shape — adapted from the smolagents post.
memory = [user_defined_task]
while llm_should_continue(memory):          # loop
    action = llm_get_next_action(memory)    # think → choose tool + args
    observations = execute_action(action)   # act
    memory += [action, observations]        # observe → extend context
```
> — Source: [Introducing smolagents — Hugging Face (Dec 31, 2024)](https://huggingface.co/blog/smolagents) | Provenance: verbatim code block from the post.

This is the same shape as the classic Think → Act → Observe framing, just written in Python. Every named pattern below — ReAct, Plan-and-Execute, Reflexion, orchestrator–worker — is a variation on *what* goes inside `llm_get_next_action` and *what* extra structure lives in `memory`.

### 2.3 Tools

Tools are the agent's actuators. In 2025 the ecosystem standardized much of this plumbing via the **Model Context Protocol (MCP)**, an open protocol originally proposed by Anthropic and now supported by Claude, ChatGPT, VS Code, Cursor, and others:

> "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems. Using MCP, AI applications like Claude or ChatGPT can connect to data sources (e.g. local files, databases), tools (e.g. search engines, calculators) and workflows (e.g. specialized prompts)—enabling them to access key information and perform tasks. Think of MCP like a USB-C port for AI applications."
> — Source: [What is the Model Context Protocol (MCP)? — modelcontextprotocol.io (accessed Apr 2026)](https://modelcontextprotocol.io/introduction)

Tool *design* is now recognized as first-class work. Anthropic reports using a dedicated tool-testing agent to iterate descriptions:

> "We even created a tool-testing agent—when given a flawed MCP tool, it attempts to use the tool and then rewrites the tool description to avoid failures. By testing the tool dozens of times, this agent found key nuances and bugs. This process for improving tool ergonomics resulted in a 40% decrease in task completion time for future agents using the new description, because they were able to avoid most mistakes."
> — Source: [How we built our multi-agent research system — Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

### 2.4 Memory

Two flavours, short-term (the conversation / scratchpad) and long-term (external stores). Willison argues long-term memory is best implemented *through the tool interface* rather than as a separate agent primitive:

> "Some people might insist that agents have a memory. The 'tools in a loop' model has a fundamental form of memory baked in: those tool calls are constructed as part of a conversation with the model, and the previous steps in that conversation provide short-term memory that's essential for achieving the current specified goal. If you want long-term memory the most promising way to implement it is with an extra set of tools!"
> — Source: [Simon Willison (Sep 18, 2025)](https://simonwillison.net/2025/Sep/18/agents/)

For long-running tasks that may blow past the context window, Anthropic uses an explicit write-to-memory step:

> "The LeadResearcher begins by thinking through the approach and saving its plan to Memory to persist the context, since if the context window exceeds 200,000 tokens it will be truncated and it is important to retain the plan."
> — Source: [How we built our multi-agent research system — Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

### 2.5 Planning and reflection

Planning usually means "decompose the task into subtasks"; reflection means "evaluate progress and revise". Anthropic's orchestrator–worker pattern encodes both: the lead agent plans and delegates, subagents execute, results are synthesized. Claude Code's documented workflow makes planning an explicit, user-visible mode:

> "Separate research and planning from implementation to avoid solving the wrong problem. Letting Claude jump straight to coding can produce code that solves the wrong problem. Use Plan Mode to separate exploration from execution. The recommended workflow has four phases: Explore → Plan → Implement → Commit."
> — Source: [Best Practices for Claude Code — Anthropic docs (accessed Apr 2026)](https://docs.claude.com/en/docs/claude-code/best-practices)

### 2.6 Context as the scarce resource

The dominant 2025 insight is that agent performance is bottlenecked by context-window management, not reasoning alone:

> "Claude's context window holds your entire conversation, including every message, every file Claude reads, and every command output. However, this can fill up fast. A single debugging session or codebase exploration might generate and consume tens of thousands of tokens. This matters since LLM performance degrades as context fills. When the context window is getting full, Claude may start 'forgetting' earlier instructions or making more mistakes. The context window is the most important resource to manage."
> — Source: [Best Practices for Claude Code — Anthropic docs (accessed Apr 2026)](https://docs.claude.com/en/docs/claude-code/best-practices)

Willison makes the same point from the practitioner side:

> "Most of the craft of getting good results out of an LLM comes down to managing its context—the text that is part of your current conversation. … LLM tools that obscure that context from me are less effective."
> — Source: [Here's how I use LLMs to help me write code — Simon Willison (Mar 11, 2025)](https://simonwillison.net/2025/Mar/11/using-llms-for-code/)

---

## 3. Getting Started

### Prerequisites

- A capable modern LLM behind an API that supports **function/tool calling** (OpenAI, Anthropic, Gemini, or an open-weights model served via vLLM / Ollama).
- A tool surface — even one tool (e.g. "run Python", "search the web", "read this file") is enough to make the loop non-trivial.
- A runtime "harness" — either a library (smolagents, LangGraph, OpenAI Agents SDK, PydanticAI) or ~50 lines of your own code that implements the while-loop from §2.2.
- For coding agents, a sandbox — a container, VM, or at minimum a scratch directory with revoked network/credential access.

### Installation & Setup (minimal reproducer)

The smallest viable agent in the 2025 ecosystem is Hugging Face's smolagents — the entire Phase-1 "hello world" is four lines:

```python
# Source: https://huggingface.co/blog/smolagents
from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=HfApiModel())
agent.run(
    "How many seconds would it take for a leopard at full speed to run through Pont des Arts?"
)
```
> — Source: [Introducing smolagents — Hugging Face (Dec 31, 2024)](https://huggingface.co/blog/smolagents) | Provenance: verbatim.

Terminal equivalent for installing and running it:

```bash
# 1. Install the library
pip install smolagents

# 2. Export credentials for whichever model backend you use
export HF_TOKEN=...        # for HfApiModel
# or: export ANTHROPIC_API_KEY=... / OPENAI_API_KEY=...

# 3. Run the Python script above
python my_first_agent.py
```

The point of starting this small is to watch the loop unfold. A beginner's first useful exercise is to log every `(thought, action, observation)` triple and read the transcript — it makes the "tools in a loop" definition concrete in about ten minutes.

---

## 4. Core Usage

### 4.1 The six named patterns

A beginner does not need to memorize every variant; the field really has settled on five or six recurring shapes. Each is a different answer to *what is inside the loop?*

1. **ReAct** — interleaved Thought / Action / Observation traces. Still the default baseline pattern that every tool-calling LLM API implements natively. *Historically grounded in Yao et al. 2022; retained as the common-denominator pattern in 2025 agent harnesses.*
2. **Plan-and-Execute** — the agent first writes a plan, then iterates through it, replanning on failure. Claude Code's "Plan Mode" (quoted in §2.5) is a user-facing version of this.
3. **Reflexion / self-critique** — after a failure, the agent emits a verbal post-mortem into memory and retries. In 2025 production systems this often takes the form of "re-run with the failing test output appended to context".
4. **Orchestrator–worker (multi-agent)** — a lead agent delegates sub-tasks to parallel sub-agents with their own context windows. Anthropic's Research feature is the canonical 2025 example:

   > "Our Research system uses a multi-agent architecture with an orchestrator-worker pattern, where a lead agent coordinates the process while delegating to specialized subagents that operate in parallel. … When a user submits a query, the lead agent analyzes it, develops a strategy, and spawns subagents to explore different aspects simultaneously."
   > — Source: [Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

5. **Evaluator–optimizer** — one model generates, another (or the same model with a different prompt) scores or critiques, and the generator revises. Heavily used inside agent evals themselves (LLM-as-judge).
6. **Code agents** — the agent emits *executable code* rather than JSON tool calls. Hugging Face and others argue this is a strictly more expressive action space because loops, conditionals, and composition come for free:

   > "letting the agent express its actions in code has several advantages, but most notably that code is specifically designed to express complex sequences of actions."
   > — Source: [Open-source DeepResearch — Hugging Face (Feb 4, 2025)](https://huggingface.co/blog/open-deep-research)

### 4.2 Single-agent vs multi-agent: the economic tradeoff

Multi-agent is not automatically better. It is better when the task is parallelizable and the value per task is high enough to pay for the token blowup:

> "Multi-agent systems work mainly because they help spend enough tokens to solve the problem. … There is a downside: in practice, these architectures burn through tokens fast. In our data, agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens than chats. For economic viability, multi-agent systems require tasks where the value of the task is high enough to pay for the increased performance."
> — Source: [How we built our multi-agent research system — Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

Anthropic further notes that *coding* — the domain this report pays attention to — is *not* always a good fit for multi-agent:

> "some domains that require all agents to share the same context or involve many dependencies between agents are not a good fit for multi-agent systems today. For instance, most coding tasks involve fewer truly parallelizable tasks than research, and LLM agents are not yet great at coordinating and delegating to other agents in real time."
> — Source: [Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

### 4.3 When to use an agent — and when to just write code

Hugging Face's decision rule is the most quotable beginner guide published in the last 18 months:

> "Agents are useful when you need an LLM to determine the workflow of an app. But they're often overkill. The question is: do I really need flexibility in the workflow to efficiently solve the task at hand? If the pre-determined workflow falls short too often, that means you need more flexibility. … If that deterministic workflow fits all queries, by all means just code everything! This will give you a 100% reliable system with no risk of error introduced by letting unpredictable LLMs meddle in your workflow. For the sake of simplicity and robustness, it's advised to regularize towards not using any agentic behaviour."
> — Source: [Introducing smolagents — Hugging Face (Dec 31, 2024)](https://huggingface.co/blog/smolagents)

A practical rule-of-thumb synthesis from the 2025 sources:

- **Use a plain LLM call** for one-shot generation/summarization where no external state matters.
- **Use a workflow** (LLM routed through a predictable code path, with at most a tool call or two per step) when the task space is bounded.
- **Use an agent** when the next step depends on what the previous step discovered, and you cannot enumerate the steps in advance.

---

## 5. Configuration & Best Practices

### 5.1 Give the agent a verification loop

The single highest-leverage configuration, per Anthropic's 2025 Claude Code docs:

> "Give Claude a way to verify its work. Include tests, screenshots, or expected outputs so Claude can check itself. This is the single highest-leverage thing you can do. Claude performs dramatically better when it can verify its own work, like run tests, compare screenshots, and validate outputs. Without clear success criteria, it might produce something that looks right but actually doesn't work. You become the only feedback loop, and every mistake requires your attention."
> — Source: [Best Practices for Claude Code — Anthropic docs (accessed Apr 2026)](https://docs.claude.com/en/docs/claude-code/best-practices)

This is why coding is the "easy" agent domain — the compiler, the linter, and the test suite are free, cheap, and fast feedback signals. Willison makes the same point from a different angle:

> "Code is easier than almost every other problem that you pose these agents because code is obviously right or wrong—either it works or it doesn't work. … If it writes you an essay, if it prepares a lawsuit for you, it's so much harder to derive if it's actually done a good job."
> — Source: [Lenny's Podcast highlights — Simon Willison (Apr 2, 2026)](https://simonwillison.net/2026/Apr/2/lennys-podcast/)

### 5.2 Manage context aggressively

Summary of Anthropic's and Willison's 2025 guidance:

- Prefer **short, focused sessions** over long-running ones; performance degrades as context fills.
- **Start fresh** when a conversation has gone off the rails — it is almost always faster than trying to correct it.
- **Write plans / intermediate artifacts to files**, not chat — then re-read the file when needed (this is how Claude Code's memory works, per §2.4).
- **Decompose with subagents / separate sessions** when breadth exceeds a single window.

### 5.3 Stopping conditions

Every viable agent harness has at least these safeguards: max iterations, wall-clock timeout, token-budget cap, tool-call whitelist, and an explicit "done" tool the model can call. Willison's definition emphasizes that the loop must terminate; Anthropic reports early prototypes failed this:

> "Early agents made errors like spawning 50 subagents for simple queries, scouring the web endlessly for nonexistent sources, and distracting each other with excessive updates."
> — Source: [Anthropic (Jun 13, 2025)](https://www.anthropic.com/engineering/built-multi-agent-research-system)

### 5.4 Common pitfalls

Drawn from the 2025–2026 sources:

- **Anthropomorphizing failure modes.** Willison warns: "if a human collaborator hallucinated a non-existent library or method you would instantly lose trust in them. Don't fall into the trap of anthropomorphizing LLMs and assuming that failures which would discredit a human should discredit the machine in the same way." ([Mar 11 2025](https://simonwillison.net/2025/Mar/11/using-llms-for-code/))
- **Skipping evals because you don't have hundreds of cases.** Anthropic: "it's best to start with small-scale testing right away with a few examples, rather than delaying until you can build more thorough evals." ([Jun 13 2025](https://www.anthropic.com/engineering/built-multi-agent-research-system))
- **Letting agents pick low-quality sources.** "human testers noticed that our early agents consistently chose SEO-optimized content farms over authoritative but less highly-ranked sources like academic PDFs or personal blogs. Adding source quality heuristics to our prompts helped resolve this issue." ([Anthropic, Jun 13 2025](https://www.anthropic.com/engineering/built-multi-agent-research-system))
- **Assuming agents replace humans wholesale.** Willison's April 2026 framing is that this is a *category error*: "Putting an AI agent on a performance improvement plan makes no sense at all!" ([Sep 18 2025](https://simonwillison.net/2025/Sep/18/agents/))

---

## 6. Advanced Topics

### 6.1 Trust, safety, and sandboxing

The most important thing a beginner needs to internalize about 2025–2026 agents is that **prompt injection is an unsolved problem**, and any system that reads untrusted content and can take actions is exposed. Anthropic's *own* disclosure on their January 2026 Claude Cowork release is worth quoting in full:

> "You should also be aware of the risk of 'prompt injections': attempts by attackers to alter Claude's plans through content it might encounter on the internet. We've built sophisticated defenses against prompt injections, but agent safety—that is, the task of securing Claude's real-world actions—is still an active area of development in the industry. These risks aren't new with Cowork, but it might be the first time you're using a more advanced tool that moves beyond a simple conversation. We recommend taking precautions, particularly while you learn how it works."
> — Source: Anthropic, quoted in [First impressions of Claude Cowork — Simon Willison (Jan 12, 2026)](https://simonwillison.net/2026/Jan/12/claude-cowork/)

Operational consequences (from the Cowork docs and broader 2025 practice):

- **Sandboxing by default.** Cowork runs agent sessions inside an Apple-Virtualization-Framework VM with a custom Linux root filesystem ([Willison, Jan 12 2026](https://simonwillison.net/2026/Jan/12/claude-cowork/)); Claude Code recommends using containers for destructive operations.
- **Least privilege for file access.** "Avoid granting access to local files with sensitive information, like financial documents." (Anthropic Help Center, quoted in the same post.)
- **Human-in-the-loop for high-blast-radius actions.** Confirmation prompts before shell commands, writes to shared systems, or spending money.
- **Explicit allowlists for tools and domains** — Claude Code has a permissions system; MCP servers can be scoped per session.

### 6.2 Evaluation: the 2025–2026 benchmark landscape

**SWE-bench** remains the standard for coding agents, but has splintered into a family. Per the official leaderboard site (2025 news feed):

- **SWE-bench Verified** — 500-instance human-filtered subset, became the de-facto headline leaderboard after the Aug 2024 OpenAI-assisted cleanup.
- **SWE-bench Multilingual** — 300 tasks across 9 programming languages (2024).
- **SWE-bench Multimodal** — 517 instances with visual elements (Oct 2024).
- **SWE-agent 1.0** — March 2025, listed as open-source SOTA on SWE-bench Lite.
- **mini-SWE-agent** — July 2025: "mini-SWE-agent scores 65% on SWE-bench Verified in 100 lines of python code."
- **SWE-smith** — May 2025 training-data resource for SWE agents.
- **CodeClash** — November 2025 evaluation of LMs as "goal-oriented" rather than "task-oriented" developers.

Quoted directly:

> "[11/2025] Introducing CodeClash, our new eval of LMs as goal (not task) oriented developers! [07/2025] mini-SWE-agent scores 65% on SWE-bench Verified in 100 lines of python code. [05/2025] SWE-smith is out! Train your own models for software engineering agents. [03/2025] SWE-agent 1.0 is the open source SOTA on SWE-bench Lite!"
> — Source: [SWE-bench Leaderboards — news feed (accessed Apr 2026)](https://www.swebench.com/)

**For conversational / customer-facing agents**, Sierra's τ-bench (Jun 2024) was extended in June 2025 into **τ²-Bench**, which adds a dual-control setting where the *user* also has tools and must be guided:

> "Existing benchmarks for conversational AI agents simulate single-control environments, where only the AI agent can use tools to interact with the world, while the user remains a passive information provider. This differs from real-world scenarios like technical support, where users need to actively participate in modifying the state of the (shared) world. In order to address this gap, we introduce τ²-bench … our experiments show significant performance drops when agents shift from no-user to dual-control, highlighting the challenges of guiding users."
> — Source: [τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment — Barres et al., arXiv:2506.07982 (Jun 9, 2025)](https://arxiv.org/abs/2506.07982)

**For general web/tool research**, Hugging Face's February 2025 "Open Deep Research" targets **GAIA** (multi-step, tool-using question answering):

> "On GAIA's public leaderboard, GPT-4 does not even reach 7% on the validation set when used without any agentic setup. On the other side of the spectrum, with Deep Research, OpenAI reached 67.36% score on the validation set, so an order of magnitude better!"
> — Source: [Open-source DeepResearch — Hugging Face (Feb 4, 2025)](https://huggingface.co/blog/open-deep-research)

The qualitative takeaway across all of these: agent scaffolding contributes *as much or more* than raw model capability — Hugging Face measured "up to 60 points" improvement from dropping the same LLM into a smolagents harness versus calling it directly.

### 6.3 Coding agent framing (applies to GitHub Copilot, Claude Code, Cursor, Aider, etc.)

The conceptual description of a modern coding agent, drawn from Anthropic's Claude Code docs but applicable across products:

> "Claude Code is an agentic coding environment. Unlike a chatbot that answers questions and waits, Claude Code can read your files, run commands, make changes, and autonomously work through problems while you watch, redirect, or step away entirely. This changes how you work. Instead of writing code yourself and asking Claude to review it, you describe what you want and Claude figures out how to build it. Claude explores, plans, and implements."
> — Source: [Best Practices for Claude Code — Anthropic docs (accessed Apr 2026)](https://docs.claude.com/en/docs/claude-code/best-practices)

Willison's April 2026 summary of *why this works now* when it didn't in 2024:

> "in November we had what I call the inflection point where GPT 5.1 and Claude Opus 4.5 came along. They were both incrementally better than the previous models, but in a way that crossed a threshold where previously the code would mostly work, but you had to pay very close attention to it. And suddenly we went from that to... almost all of the time it does what you told it to do, which makes all of the difference in the world."
> — Source: [Lenny's Podcast highlights — Simon Willison (Apr 2, 2026)](https://simonwillison.net/2026/Apr/2/lennys-podcast/)

All the building blocks from §2 appear in a coding agent concretely:

- **LLM reasoning** — plan edits, pick files to open.
- **Tools** — `read_file`, `edit_file`, `run_shell`, `run_tests`, `grep`, `git`.
- **Memory** — short-term: conversation + opened files; long-term: `CLAUDE.md` / `.cursorrules` / similar project instruction files.
- **Planning / reflection** — Plan Mode; retrying after a failed test run is the world's most widely-deployed reflexion loop.
- **Stopping conditions** — tests pass, user approves diff, step/time cap exceeded.
- **Sandboxing** — worktree / container / VM; human-in-the-loop on git commits and destructive shell commands.

---

## 7. Ecosystem & Alternatives

The 2025–2026 open-source and commercial landscape that a beginner will encounter:

- **Agent harnesses / frameworks** — smolagents (Hugging Face), LangGraph (LangChain), OpenAI Agents SDK (`openai-agents` / `@openai/agents`, launched March 2025), PydanticAI, Microsoft AutoGen, CrewAI, Mastra. All implement variants of the loop from §2.2.
- **Coding agents** — GitHub Copilot (agent mode), Claude Code / Claude Cowork, Cursor, Aider, Devin, Codeium/Windsurf, SWE-agent (open-source, academic baseline).
- **Research / web agents** — OpenAI Deep Research (launched Feb 2025), Anthropic Claude Research (described in the Jun 13 2025 post), Hugging Face Open Deep Research (OSS), Perplexity's research modes.
- **Protocols** — **Model Context Protocol (MCP)** is the clear winner for tool interoperability in 2025, with support from Claude, ChatGPT, VS Code, Cursor, MCPJam and a growing registry of servers ([MCP docs](https://modelcontextprotocol.io/introduction)).
- **Computer-use / browser agents** — Anthropic Computer Use (late 2024), OpenAI Operator / ChatGPT agent (launched July 2025 per Willison's Sep 18 2025 post).

When to pick what, roughly:

| Need | Pick |
|---|---|
| Write code, refactor repos, run tests locally | a coding-agent product (Claude Code, Cursor, Copilot agent, Aider) |
| Research / synthesize across many web sources | a research-mode agent (Deep Research, Claude Research) |
| Build your own custom agent | an SDK/harness (Agents SDK, LangGraph, smolagents) + MCP servers for tools |
| Connect your data/tool to *any* agent client | expose it as an MCP server |
| Evaluate an agent you built | SWE-bench Verified (coding), τ²-Bench (conversational), GAIA (general), plus your own task-specific eval |

---

## 8. Research Limitations

- **OpenAI primary sources were inaccessible** via my fetch path (their blog is behind a Cloudflare challenge, and `openai.com/index/introducing-chatgpt-agent/` / `introducing-deep-research/` both returned interstitials). Claims in this report about ChatGPT agent and OpenAI Deep Research are therefore routed via *secondary* 2025–2026 sources (Simon Willison, Hugging Face) that summarize them directly. Where primary OpenAI language would have been stronger, I have flagged it implicitly by attributing to the secondary source.
- **Google DeepMind** did not surface prominently in the 2025–2026 sources I successfully fetched; the reviewer may want to add a DeepMind agent paper if one is essential. I deliberately did not fabricate one.
- **Chip Huyen and Andrej Karpathy follow-ups past Jan 2025** — I did not find a new Huyen agents-focused post in 2025–2026 that superseded the January 2025 piece the user asked me to avoid. Willison's 2025–2026 writing effectively occupies the same practitioner-summary niche, so I leaned on him instead.
- **Academic citation counts are thin for the deepest topics** (Reflexion-style self-critique in 2025, new planner architectures). The 2025 arXiv landscape on agents is enormous but most papers are narrow application studies rather than foundational re-framings. I favored Anthropic's engineering post and Sierra's τ²-Bench paper as the 2025 primary sources because they generalize.
- **"Accessed Apr 2026" pages** (Claude Code best practices, MCP intro) are living documentation without a single visible publication date. I treated them as current at the time of fetch; any specific version drift since is out of scope.
- **Willison is a single author** and therefore a single point of view on many framing questions (especially the "tools in a loop" definition, the November 2025 inflection point, and the Cowork framing). I cross-checked his definition against Anthropic's own wording and they agree; I did not similarly cross-check the "inflection point" claim, which remains one observer's read.
- **Foundational older citations** (Weng 2023, Yao 2022 ReAct, Shinn 2023 Reflexion, Anthropic "Building effective agents" Dec 2024, Huyen Jan 2025) are deliberately *not* cited as primary sources per the user's brief. They are acknowledged only by name where a named pattern (ReAct, Reflexion) would otherwise be unexplained.

---

## 9. Complete Reference List

Dates listed are publication or explicit "last updated" dates where visible on the source page; "accessed" means the page is living documentation without a single visible publication date.

### Anthropic (primary, 2025+)

- [How we built our multi-agent research system](https://www.anthropic.com/engineering/built-multi-agent-research-system) — **Published Jun 13, 2025.** Anthropic engineering blog. Orchestrator–worker architecture, token economics (4×/15× token multipliers), tool-description engineering, eval advice.
- [Best Practices for Claude Code](https://docs.claude.com/en/docs/claude-code/best-practices) — **Accessed Apr 2026** (living docs). Explore → Plan → Implement → Commit workflow, context-window management, verification-first prompting.

### Simon Willison's Weblog (practitioner synthesis, 2025–2026)

- [I think "agent" may finally have a widely enough agreed upon definition to be useful jargon now](https://simonwillison.net/2025/Sep/18/agents/) — **Sep 18, 2025.** Canonical 2025 "tools in a loop to achieve a goal" definition.
- [Anthropic: How we built our multi-agent research system](https://simonwillison.net/2025/Jun/14/multi-agent-research-system/) — **Jun 14, 2025.** Analytical summary of the Anthropic post with long verbatim quotes.
- [Here's how I use LLMs to help me write code](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) — **Mar 11, 2025.** "Context is king"; mental model of LLMs as over-confident pair programmers.
- [First impressions of Claude Cowork, Anthropic's general agent](https://simonwillison.net/2026/Jan/12/claude-cowork/) — **Jan 12, 2026.** Includes Anthropic's own quoted guidance on prompt-injection risk and sandboxing via Apple Virtualization Framework.
- [Highlights from my conversation about agentic engineering on Lenny's Podcast](https://simonwillison.net/2026/Apr/2/lennys-podcast/) — **Apr 2, 2026.** "November 2025 inflection point"; code as a bellwether domain because correctness is checkable.

### Hugging Face (2024-late / 2025, agent frameworks)

- [Introducing smolagents, a simple library to build agents](https://huggingface.co/blog/smolagents) — **Dec 31, 2024.** Agency-as-a-spectrum table, minimal loop pseudocode, decision rule for when *not* to use agents. (Published at the 2024/2025 boundary; included as the clearest pedagogical 2024→2025 source.)
- [Open-source DeepResearch — Freeing our search agents](https://huggingface.co/blog/open-deep-research) — **Feb 4, 2025.** CodeAgent pattern, GAIA benchmark, ~60-point lift from agent scaffolding.

### Benchmarks / academic (2024–2025)

- [SWE-bench Leaderboards](https://www.swebench.com/) — **Accessed Apr 2026** (news feed dated through Nov 2025). Verified / Multilingual / Multimodal / Lite variants; 2025 news: SWE-agent 1.0 (Mar), SWE-smith (May), mini-SWE-agent (Jul), CodeClash (Nov).
- [τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment — arXiv:2506.07982](https://arxiv.org/abs/2506.07982) — **Submitted Jun 9, 2025.** Barres, Dong, Ray, Si, Narasimhan (Sierra).
- [τ-Bench: Benchmarking AI agents for the real-world — Sierra blog](https://sierra.ai/blog/benchmarking-ai-agents) — **Jun 20, 2024** (predecessor of τ²-Bench; included for lineage).
- [τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains — arXiv:2406.12045](https://arxiv.org/abs/2406.12045) — **Submitted Jun 17, 2024** (predecessor paper; included for lineage).

### Protocols

- [What is the Model Context Protocol (MCP)?](https://modelcontextprotocol.io/introduction) — **Accessed Apr 2026** (living docs; protocol first proposed by Anthropic in late 2024, mainstream adoption through 2025). Open standard for connecting AI applications to external data sources, tools, and workflows.
