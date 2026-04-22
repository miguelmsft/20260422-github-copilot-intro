# Research Report: AI Agent & Agentic Loop Foundations

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** agentic-foundations
**Sources consulted:** 9 web pages (Anthropic engineering blog, Lilian Weng's blog, Chip Huyen's blog, two arXiv papers, Prompting Guide, Hugging Face Agents Course, LangChain blog, Model Context Protocol docs), 0 GitHub repositories (the topic is conceptual — code samples are embedded via the documentation sources above)

---

## Executive Summary

An **AI agent** is a system that uses a large language model (LLM) as its "brain" to perceive a task, decide what to do, take actions in an environment through **tools**, observe the results, and iterate until the goal is met ([Chip Huyen, Jan 2025](https://huyenchip.com/2025/01/07/agents.html); [Lilian Weng, Jun 2023](https://lilianweng.github.io/posts/2023-06-23-agent/)). This iterative **"agentic loop"** — often summarized as *Think → Act → Observe* ([Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit1/introduction)) — is what separates an agent from a plain chatbot, which simply produces one text reply per user turn. In Anthropic's widely-cited framing, agents are "systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks," whereas simpler *workflows* orchestrate LLMs along predefined code paths ([Building effective agents — Anthropic, Dec 19, 2024](https://www.anthropic.com/engineering/building-effective-agents)).

The conceptual building blocks are consistent across the literature: an **LLM** for reasoning, a set of **tools** (function calls / APIs / code execution) for acting on the world, **memory** (short-term context plus long-term retrieval), a form of **planning** (task decomposition, sometimes with an explicit planner step), and **reflection** (self-critique that lets the agent learn from mistakes within a single task) ([Lilian Weng](https://lilianweng.github.io/posts/2023-06-23-agent/)). These blocks are combined in patterns such as **ReAct** (interleaved reasoning and acting, [Yao et al., 2022](https://arxiv.org/abs/2210.03629)), **Plan-and-Execute** (plan first, execute steps, re-plan, [LangChain, Feb 2024](https://blog.langchain.com/planning-agents/)), and **Reflexion** (verbal self-feedback stored in episodic memory, [Shinn et al., 2023](https://arxiv.org/abs/2303.11366)). Agents can be **single-agent** or **multi-agent** — e.g., an orchestrator delegating to worker agents ([Anthropic](https://www.anthropic.com/engineering/building-effective-agents)).

For beginners, the critical mental model is: **add agentic autonomy only when the task genuinely needs it.** Agents trade latency, cost, and the risk of compounding errors for the ability to handle open-ended problems where the required steps cannot be hard-coded in advance ([Anthropic](https://www.anthropic.com/engineering/building-effective-agents); [Huyen](https://huyenchip.com/2025/01/07/agents.html)). Because agents can take real actions (edit files, call APIs, spend money), **trust and safety** are first-class concerns — practitioners use human-in-the-loop checkpoints, sandboxed environments, stopping conditions, and careful tool design ([Anthropic](https://www.anthropic.com/engineering/building-effective-agents)). Modern coding assistants (e.g., GitHub Copilot's agent mode, Cursor, Claude Code, Aider, Devin, SWE-agent) apply these same conceptual ideas; Anthropic explicitly uses coding as a flagship agent domain and reports that "agents can now solve real GitHub issues in the SWE-bench Verified benchmark based on the pull request description alone" ([Anthropic](https://www.anthropic.com/engineering/building-effective-agents)), and Huyen analyzes SWE-agent as a concrete instance ([Huyen](https://huyenchip.com/2025/01/07/agents.html)). *Vendor-specific product claims for individual assistants were not independently verified in this research — see §8.*

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

An AI agent is a software system that uses a foundation model (typically an LLM) to pursue goals by repeatedly deciding on actions, executing them via tools, and observing the results. Chip Huyen roots the modern definition in classic AI:

> "An agent is anything that can perceive its environment and act upon that environment. *Artificial Intelligence: A Modern Approach* (1995) defines an agent as anything that can be viewed as perceiving its environment through sensors and acting upon that environment through actuators."
> — Source: [Agents — Chip Huyen (Jan 7, 2025)](https://huyenchip.com/2025/01/07/agents.html)

Anthropic draws a useful architectural line between workflows and agents:

> "Workflows are systems where LLMs and tools are orchestrated through predefined code paths. Agents, on the other hand, are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks."
> — Source: [Building effective agents — Anthropic (Dec 19, 2024)](https://www.anthropic.com/engineering/building-effective-agents)

### Why It Matters

A plain LLM chat is a single-shot mapping from prompt → text. That is enough for summarization or brainstorming, but it cannot check its work against the real world, call an API, run code, browse a file system, or recover from errors. Agents close that loop. They unlock use cases like resolving real GitHub issues, operating a browser, running SQL against a warehouse, coordinating multi-step customer-support resolutions, or controlling a robot — any task where the sequence of steps depends on what is discovered along the way.

> "Agents can be used for open-ended problems where it's difficult or impossible to predict the required number of steps, and where you can't hardcode a fixed path."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

### Key Features

- **Goal-directed**: given a task, the agent decides what to do next, not the programmer.
- **Tool use**: the agent can call external functions, APIs, code interpreters, retrieval systems, browsers, etc.
- **Feedback loop**: the agent observes tool results and adapts — it does not commit to a single plan blindly.
- **Memory**: short-term (the conversation / scratchpad) plus optional long-term (vector stores, episodic notes).
- **Planning and reflection**: decomposing tasks into subgoals and critiquing its own progress.
- **Stopping conditions**: termination on success, max iterations, or human intervention.

---

## 2. Key Concepts

### 2.1 Plain LLM vs Chatbot vs Agent

| System | What it does | Loop? | Acts on the world? |
|---|---|---|---|
| Plain LLM call | One prompt → one completion | No | No |
| Chatbot | Multi-turn conversation, but each turn is still prompt → text | No (per-turn only) | No (unless given tools) |
| Agent | Takes a goal, plans, uses tools, observes, iterates until done | Yes | Yes, via tools |

Hugging Face frames the agent loop crisply as **Think → Act → Observe**:

> "The Agent Workflow: Think → Act → Observe."
> — Source: [Introduction to Agents — Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit1/introduction)

### 2.2 The Agentic Loop

Nearly every agent framework implements the same core loop, shown below as ASCII:

```
           ┌───────────────────────────────────────────────┐
           │                                               │
           ▼                                               │
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
   │  PERCEIVE    │──▶│ REASON / PLAN│──▶│   ACT        │  │
   │  (read goal, │   │ (LLM decides │   │ (call tool / │  │
   │   inputs,    │   │  next step)  │   │  function)   │  │
   │   history)   │   └──────────────┘   └──────┬───────┘  │
   └──────────────┘                             │          │
           ▲                                    ▼          │
           │                            ┌──────────────┐   │
           │                            │  OBSERVE     │   │
           └────────────────────────────│  (tool       │───┘
                                        │  result,     │
                                        │  env signal) │
                                        └──────────────┘
                                  (repeat until done or stopped)
```

Anthropic describes the runtime version of this loop in one sentence:

> "Agents can handle sophisticated tasks, but their implementation is often straightforward. They are typically just LLMs using tools based on environmental feedback in a loop."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

### 2.3 Core Building Blocks

Lilian Weng's influential 2023 overview enumerates the same four components that almost every agent framework still uses:

> "In a LLM-powered autonomous agent system, LLM functions as the agent's brain, complemented by several key components: Planning … Memory … Tool use …"
> — Source: [LLM Powered Autonomous Agents — Lilian Weng](https://lilianweng.github.io/posts/2023-06-23-agent/)

**1. LLM (the "brain").** Generates reasoning, decides what tool to call, formats arguments, interprets results.

**2. Tools / function calling.** Typed functions the LLM may invoke. Tools are how an agent turns text into real-world effects: `search(query)`, `run_python(code)`, `read_file(path)`, `send_email(...)`. Anthropic stresses that the **agent-computer interface (ACI)** — the quality of your tool definitions — is as important as the prompt:

> "One rule of thumb is to think about how much effort goes into human-computer interfaces (HCI), and plan to invest just as much effort in creating good agent-computer interfaces (ACI)."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

**3. Memory.** Weng's widely-used taxonomy:

> "Short-term memory: I would consider all the in-context learning … as utilizing short-term memory of the model to learn. Long-term memory: This provides the agent with the capability to retain and recall (infinite) information over extended periods, often by leveraging an external vector store and fast retrieval."
> — Source: [LLM Powered Autonomous Agents — Lilian Weng](https://lilianweng.github.io/posts/2023-06-23-agent/)

**4. Planning.** Decomposing the goal into subgoals.

> "Subgoal and decomposition: The agent breaks down large tasks into smaller, manageable subgoals, enabling efficient handling of complex tasks."
> — Source: [LLM Powered Autonomous Agents — Lilian Weng](https://lilianweng.github.io/posts/2023-06-23-agent/)

**5. Reflection.** Self-critique that adjusts future behavior:

> "Reflection and refinement: The agent can do self-criticism and self-reflection over past actions, learn from mistakes and refine them for future steps, thereby improving the quality of final results."
> — Source: [LLM Powered Autonomous Agents — Lilian Weng](https://lilianweng.github.io/posts/2023-06-23-agent/)

### 2.4 Single-Agent vs Multi-Agent

A **single-agent** system is one LLM-in-a-loop with a toolbox. A **multi-agent** system uses several specialized agents that collaborate — e.g., a planner agent, a coder agent, a reviewer agent — typically coordinated by an **orchestrator**. Anthropic describes the production-ready version of this pattern:

> "In the orchestrator-workers workflow, a central LLM dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results. … This workflow is well-suited for complex tasks where you can't predict the subtasks needed (in coding, for example, the number of files that need to be changed and the nature of the change in each file likely depend on the task)."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

Multi-agent systems add power (specialization, parallelism) and cost (more tokens, more coordination bugs). For beginners: start single-agent.

### 2.5 Common Agent Patterns

**ReAct (Reasoning + Acting).** The foundational pattern behind most modern agents, from Yao et al. (2022):

> "We explore the use of LLMs to generate both reasoning traces and task-specific actions in an interleaved manner, allowing for greater synergy between the two: reasoning traces help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface with external sources."
> — Source: [ReAct: Synergizing Reasoning and Acting in Language Models — Yao et al., arXiv:2210.03629](https://arxiv.org/abs/2210.03629)

A ReAct trace looks like this (from the Prompting Guide's worked HotpotQA example):

```
Question   What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?
Thought 1  I need to search Colorado orogeny, find the area that the eastern sector of the Colorado orogeny extends into, then find the elevation range of the area.
Action 1   Search[Colorado orogeny]
Observation 1  The Colorado orogeny was an episode of mountain building (an orogeny) in Colorado and surrounding areas.
Thought 2  It does not mention the eastern sector. So I need to look up eastern sector.
Action 2   Lookup[eastern sector]
Observation 2  (Result 1 / 1) The eastern sector extends into the High Plains and is called the Central Plains orogeny.
...
Action 5   Finish[1,800 to 7,000 ft]
```
> — Source: [ReAct Prompting — Prompt Engineering Guide](https://www.promptingguide.ai/techniques/react) | Provenance: verbatim

**Plan-and-Execute.** An explicit planner creates the full plan first; an executor runs each step; a re-planner is called if things drift:

> "It consists of two basic components: A planner, which prompts an LLM to generate a multi-step plan to complete a large task. Executor(s), which accept the user query and a step in the plan and invoke 1 or more tools to complete that task. Once execution is completed, the agent is called again with a re-planning prompt, letting it decide whether to finish with a response or whether to generate a follow-up plan."
> — Source: [Plan-and-Execute Agents — LangChain Blog (Feb 13, 2024)](https://blog.langchain.com/planning-agents/)

Trade-off vs ReAct (same source):

> "They can execute multi-step workflow faster, since the larger agent doesn't need to be consulted after each action. … [But ReAct] requires an LLM call for each tool invocation. The LLM only plans for 1 sub-problem at a time."
> — Source: [Plan-and-Execute Agents — LangChain Blog](https://blog.langchain.com/planning-agents/)

**Reflexion.** Adds a verbal self-feedback step stored in an episodic memory buffer between trials:

> "We propose Reflexion, a novel framework to reinforce language agents not by updating weights, but instead through linguistic feedback. Concretely, Reflexion agents verbally reflect on task feedback signals, then maintain their own reflective text in an episodic memory buffer to induce better decision-making in subsequent trials."
> — Source: [Reflexion: Language Agents with Verbal Reinforcement Learning — Shinn et al., arXiv:2303.11366](https://arxiv.org/abs/2303.11366)

**Other named patterns.** Tree of Thoughts (branching exploration), ReWOO (plan with variable references to avoid re-planning), LLMCompiler (parallel tool calls), and simpler compositional workflows that Anthropic catalogs as *prompt chaining*, *routing*, *parallelization*, *orchestrator-workers*, and *evaluator-optimizer*.

### 2.6 When to Use Agents vs Direct Prompting

Anthropic's guidance is unusually blunt and beginner-friendly:

> "When building applications with LLMs, we recommend finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all. Agentic systems often trade latency and cost for better task performance, and you should consider when this tradeoff makes sense."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

A practical decision ladder:

1. **Single LLM call with good prompt + retrieval (RAG).** Default choice.
2. **Prompt chain / workflow.** When you can enumerate the steps up front.
3. **Agent (ReAct / tool-calling loop).** When the steps depend on what is discovered at runtime.
4. **Multi-agent / orchestrator-workers.** When specialization or parallelism clearly pays for its complexity.

Chip Huyen frames the fundamental economics with the *compound error* problem:

> "Compound mistakes: an agent often needs to perform multiple steps to accomplish a task, and the overall accuracy decreases as the number of steps increases. If the model's accuracy is 95% per step, over 10 steps, the accuracy will drop to 60%, and over 100 steps, the accuracy will be only 0.6%."
> — Source: [Agents — Chip Huyen](https://huyenchip.com/2025/01/07/agents.html)

This is why strong per-step reliability, good tool design, and reflection matter — not just "smarter" models.

### 2.7 Trust, Safety, and the Autonomy Spectrum

Because agents take real actions, safety is not optional. Beginner-level considerations:

- **Higher stakes than a chatbot.** Huyen: *"with access to tools, agents are capable of performing more impactful tasks, but any failure could have more severe consequences."* ([Agents — Chip Huyen](https://huyenchip.com/2025/01/07/agents.html))
- **Human-in-the-loop checkpoints.** Anthropic: *"Agents can then pause for human feedback at checkpoints or when encountering blockers."* ([Building effective agents](https://www.anthropic.com/engineering/building-effective-agents))
- **Stopping conditions.** *"it's also common to include stopping conditions (such as a maximum number of iterations) to maintain control."* (same source)
- **Sandboxing.** *"We recommend extensive testing in sandboxed environments, along with the appropriate guardrails."* (same source)
- **Transparency.** One of Anthropic's three core principles: *"Prioritize transparency by explicitly showing the agent's planning steps."* (same source)

The **autonomy spectrum** (synthesized from the sources above) is a useful teaching device:

```
Suggest  ─►  Approve-each-step  ─►  Approve-at-checkpoints  ─►  Autonomous-in-sandbox  ─►  Fully autonomous
(chatbot)    (edit proposals)      (agent with HITL gates)     (agent in VM/container)     (rare, high-trust)
  less autonomy ────────────────────────────────────────────────────────────────────────► more autonomy
  less risk    ────────────────────────────────────────────────────────────────────────► more risk
```

---

## 3. Getting Started

### Prerequisites

- A foundation model with **tool/function calling** support. As of this writing, major commercial and open-model providers expose some form of tool/function calling, but the exact surface varies by vendor and changes frequently — consult each vendor's current API reference before building. Anthropic documents tool-calling as the substrate of agents in [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) ("they are typically just LLMs using tools … in a loop"), and the Model Context Protocol docs describe the emerging cross-vendor standard ([MCP introduction](https://modelcontextprotocol.io/introduction)). *Specific provider availability was not individually verified in this research.*
- A Python environment (3.10+) and either a vendor SDK or an agent framework. Anthropic's post lists several widely-used frameworks in its opening section: *"There are many frameworks that make agentic systems easier to implement, including: LangGraph from LangChain; Amazon Bedrock's AI Agent framework; Rivet … ; and Vellum"* ([Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)). Other frameworks mentioned in this report (LlamaIndex, smolagents, Claude Agent SDK, Strands Agents SDK, AutoGen, CrewAI) are widely discussed in the ecosystem but were not each independently verified against a primary source in this research.
- An API key, exported as an environment variable.

### Installation & Setup

#### Terminal Commands

```bash
# Minimal, vendor-neutral starting point (pick ONE provider SDK)
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install --upgrade pip
pip install openai            # or: pip install anthropic
# Optional agent frameworks:
# pip install langchain langgraph
# pip install smolagents
```
> — Source: synthesized standard Python packaging steps; framework names per [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) and [smolagents — Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit1/introduction) | Provenance: synthesized

#### Python Setup

```python
# Environment check for any tool-calling-capable model
import os, sys
assert sys.version_info >= (3, 10), "Use Python 3.10+"
assert os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY"), \
    "Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment."
print("Ready.")
```
> — Source: synthesized environment-check boilerplate aligned with vendor SDK auth conventions referenced in [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) | Provenance: synthesized

---

## 4. Core Usage

This section shows the *agentic loop* from scratch, using only an LLM provider SDK — no agent framework — so the mechanics are fully visible. The example is deliberately vendor-neutral in spirit; concrete code uses the OpenAI Python SDK because its tool-calling schema is the most widely-copied.

### 4.1 A Minimal ReAct-Style Agent (Python)

```python
# Example: a minimal tool-using agent that loops until the model stops calling tools.
# Pattern: ReAct / tool-calling loop (Yao et al., 2022).
# Source of pattern: https://www.anthropic.com/engineering/building-effective-agents
#                    https://arxiv.org/abs/2210.03629
# This is synthesized example code illustrating the loop; it is not copied from a single page.

import json
import os
from openai import OpenAI  # pip install openai

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# --- 1. Define tools the agent can call -------------------------------------
def get_weather(city: str) -> str:
    """Fake weather tool. Real version would hit an API."""
    fake = {"Paris": "18C, cloudy", "Tokyo": "24C, sunny", "Seattle": "12C, rain"}
    return fake.get(city, f"No data for {city}")

def calculator(expression: str) -> str:
    """Evaluate a simple arithmetic expression. Sandboxed: digits/operators only."""
    allowed = set("0123456789+-*/(). ")
    if not set(expression) <= allowed:
        return "ERROR: disallowed characters"
    try:
        return str(eval(expression, {"__builtins__": {}}, {}))
    except Exception as e:
        return f"ERROR: {e}"

TOOLS_IMPL = {"get_weather": get_weather, "calculator": calculator}

# Tool schemas describe the tools to the model (this is the "agent-computer interface").
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Evaluate a basic arithmetic expression.",
            "parameters": {
                "type": "object",
                "properties": {"expression": {"type": "string"}},
                "required": ["expression"],
            },
        },
    },
]

# --- 2. The agentic loop ----------------------------------------------------
def run_agent(user_goal: str, max_steps: int = 6) -> str:
    """Perceive -> Reason -> Act -> Observe, until the model stops calling tools."""
    messages = [
        {"role": "system", "content":
            "You are a careful assistant. Use tools when they help. "
            "Think step by step. Stop as soon as you have a final answer."},
        {"role": "user", "content": user_goal},
    ]

    for step in range(max_steps):
        resp = client.chat.completions.create(
            model="gpt-4o-mini",  # any tool-calling-capable model
            messages=messages,
            tools=TOOLS_SCHEMA,
            tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg.model_dump(exclude_none=True))

        # Stopping condition: model produced a final answer (no tool calls).
        if not msg.tool_calls:
            return msg.content or ""

        # OBSERVE: run each tool call and feed results back in.
        for call in msg.tool_calls:
            name = call.function.name
            args = json.loads(call.function.arguments or "{}")
            try:
                result = TOOLS_IMPL[name](**args)
            except Exception as e:
                result = f"TOOL_ERROR: {e}"
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": str(result),
            })

    return "Stopped: max_steps reached before a final answer."

if __name__ == "__main__":
    print(run_agent(
        "What is the weather in Tokyo, and what is 23 * 47 plus that temperature in Celsius?"
    ))
```
> — Source: pattern adapted from [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) and [ReAct — Yao et al.](https://arxiv.org/abs/2210.03629) | Provenance: synthesized

Notes on what this 60-line loop demonstrates:

- **Perceive** = the `user_goal` plus any prior messages in `messages`.
- **Reason/plan** = the `chat.completions.create` call; the LLM decides whether to call a tool.
- **Act** = `TOOLS_IMPL[name](**args)`.
- **Observe** = appending the tool result with `role: "tool"`.
- **Stopping condition** = the model emits no more `tool_calls`, OR `max_steps` is hit (this is the "stopping condition" Anthropic recommends).

### 4.2 Adding Reflection (Pseudocode Sketch)

**Note:** The block below is **pseudocode**, not runnable Python. `judge_success` and `reflect_on_failure` are intentionally left as abstract placeholders because their concrete implementation (test harness, heuristic, or LLM-as-judge) is application-specific. For a runnable reference, see the [Reflexion paper's official code](https://arxiv.org/abs/2303.11366). A runnable minimal implementation of these placeholders is sketched immediately after.

```text
# PSEUDOCODE — Reflexion-style wrapper
# Pattern source: Shinn et al., 2023 (arXiv:2303.11366)

function run_with_reflection(goal, max_trials = 3):
    memory ← []   # episodic memory buffer of verbal reflections
    for trial in 1..max_trials:
        hint ← if memory nonempty then "\nLessons from prior attempts:\n" + join(memory) else ""
        result ← run_agent(goal + hint)
        if judge_success(goal, result):         # domain evaluator: tests, heuristic, or LLM judge
            return result
        memory.append(reflect_on_failure(goal, result))   # LLM-generated critique
    return result
```
> — Source: pattern from [Reflexion — Shinn et al., arXiv:2303.11366](https://arxiv.org/abs/2303.11366) | Provenance: synthesized pseudocode

Minimal runnable version with concrete placeholder implementations (uses `run_agent` from §4.1):

```python
# Example: Reflexion-style self-reflection loop, runnable end-to-end.
# Source of pattern: https://arxiv.org/abs/2303.11366
# This is a synthesized minimal illustration, not the paper's reference code.

import os
from openai import OpenAI
# Assumes run_agent(...) from §4.1 is importable in the same module.

_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def judge_success(goal: str, result: str) -> bool:
    """LLM-as-judge: returns True iff the result plausibly satisfies the goal."""
    verdict = _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Answer strictly YES or NO."},
            {"role": "user", "content": f"Goal:\n{goal}\n\nResult:\n{result}\n\nDoes the result satisfy the goal?"},
        ],
    ).choices[0].message.content or ""
    return verdict.strip().upper().startswith("YES")

def reflect_on_failure(goal: str, result: str) -> str:
    """Produce a one-paragraph written lesson from the failed attempt."""
    return _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You write concise lessons-learned notes."},
            {"role": "user", "content": f"Goal:\n{goal}\n\nFailed result:\n{result}\n\nWrite ONE short lesson to avoid this failure next time."},
        ],
    ).choices[0].message.content or ""

def run_with_reflection(goal: str, max_trials: int = 3) -> str:
    memory: list[str] = []
    result = ""
    for _ in range(max_trials):
        hint = ("\n\nLessons from previous attempts:\n- " + "\n- ".join(memory)) if memory else ""
        result = run_agent(goal + hint)
        if judge_success(goal, result):
            return result
        memory.append(reflect_on_failure(goal, result))
    return result

if __name__ == "__main__":
    print(run_with_reflection("What is 23 * 47 plus the temperature in Tokyo in Celsius?"))
```
> — Source: pattern from [Reflexion — Shinn et al., arXiv:2303.11366](https://arxiv.org/abs/2303.11366); loop structure adapted from [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) | Provenance: synthesized

### Terminal / CLI Commands

```bash
# Run the agent
python agent.py

# Cap runaway agents defensively at the process level (Linux/macOS: GNU coreutils `timeout`).
timeout 60 python agent.py
```
> — Source: `timeout` is a standard GNU coreutils utility; the underlying "stopping conditions" guidance is from [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) | Provenance: synthesized

```powershell
# Windows PowerShell equivalent — PowerShell has no built-in `-Timeout` on Start-Process,
# so use a job with Wait-Job -Timeout and Stop-Job on expiry:
$job = Start-Job -ScriptBlock { python agent.py }
if (-not (Wait-Job $job -Timeout 60)) { Stop-Job $job }
Receive-Job $job; Remove-Job $job -Force
```
> — Source: standard PowerShell `Start-Job` / `Wait-Job -Timeout` / `Stop-Job` usage (no single web source cited); stopping-condition rationale from [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) | Provenance: synthesized

```bash
# Inspect the conversation/trace — most agent frameworks ship a CLI or tracing UI
# (e.g., LangSmith, OpenTelemetry exporters). Always keep traces during development.
```
> — Source: tracing/observability guidance from [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents) | Provenance: synthesized

---

## 5. Configuration & Best Practices

### Recommended Configuration

- **Model choice.** Agents amplify per-step errors, so use the strongest tool-calling model you can afford for the planner; cheaper models can serve sub-tasks (routing/orchestrator-workers pattern from Anthropic).
- **`max_steps` / iteration cap.** Always set one. Anthropic: *"stopping conditions (such as a maximum number of iterations) to maintain control."*
- **Tool schema hygiene.** Clear name, precise JSON-schema parameters, one example in the description, explicit error modes. See Anthropic's Appendix 2 ("Prompt Engineering your Tools").
- **Absolute identifiers.** Anthropic's concrete finding: *"we found that the model would make mistakes with tools using relative filepaths after the agent had moved out of the root directory. To fix this, we changed the tool to always require absolute filepaths."* ([Building effective agents](https://www.anthropic.com/engineering/building-effective-agents))
- **Observability.** Log every message, tool call, and tool result. Traces are the debugger for agents.

### Best Practices

Anthropic's three principles (verbatim):

> "Maintain simplicity in your agent's design. Prioritize transparency by explicitly showing the agent's planning steps. Carefully craft your agent-computer interface (ACI) through thorough tool documentation and testing."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

Additional practices that recur across sources:

- **Start without a framework.** *"We suggest that developers start by using LLM APIs directly: many patterns can be implemented in a few lines of code."* (Anthropic)
- **Evaluate and iterate.** Build offline evals before adding complexity; only move up the decision ladder when metrics demand it.
- **Prefer verifiable environments.** *"Code solutions are verifiable through automated tests; Agents can iterate on solutions using test results as feedback."* (Anthropic on coding agents.)
- **Keep humans in the loop for high-stakes actions** (deploys, payments, irreversible writes).

### Common Pitfalls & Anti-Patterns

- **Over-engineering.** Wrapping a task that a single well-prompted call would solve in a multi-agent framework.
- **Ignoring compound error.** Scaling step count blindly; each step compounds failure probability (Huyen).
- **Bad tool design.** Ambiguous parameter names, overlapping tools, or formats the model must escape-encode (JSON-inside-JSON) — all documented failure modes in Anthropic Appendix 2.
- **No stopping condition.** Agents can loop forever on pathological inputs.
- **Treating the LLM's "thought" as ground truth.** ReAct's `Thought:` is still generated text; the *observation* from a tool is what grounds the agent.
- **No sandbox for write actions.** Letting an agent run arbitrary shell commands in your dev environment is a footgun.

---

## 6. Advanced Topics

### 6.1 Tool-Use Standardization: Function Calling and MCP

Two layers matter.

**Function calling** is the API-level feature by which an LLM outputs a structured request to invoke a named tool with typed arguments. It is the mechanical substrate of every modern agent.

**Model Context Protocol (MCP)** is an open standard (introduced by Anthropic in late 2024, now widely adopted) for how *agents/applications* connect to *tools and data sources*:

> "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems. Using MCP, AI applications like Claude or ChatGPT can connect to data sources (e.g. local files, databases), tools (e.g. search engines, calculators) and workflows (e.g. specialized prompts)—enabling them to access key information and perform tasks. Think of MCP like a USB-C port for AI applications."
> — Source: [What is the Model Context Protocol (MCP)? — modelcontextprotocol.io](https://modelcontextprotocol.io/introduction)

For beginners: function calling = how a *single model* calls a *single tool*; MCP = how *many agent apps* reuse *many tool servers* without bespoke glue.

### 6.2 Memory Architectures

- **Scratchpad (short-term).** Messages/thoughts kept in context.
- **Summarization.** When context fills up, summarize older turns.
- **Vector / retrieval (long-term).** Embeddings + nearest-neighbor search. Weng: *"often by leveraging an external vector store and fast retrieval."*
- **Episodic reflection memory.** Reflexion-style lessons written after each trial.
- **Structured world state.** Some agents (especially in coding) keep a JSON/graph of files, symbols, or TODOs alongside the chat — not strictly "memory" but functionally critical.

### 6.3 Planning Granularity

Huyen explicitly treats *planning granularity* as a design axis (coarse plans are faster but brittle; fine plans are slower but recover better from surprises). Plan-and-Execute trades flexibility for parallelism/speed; ReAct trades latency for adaptivity. The LangChain article quantifies the trade-off succinctly:

> "⏰ First of all, they can execute multi-step workflow faster, since the larger agent doesn't need to be consulted after each action. … 🏆 Third, they can perform better overall (in terms of task completions rate and quality) by forcing the planner to explicitly 'think through' all the steps required to accomplish the entire task."
> — Source: [Plan-and-Execute Agents — LangChain Blog](https://blog.langchain.com/planning-agents/)

### 6.4 Multi-Agent Orchestration

Beyond orchestrator-workers, common multi-agent configurations include:

- **Specialist pipeline.** Researcher → Writer → Editor.
- **Debate / critic.** One agent proposes, another critiques (evaluator-optimizer, in Anthropic's taxonomy).
- **Swarm / market.** Many peer agents bid on tasks.

Anthropic's guidance still applies: add agents only when the cost pays for itself in measured performance.

### 6.5 Coding Assistants as an Applied Example

Coding is the flagship agent domain because (a) the environment is machine-readable and (b) tests give objective ground truth:

> "In our own implementation, agents can now solve real GitHub issues in the SWE-bench Verified benchmark based on the pull request description alone."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

Huyen's example of **SWE-agent** illustrates the concrete shape of a coding agent:

> "Figure 6-8 shows a visualization of SWE-agent (Yang et al., 2024), an agent built on top of GPT-4. Its environment is the computer with the terminal and the file system. Its set of actions include navigate repo, search files, view files, and edit lines."
> — Source: [Agents — Chip Huyen](https://huyenchip.com/2025/01/07/agents.html)

Major coding assistants on the market all implement the same conceptual loop with different autonomy levels and tooling:

- **GitHub Copilot** — inline completion + chat + agent mode (tool-using, multi-file edits). *Covered in detail in separate vendor-specific research.*
- **Cursor, Windsurf, Zed AI, JetBrains AI Assistant** — IDE-integrated agents with repo-wide tool use.
- **Claude Code, Aider** — terminal-native coding agents.
- **Devin, OpenHands (formerly OpenDevin), SWE-agent** — more autonomous, sandbox-running coding agents.

All share: LLM brain, filesystem/terminal/test-runner tools, an agentic loop, and human-in-the-loop controls calibrated to their autonomy level. *The specific behaviors of each product were not deeply verified in this research — a vendor-neutral conceptual report is in scope, product claims are out of scope.*

---

## 7. Ecosystem & Alternatives

**Frameworks.** Anthropic's post explicitly names several widely-used options: *"LangGraph from LangChain; Amazon Bedrock's AI Agent framework; Rivet, a drag and drop GUI LLM workflow builder; and Vellum, another GUI tool for building and testing complex workflows"* ([Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)). Others commonly discussed in the ecosystem (not each individually verified here against a primary source) include:

- **LangChain / LangGraph** — graph-based agent runtimes; mature tracing via LangSmith ([LangChain blog on planning agents](https://blog.langchain.com/planning-agents/)).
- **smolagents** (Hugging Face) — minimal, readable reference implementation used in the HF Agents Course ([Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit1/introduction)).
- **LlamaIndex** — data-centric agents and retrieval. *Not independently cited from a primary source in this research.*
- **Claude Agent SDK** (Anthropic), **Strands Agents SDK** (AWS), **AutoGen** (Microsoft), **CrewAI**, **Rivet**, **Vellum** — widely referenced in vendor blogs and the agent ecosystem; only Rivet and Vellum are directly named in our primary Anthropic source. *Other names in this list are included as ecosystem context and were not each independently verified.*

Anthropic's caveat applies to all of them:

> "These frameworks make it easy to get started by simplifying standard low-level tasks like calling LLMs, defining and parsing tools, and chaining calls together. However, they often create extra layers of abstraction that can obscure the underlying prompts and responses, making them harder to debug."
> — Source: [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)

**Alternatives to "build an agent":** RAG-augmented prompting, deterministic workflows, rule-based automation (Zapier/n8n + LLM-as-component), classical planners (e.g., PDDL solvers, which Weng discusses under LLM+P). When the domain is well-structured, these are often cheaper, faster, and safer than a general agent.

---

## 8. Research Limitations

- **Fast-moving field.** Huyen explicitly warns: *"AI-powered agents are an emerging field with no established theoretical frameworks for defining, developing, and evaluating them."* ([Agents — Chip Huyen](https://huyenchip.com/2025/01/07/agents.html)) Terminology still varies (e.g., "agent" vs "workflow" boundaries differ between Anthropic and Huyen).
- **Source concentration.** The modern vocabulary is heavily shaped by a few influential posts (Anthropic Dec-2024, Weng Jun-2023, Huyen Jan-2025) and three papers (ReAct, Reflexion, Plan-and-Solve). Other perspectives exist but converge on the same building blocks.
- **One source was blocked.** `openai.com` returned a Cloudflare JS-challenge page for our non-browser fetch, so OpenAI's official "agents" positioning is not quoted here; the concepts (function calling, tool use) are well-represented by other primary sources.
- **Coding-assistant specifics intentionally out of scope.** This report is the vendor-neutral foundation for the presentation; product-specific research on GitHub Copilot (and comparisons) is handled in companion research files.
- **Empirical numbers are illustrative, not benchmarks.** The "95%¹⁰ = 60%" compounding figure is Huyen's didactic example, not a measured benchmark.
- **Safety coverage is beginner-level only.** We cite autonomy, HITL, and sandboxing conceptually; adversarial topics (prompt injection, tool poisoning, data exfiltration via tools, model alignment) are acknowledged but not deeply explored here.
- **No conflicting sources needed reconciliation.** The sources disagree mainly on vocabulary (e.g., whether "agent" includes simple tool-using chatbots); we favored Anthropic's workflow-vs-agent distinction for clarity with beginners, while noting Huyen's broader definition.

---

## 9. Complete Reference List

### Documentation & Articles

- [Building effective agents — Anthropic (Erik Schluntz & Barry Zhang, Dec 19, 2024)](https://www.anthropic.com/engineering/building-effective-agents) — Canonical vendor-neutral taxonomy of agentic patterns (augmented LLM, prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer, autonomous agents) and best practices for agent-computer interfaces.
- [LLM Powered Autonomous Agents — Lilian Weng (Jun 23, 2023)](https://lilianweng.github.io/posts/2023-06-23-agent/) — The most-cited conceptual overview: planning, memory (short/long-term), tool use, self-reflection.
- [Agents — Chip Huyen (Jan 7, 2025)](https://huyenchip.com/2025/01/07/agents.html) — Standalone chapter adapted from *AI Engineering* (2025); rigorous treatment of definitions, tools, planning, failure modes, compound error.
- [ReAct Prompting — Prompt Engineering Guide](https://www.promptingguide.ai/techniques/react) — Accessible walkthrough of ReAct with verbatim HotpotQA trace and LangChain example.
- [Introduction to Agents — Hugging Face Agents Course (Unit 1)](https://huggingface.co/learn/agents-course/en/unit1/introduction) — Beginner-oriented curriculum introducing the Think → Act → Observe cycle.
- [Plan-and-Execute Agents — LangChain Blog (Feb 13, 2024)](https://blog.langchain.com/planning-agents/) — Comparison of ReAct vs Plan-and-Execute vs ReWOO vs LLMCompiler; explains trade-offs crisply.
- [What is the Model Context Protocol (MCP)? — modelcontextprotocol.io](https://modelcontextprotocol.io/introduction) — Official intro to the open standard for connecting agents to tools/data.

### Research Papers (arXiv)

- [ReAct: Synergizing Reasoning and Acting in Language Models — Yao et al., arXiv:2210.03629 (v3 Mar 2023)](https://arxiv.org/abs/2210.03629) — Founding paper of the interleaved thought/action/observation pattern used by most modern agents.
- [Reflexion: Language Agents with Verbal Reinforcement Learning — Shinn et al., arXiv:2303.11366 (v4 Oct 2023)](https://arxiv.org/abs/2303.11366) — Defines verbal self-reflection with an episodic memory buffer as a lightweight alternative to RL fine-tuning.

### GitHub Repositories

*Not applicable to this vendor-neutral conceptual report; framework-specific repos are referenced via the documentation sources above (e.g., LangGraph's plan-and-execute notebooks linked from the LangChain blog post).*

### Code Samples

- Minimal ReAct-style tool-calling agent in §4.1 — Python, OpenAI SDK, synthesized from the patterns in Anthropic's post and the ReAct paper.
- Conceptual Reflexion wrapper in §4.2 — Python sketch based on Shinn et al. (2023).

---

## Revision Round 2 — 2026-04-21

Addressed every 🟡 Important finding from `agent-reviews/2026-04-21-web-research-reviewer-agentic-foundations.md`:

- ✅ fixed — **Executive Summary citation coverage.** Added inline citations for the agent definition (Huyen, Weng), the Think→Act→Observe loop (Hugging Face), the workflow-vs-agent distinction (Anthropic), the building blocks (Weng), each pattern example (ReAct/Yao et al., Plan-and-Execute/LangChain, Reflexion/Shinn et al.), the orchestrator pattern (Anthropic), the tradeoffs framing (Anthropic, Huyen), and the coding-assistant application claim (Anthropic SWE-bench quote + Huyen SWE-agent analysis); added explicit uncertainty caveat that vendor-specific product claims were not independently verified.
- ✅ fixed — **§3 Prerequisites time-sensitive vendor claim.** Removed the unsourced "Anthropic, OpenAI, Google, Meta/Llama, and Mistral APIs all expose this in 2024–2026" sentence and replaced with softer wording that cites Anthropic and MCP as primary sources and explicitly notes that specific provider availability was not individually verified.
- ✅ fixed — **§3 / §7 framework list sourcing.** §3 now cites Anthropic's explicit framework list for LangGraph/Bedrock/Rivet/Vellum and labels the others (LlamaIndex, smolagents, Claude Agent SDK, Strands, AutoGen, CrewAI) as ecosystem context not independently verified. §7 was restructured to open with Anthropic's verbatim framework list, with other names clearly flagged as unverified.
- ✅ fixed — **§3 code-block attributions.** Added `> — Source: ... | Provenance: ...` lines after the Terminal Commands block and the Python Setup block.
- ✅ fixed — **§4 Terminal/CLI attributions.** Added post-block `> — Source: ... | Provenance: ...` lines after the terminal/PowerShell command groups in §4.
- ✅ fixed — **§4.2 Reflexion sketch.** Split into two clearly-labeled artifacts: (a) a `text`-fenced **pseudocode** block explicitly marked "PSEUDOCODE — not runnable," and (b) a runnable minimal Python implementation that defines `judge_success` and `reflect_on_failure` as real LLM-as-judge helpers, so readers get either a clean conceptual sketch or copy-paste-ready code.
- ✅ fixed — **§4 incorrect PowerShell guidance.** Removed the "`Start-Process -Timeout`" claim (no such parameter exists). Replaced with a separate, working PowerShell block using `Start-Job` + `Wait-Job -Timeout` + `Stop-Job`, which is the standard idiom.

No 🟢 Minor findings from this round were deferred; the reviewer's one optional suggestion (strengthen setup with a primary source for tool-calling support) is substantively addressed by the Anthropic + MCP citations now in §3.

Ready for re-review by `web-research-reviewer`.

---

## Revision Round 3 — 2026-04-21

Addressed the remaining 🟡 Important finding from Round 2 of `agent-reviews/2026-04-21-web-research-reviewer-agentic-foundations.md`:

- ✅ fixed — **§4 Terminal / CLI per-block attribution.** The three fenced blocks in §4 (bash `python agent.py` / `timeout`, PowerShell `Start-Job`/`Wait-Job`, and the tracing bash comment block) previously shared a single trailing `> — Source: ... | Provenance: ...` line after the cluster. Each block now has its own immediately-following attribution line: (1) bash block cites GNU coreutils `timeout` plus Anthropic's stopping-conditions guidance; (2) PowerShell block cites standard `Start-Job`/`Wait-Job -Timeout`/`Stop-Job` usage plus Anthropic's stopping-conditions rationale; (3) tracing comment block cites Anthropic's observability/tracing guidance. All marked `Provenance: synthesized`.

No 🟢 Minor findings to address in this round.

Ready for re-review by `web-research-reviewer`.
