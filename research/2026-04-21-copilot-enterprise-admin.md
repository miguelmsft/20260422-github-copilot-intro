# Research Report: GitHub Copilot Enterprise Admin Controls

**Date:** 2026-04-21
**Researcher:** Copilot Web Researcher Agent
**Topic slug:** copilot-enterprise-admin
**Sources consulted:** 24 GitHub Docs pages (docs.github.com), 0 GitHub repositories

> **Revision Round 2 — 2026-04-21.** This revision addresses the `web-research-reviewer` Round 1 findings (verdict: `APPROVED WITH EDITS`). Changes: inline citations added throughout the Executive Summary and to previously uncited operational assertions in Sections 1, 3, and 4; the `Sources consulted` count reconciled to 24 to match the reference list; previously orphaned references (`manage-enterprise-policies`, `manage-for-organization/manage-policies`, `view-license-usage`, `view-usage-and-adoption`, `prepare-for-custom-agents`, `copilot-requests`, `network-settings`, `model-hosting`, IAM fundamentals) are now cited at point of use.

---

## Executive Summary

GitHub Copilot for organizations is sold in two paid plans — **Copilot Business** ($19/seat/month, 300 premium requests/user) and **Copilot Enterprise** ($39/seat/month, 1,000 premium requests/user), with overage billed at $0.04 per premium request ([Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)). Both are administered primarily from the **enterprise "AI controls" tab** on GitHub.com (and a parallel **organization Settings → Copilot** page), which exposes policy toggles for features, models, MCP, and agents ([Managing policies and features for GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies); [Managing policies and features for GitHub Copilot in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies)); content-exclusion rules ([Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)); BYOK custom models ([Using your LLM provider API keys with Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys)); audit-log access ([Reviewing audit logs for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs)); and cloud-agent enablement ([Enabling GitHub Copilot cloud agent in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/enable-copilot-cloud-agent)).

Admins control who gets Copilot — seat assignment directly to users/teams for Business, or per-organization enablement for either plan ([Granting users access to GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/grant-access)); where Copilot can talk on the network — subscription-based routing via `*.business.githubcopilot.com` / `*.enterprise.githubcopilot.com` plus a published allowlist ([Managing GitHub Copilot access to your enterprise's network](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/manage-network-access); [Copilot allowlist reference](https://docs.github.com/en/copilot/reference/allowlist-reference)); what it can see via content exclusion at repo/org level ([Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)); which models it uses — built-in model allow-lists plus optional **Bring Your Own Key** to Anthropic, AWS Bedrock, Google AI Studio, Microsoft Foundry, OpenAI, and xAI ([Using your LLM provider API keys with Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys)); how much it can spend — the "Premium request paid usage" policy plus budgets, with $0.04/request overage ([Managing the premium request allowance](https://docs.github.com/en/copilot/how-tos/manage-and-track-spending/manage-request-allowances)); and whether the **Copilot cloud agent** is allowed at all ([Enabling GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/enable-copilot-cloud-agent); [Blocking GitHub Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/block-copilot-cloud-agent)). Authentication and user lifecycle typically flow through **Enterprise Managed Users** with SAML/OIDC + SCIM from Entra ID, Okta, or PingFederate ([About Enterprise Managed Users](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/about-enterprise-managed-users); [Identity and access management fundamentals](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/about-identity-and-access-management)).

This report is beginner-facing and condensed to roughly five "slides" of content. It is based only on authoritative GitHub documentation current as of April 2026; it does not cover every edge case (for example, data-residency enterprises on GHE.com or GitHub Enterprise Server specifics).

---

## Table of Contents

1. [Overview — Plans & Admin Consoles](#1-overview--plans--admin-consoles)
2. [Policy Controls — Features, Models, Content Exclusion](#2-policy-controls--features-models-content-exclusion)
3. [Identity, Seats, Audit Logs, and Usage Reports](#3-identity-seats-audit-logs-and-usage-reports)
4. [Network, Budgets, BYOK, and Coding Agent Approvals](#4-network-budgets-byok-and-coding-agent-approvals)
5. [Research Limitations](#5-research-limitations)
6. [Complete Reference List](#6-complete-reference-list)

---

## 1. Overview — Plans & Admin Consoles

### What it is
GitHub Copilot enterprise admin controls are the set of policies, settings, and reports that **enterprise owners** and **organization owners** use to govern how Copilot is deployed to their developers — who gets a seat, which features/models they can use, what data Copilot may see, how it reaches the internet, how much it costs, and what the coding agent is allowed to do.

### Why it matters
Copilot touches source code, prompts, and production workflows. Enterprise administrators need centralized guardrails for security, compliance, cost, and consistent developer experience across many organizations and teams.

### Plans at a glance (April 2026)

| Plan | Price | Premium requests / user / mo | Audience |
|---|---|---|---|
| Copilot Business | $19/seat/mo | 300 | Orgs on GitHub Team or GHEC; centralized policy control |
| Copilot Enterprise | $39/seat/mo | 1,000 | GHEC only; adds enterprise-grade features on top of Business |
| Overage | $0.04 / premium request | — | Both, gated by policy + budgets |

> "GitHub Copilot Business is for organizations on GitHub Free or GitHub Team plan, or enterprises on GitHub Enterprise Cloud… GitHub Copilot Enterprise is for enterprises using GitHub Enterprise Cloud. It includes all the features of Copilot Business, plus additional enterprise-grade capabilities."
> — Source: [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)

> "Purchase additional premium requests at $0.04/request"
> — Source: [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)

### Admin consoles
- **Enterprise → "AI controls" tab** is the main console. It has sub-pages for **Copilot** (feature/privacy policies), **Models** (model allow-lists and BYOK), **Agents** (cloud agent, code review, Spark, coding-agent partners), and **MCP** (Model Context Protocol registry/servers). Audit logs live under **Settings → Audit log**; seats and spend live under **Billing and licensing**, including the dedicated Copilot tab for license counts ([Managing policies and features for GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies); [Viewing Copilot license usage in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/view-license-usage)).
- **Organization → Settings → Copilot** exposes the equivalent policy, model, and cloud-agent pages for that single org, constrained by anything the enterprise has already pinned ([Managing policies and features for GitHub Copilot in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies)).

> "Enterprise owners can choose to set policies for Copilot at the enterprise level or to delegate the decision to organization owners… If a policy is defined at the enterprise level, the policy applies to all users and control of the policy is disabled at the organization level."
> — Source: [GitHub Copilot policies to control availability of features and models](https://docs.github.com/en/copilot/concepts/policies)

---

## 2. Policy Controls — Features, Models, Content Exclusion

### Policy types
Copilot groups policies into three families on the **AI controls** page:
- **Feature policies** — per-feature toggles (e.g., Copilot in the IDE, Copilot in GitHub.com, Copilot code review, Copilot CLI, MCP servers in Copilot, Copilot usage metrics, Copilot cloud agent). Values: **Enabled / Disabled / Unconfigured / No policy** (and **Enabled for selected organizations** for the cloud agent).
- **Privacy policies** — potentially sensitive toggles (e.g., "Suggestions matching public code" block, feedback collection opt-in). Values are **Allowed / Blocked**.
- **Models policies** — availability of premium, preview, or custom models on the **Models** page. Enterprise owners can pin "No policy", enable, or disable specific models.

> "For privacy policies, the options are called 'Allowed' and 'Blocked' in preference to enabled and disabled. This provides a clearer message of the impact of a privacy policy."
> — Source: [GitHub Copilot policies to control availability of features and models](https://docs.github.com/en/copilot/concepts/policies)

### Model allow-lists & BYOK
The **Models** page lets admins enable/disable each built-in model (Claude Opus/Sonnet/Haiku, Gemini, GPT‑5.x, Grok, etc.) and is also where **Bring Your Own Key** custom models are added and scoped per organization (see §4).

> "Models policy: Defines the availability of models beyond the basic models provided with Copilot, which may incur additional costs. Shown on the 'Models' page."
> — Source: [GitHub Copilot policies to control availability of features and models](https://docs.github.com/en/copilot/concepts/policies)

### Content exclusion
Content exclusion tells Copilot to **ignore specific files/paths** so they don't flow into suggestions, chat, or code review. It can be set by **repository admins** (for one repo) or **organization owners** (for all seats assigned by that org). Key points for admins:

- Affects inline suggestions, Copilot Chat context, and Copilot code review on github.com.
- **Not supported in Edit and Agent modes** of Copilot Chat in VS Code (and some IDEs).
- Does **not** cover symlinks or remote filesystems.
- Semantic info (types, hover docs) can still reach Copilot via IDE services.

> "Content exclusion is currently not supported in Edit and Agent modes of Copilot Chat in Visual Studio Code and other editors."
> — Source: [Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)

> "It's possible that Copilot may use semantic information from an excluded file if the information is provided by the IDE indirectly."
> — Source: [Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion)

---

## 3. Identity, Seats, Audit Logs, and Usage Reports

### SSO / SAML / SCIM
For strict identity control, most enterprises use **Enterprise Managed Users (EMU)**. EMU provisions accounts from the IdP via SCIM and authenticates them via SAML (or OIDC with Entra ID). Supported partner IdPs:

| Partner IdP | SAML | OIDC | SCIM |
|---|---|---|---|
| Microsoft Entra ID | ✔ | ✔ | ✔ |
| Okta | ✔ | ✖ | ✔ |
| PingFederate | ✔ | ✖ | ✔ |

Non-EMU enterprises can also layer **SAML SSO** on top of personal accounts as an access restriction ([Identity and access management fundamentals](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/about-identity-and-access-management)).

> "The combination of **Okta and Entra ID** for SSO and SCIM (in either order) is explicitly **not supported**. GitHub's SCIM API will return an error to the identity provider on provisioning attempts if this combination is configured."
> — Source: [About Enterprise Managed Users](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/about-enterprise-managed-users)

### Seat management
Two models coexist:
1. **Assign Business licenses directly to users or enterprise teams** — simplifies scale and can be synced from an IdP group. (Enterprise-plan licenses cannot be assigned this way; they must flow through an organization.)
2. **Enable Copilot per organization** — each org owner then grants seats to members; an enterprise with a Copilot Enterprise plan can mix-and-match Enterprise vs. Business per org.

> "Assign licenses directly to users or teams in the enterprise. This approach simplifies license management at scale… This approach is currently only available for Copilot Business licenses."
> — Source: [Granting users access to GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/grant-access)

Seat totals and spend for the current billing cycle appear under **Enterprise → Billing and licensing → Copilot tab** ([Viewing Copilot license usage in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/view-license-usage)).

### Audit logs
Copilot admin actions and agent actions are captured in the standard enterprise audit log.

- `action:copilot` filters to Copilot plan events (policy changes, seat grants/revokes).
- `actor:Copilot` filters to autonomous agent activity (e.g., `pull_request.create` where `actor_is_agent:true`).
- `agent_session_id` ties events back to a single cloud-agent session.
- Retention is **180 days**; GitHub recommends **streaming to a SIEM** for long-term history and alerting.

```text
# Example enterprise audit-log queries
action:copilot
action:copilot.cfb_seat_assignment_created
actor:Copilot action:pull_request.create
```
> — Source: [Reviewing audit logs for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs) + [Audit log events for agents](https://docs.github.com/en/copilot/reference/agentic-audit-log-events) | Provenance: adapted

> "The audit log retains events for the last 180 days. We recommend streaming the audit log to a Security Information and Event Management (SIEM) platform…"
> — Source: [Reviewing audit logs for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs)

> "The audit log does not include client session data, such as the prompts a user sends to Copilot locally."
> — Source: [Reviewing audit logs for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs)

### Usage and adoption reports
The **Copilot usage metrics dashboard** lives under **Enterprise → Insights → Copilot usage**. It requires the "Copilot usage metrics" policy to be enabled, reflects IDE telemetry (may lag up to 3 UTC days), and offers NDJSON export plus a REST API ([Viewing the Copilot usage metrics dashboard](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/view-usage-and-adoption)). For agent activity specifically, admins can review the **Agent sessions** list on the AI controls page (last 24 h) and drill to the audit log for 180-day history ([Monitoring agentic activity in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/monitor-agentic-activity)).

---

## 4. Network, Budgets, BYOK, and Coding Agent Approvals

### Network / firewall requirements
Copilot uses **subscription-based network routing** so admins can force traffic through plan-specific endpoints and block personal plans on corporate networks.

Minimum firewall allowlist (core):

```text
https://github.com/login/*
https://api.github.com/user
https://api.github.com/copilot_internal/*
https://copilot-telemetry.githubusercontent.com/telemetry
https://collector.github.com/*
https://default.exp-tas.com
https://copilot-proxy.githubusercontent.com
https://origin-tracker.githubusercontent.com
https://*.githubcopilot.com/*
https://*.business.githubcopilot.com       # Copilot Business endpoint
https://*.enterprise.githubcopilot.com     # Copilot Enterprise endpoint
https://copilot-reports-*.b01.azurefd.net  # usage-metrics downloads

# Typically block to prevent personal-plan use on corporate network:
https://*.individual.githubcopilot.com
```
> — Source: [Copilot allowlist reference](https://docs.github.com/en/copilot/reference/allowlist-reference) + [Managing GitHub Copilot access to your enterprise's network](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/manage-network-access) | Provenance: verbatim

> "Copilot subscription-based network routing is enabled for all users. This ensures that users access Copilot through an endpoint that is specific to their Copilot plan."
> — Source: [Managing GitHub Copilot access to your enterprise's network](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/manage-network-access)

Proxy servers and custom TLS certificates for Copilot clients are configured via client-side network settings rather than a server-side console ([Network settings for GitHub Copilot](https://docs.github.com/en/copilot/concepts/network-settings)). The **Copilot cloud agent** runs behind its own built-in firewall with a recommended allowlist (OS package mirrors, container registries, language registries, common CAs); admins can customize or disable this per org/repo ([Copilot allowlist reference](https://docs.github.com/en/copilot/reference/allowlist-reference)).

### Premium request budgets & overage controls
Two layers gate overage spend:

1. **"Premium request paid usage" policy** — enabled by default, can be pinned Enabled/Disabled per enterprise or organization, or **Enabled for specific products** (Copilot, Spark, Copilot cloud agent have separate SKUs since Nov 1, 2025) ([Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests); [Managing the premium request allowance](https://docs.github.com/en/copilot/how-tos/manage-and-track-spending/manage-request-allowances)).
2. **Budgets** — "Bundled premium requests budget" (all SKUs together, recommended) or per-SKU budgets. If a budget with *"Stop usage when budget limit is reached"* is exhausted, additional premium requests are **blocked**, even if the policy is enabled.

> "The **Premium request paid usage policy** must be enabled for any additional billing to occur. Budgets then control whether and when usage is stopped."
> — Source: [Managing the premium request allowance for your organization or enterprise](https://docs.github.com/en/copilot/how-tos/manage-and-track-spending/manage-request-allowances)

> "Copilot Business users who make more than 800 premium requests per month would save money with a Copilot Enterprise license."
> — Source: [Managing the premium request allowance for your organization or enterprise](https://docs.github.com/en/copilot/how-tos/manage-and-track-spending/manage-request-allowances)

### BYOK (Bring Your Own Key) model management — public preview
Enterprise or org owners can plug in their own LLM provider keys so chosen models appear in Copilot Chat and Copilot CLI for selected organizations, billed against the customer's provider account rather than Copilot allowances.

Supported providers: **Anthropic, AWS Bedrock, Google AI Studio, Microsoft Foundry, OpenAI, OpenAI-compatible providers, xAI** (fine-tuned models allowed but must be tested) ([Using your LLM provider API keys with Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys)). For context on where GitHub-hosted models run and the associated data-use commitments that BYOK lets customers sidestep, see [Hosting of models for GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/model-hosting).

High-level flow: **AI controls → Copilot → Configure allowed models → Custom models → Add API key → select provider + models → Save → Access tab → allow for all or specific organizations** ([Using your LLM provider API keys with Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys)).

> "The ability to bring your own API keys to GitHub Copilot is in public preview and subject to change."
> — Source: [Using your LLM provider API keys with Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys)

> "We highly recommend adhering to the principle of least privilege by assigning only the minimum necessary scopes to your API keys."
> — Source: [Using your LLM provider API keys with Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys)

### Copilot coding agent (cloud agent) — admin approvals
Copilot cloud agent (and third-party MCP servers) are **disabled by default** at the enterprise level. Enterprise owners approve it through two independent controls on the **AI controls → Agents** page:

- **Enable Copilot cloud agent** policy — `Disabled` / `Enabled` / `Enabled for selected organizations` (selectable individually or via organization custom properties using the REST API). Selected orgs' owners then choose which repositories keep it on.
- **Block Copilot cloud agent** toggle — a blanket kill-switch that blocks the cloud agent in every repository the enterprise owns, overriding any license source (including users on personal plans who are collaborators).

> "Copilot cloud agent and use of third-party MCP servers are disabled by default. You can enable these features for users who receive a Copilot license from your enterprise or organizations."
> — Source: [Enabling GitHub Copilot cloud agent in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/enable-copilot-cloud-agent)

> "Most Copilot policies, including 'Enable Copilot cloud agent', only affect users who receive a Copilot license from your enterprise or organizations. If you want to disable Copilot cloud agent in repositories completely… you can use the 'Block Copilot cloud agent' policy."
> — Source: [Blocking GitHub Copilot cloud agent in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/block-copilot-cloud-agent)

For third-party coding agents (Anthropic Claude, OpenAI Codex), enablement happens in two steps: the enterprise opts in at the enterprise AI-controls level, then each organization opts in per-org on its own Cloud agent settings page ([Managing policies and features for GitHub Copilot in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies)). **Custom agents** are stored in a dedicated `.github-private` repo in a chosen org, optionally locked down with a ruleset that limits edits to enterprise owners ([Preparing to use custom agents in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/prepare-for-custom-agents)).

---

## 5. Research Limitations

- **GHE Server not covered.** Copilot's enterprise controls documented here apply to **GitHub Enterprise Cloud**; GHES is explicitly out of scope per GitHub ("Copilot is not currently available for GitHub Enterprise Server").
- **Data-residency (ghe.com) specifics not deeply covered.** FedRAMP / data-resident premium-request multipliers (+10%) and the `*.SUBDOMAIN.ghe.com` routing are mentioned but not exhaustively explored.
- **BYOK is in public preview**; provider list, UI, and behaviors are subject to change. Verify against docs before rollout.
- **URLs reshuffle frequently.** GitHub recently migrated Copilot admin docs to a new path shape (`/copilot/how-tos/administer-copilot/manage-for-enterprise/...`). Older bookmarks (e.g., `/copilot/how-tos/administer/enterprises/...`) 404. Always start from [docs.github.com/en/copilot](https://docs.github.com/en/copilot).
- **No third-party or blog sources** were consulted per the request; announcements on github.blog were not incorporated.
- **Pricing and premium-request allowances** are quoted from the Plans page as of April 2026 and should be re-verified at purchase time.
- **SSO / audit-log specifics** beyond Copilot-scoped events (e.g., full SCIM attribute mapping, OIDC CAP behavior) are covered only at the level needed to understand Copilot admin flow; consult the GHEC IAM docs for depth.

---

## 6. Complete Reference List

### Documentation (docs.github.com)
- [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans) — plan comparison, pricing, premium-request allowances, overage rate.
- [GitHub Copilot policies to control availability of features and models](https://docs.github.com/en/copilot/concepts/policies) — how feature/privacy/model policies work, and enterprise vs. org precedence.
- [Managing policies and features for GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-enterprise-policies) — the AI-controls console walkthrough.
- [Managing policies and features for GitHub Copilot in your organization](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies) — the org-level equivalent and third-party-agent toggles.
- [Granting users access to GitHub Copilot in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/grant-access) — direct-to-user/team vs. per-org seat models.
- [Viewing Copilot license usage in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/view-license-usage) — Billing and licensing → Copilot tab.
- [Managing GitHub Copilot access to your enterprise's network](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-access/manage-network-access) — subscription-based routing.
- [Copilot allowlist reference](https://docs.github.com/en/copilot/reference/allowlist-reference) — firewall/proxy URLs, cloud-agent built-in allowlist.
- [Network settings for GitHub Copilot](https://docs.github.com/en/copilot/concepts/network-settings) — HTTP proxy and custom-certificate support.
- [Content exclusion for GitHub Copilot](https://docs.github.com/en/copilot/concepts/content-exclusion) — who can configure, supported IDEs, limitations.
- [Reviewing audit logs for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs) — search terms, 180-day retention, SIEM streaming.
- [Audit log events for agents](https://docs.github.com/en/copilot/reference/agentic-audit-log-events) — `actor:Copilot`, `agent_session_id` fields.
- [Monitoring agentic activity in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/monitor-agentic-activity) — Agent sessions UI and audit-log drill-down.
- [Enabling GitHub Copilot cloud agent in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/enable-copilot-cloud-agent) — coding-agent approval workflow and MCP servers.
- [Blocking GitHub Copilot cloud agent in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/block-copilot-cloud-agent) — blanket kill-switch.
- [Preparing to use custom agents in your enterprise](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/manage-agents/prepare-for-custom-agents) — `.github-private` repo + ruleset pattern.
- [Using your LLM provider API keys with Copilot](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-your-own-api-keys) — BYOK supported providers, add-key flow, per-org scoping.
- [Requests in GitHub Copilot](https://docs.github.com/en/copilot/concepts/billing/copilot-requests) — premium request definition, multipliers, SKU split.
- [Managing the premium request allowance for your organization or enterprise](https://docs.github.com/en/copilot/how-tos/manage-and-track-spending/manage-request-allowances) — policy + budgets + upgrade guidance.
- [Viewing the Copilot usage metrics dashboard](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/view-usage-and-adoption) — adoption/usage reporting.
- [Hosting of models for GitHub Copilot](https://docs.github.com/en/copilot/reference/ai-models/model-hosting) — where each built-in model runs and data-use commitments.
- [Identity and access management fundamentals](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/about-identity-and-access-management) — SAML vs. EMU overview.
- [About Enterprise Managed Users](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/about-enterprise-managed-users) — partner IdP matrix and unsupported combinations.

### GitHub Repositories
- (none consulted — per request, sources were limited to docs.github.com and github.blog, and no blog post was needed to answer the requested scope.)

### Code Samples
- (none — administrative topic; illustrative snippets are inline above.)

---

_Revision Round 3: removed orphaned "Managing GitHub Copilot in your enterprise" index page from the reference list (🟡 Important ✅ fixed)._
