-- Migration 006: Add framework column to flow_templates and projects
-- Supports multi-framework builder (Strands Agents SDK + Google ADK)
-- Created: 2026-07-13

-- Add framework column to flow_templates table
ALTER TABLE `flow_templates` ADD COLUMN `framework` VARCHAR(20) NOT NULL DEFAULT 'strands' COMMENT 'Framework: strands or google-adk' AFTER `description`;
ALTER TABLE `flow_templates` ADD INDEX `idx_framework` (`framework`);

-- Add framework column to projects table
ALTER TABLE `projects` ADD COLUMN `framework` VARCHAR(20) NOT NULL DEFAULT 'strands' COMMENT 'Framework: strands or google-adk' AFTER `description`;
ALTER TABLE `projects` ADD INDEX `idx_project_framework` (`framework`);

-- Update existing templates to be explicitly 'strands'
UPDATE `flow_templates` SET `framework` = 'strands' WHERE `framework` = '' OR `framework` IS NULL;

-- Seed Google ADK templates
INSERT INTO `flow_templates` (`template_id`, `name`, `description`, `framework`, `category`, `pattern`, `difficulty`, `tags`, `flow_data`, `source_url`, `source_author`, `is_official`, `is_published`) VALUES
(
  'adk-research-pipeline',
  'ADK Research Pipeline',
  'Sequential agent pipeline: researcher gathers info, writer produces content. Uses SequentialAgent for deterministic ordering.',
  'google-adk',
  'custom',
  'Sequential',
  'beginner',
  '["sequential", "research", "pipeline", "adk", "gemini"]',
  '{"nodes":[{"id":"input_1","type":"adk-input","position":{"x":50,"y":200},"data":{"label":"Input"}},{"id":"researcher","type":"adk-llm-agent","position":{"x":250,"y":100},"data":{"label":"Researcher","name":"researcher","model":"gemini-2.0-flash","instruction":"You are a research assistant. Search for information and provide comprehensive summaries."}},{"id":"writer","type":"adk-llm-agent","position":{"x":250,"y":300},"data":{"label":"Writer","name":"writer","model":"gemini-2.0-flash","instruction":"You are a content writer. Take research notes and produce well-structured articles."}},{"id":"pipeline","type":"adk-sequential","position":{"x":500,"y":200},"data":{"label":"Pipeline","name":"research_pipeline","description":"Research then write"}},{"id":"output_1","type":"adk-output","position":{"x":750,"y":200},"data":{"label":"Output"}}],"edges":[{"id":"e1","source":"input_1","target":"pipeline","animated":true},{"id":"e2","source":"researcher","target":"pipeline","targetHandle":"sub-agents","animated":true},{"id":"e3","source":"writer","target":"pipeline","targetHandle":"sub-agents","animated":true},{"id":"e4","source":"pipeline","target":"output_1","animated":true}]}',
  'https://google.github.io/adk-docs/agents/workflow-agents/sequential-agent/',
  'Google ADK Docs',
  1,
  1
),
(
  'adk-parallel-data-gatherer',
  'ADK Parallel Data Gatherer',
  'Parallel agent that fetches data from multiple sources simultaneously. Uses ParallelAgent for concurrent execution.',
  'google-adk',
  'custom',
  'Parallel',
  'intermediate',
  '["parallel", "data", "multi-source", "adk", "concurrent"]',
  '{"nodes":[{"id":"input_1","type":"adk-input","position":{"x":50,"y":200},"data":{"label":"Input"}},{"id":"news_agent","type":"adk-llm-agent","position":{"x":250,"y":50},"data":{"label":"News Agent","name":"news_agent","model":"gemini-2.0-flash","instruction":"Search for latest news on the topic.","outputKey":"news_results"}},{"id":"academic_agent","type":"adk-llm-agent","position":{"x":250,"y":200},"data":{"label":"Academic Agent","name":"academic_agent","model":"gemini-2.0-flash","instruction":"Search for academic papers and research.","outputKey":"academic_results"}},{"id":"social_agent","type":"adk-llm-agent","position":{"x":250,"y":350},"data":{"label":"Social Agent","name":"social_agent","model":"gemini-2.0-flash","instruction":"Search for social media discussions.","outputKey":"social_results"}},{"id":"gatherer","type":"adk-parallel","position":{"x":520,"y":200},"data":{"label":"Data Gatherer","name":"data_gatherer","description":"Fetch from all sources at once"}},{"id":"output_1","type":"adk-output","position":{"x":750,"y":200},"data":{"label":"Output"}}],"edges":[{"id":"e1","source":"input_1","target":"gatherer","animated":true},{"id":"e2","source":"news_agent","target":"gatherer","targetHandle":"sub-agents","animated":true},{"id":"e3","source":"academic_agent","target":"gatherer","targetHandle":"sub-agents","animated":true},{"id":"e4","source":"social_agent","target":"gatherer","targetHandle":"sub-agents","animated":true},{"id":"e5","source":"gatherer","target":"output_1","animated":true}]}',
  'https://google.github.io/adk-docs/agents/workflow-agents/parallel-agent/',
  'Google ADK Docs',
  1,
  1
),
(
  'adk-writer-reviewer-loop',
  'ADK Writer-Reviewer Loop',
  'Loop agent pattern: writer drafts content, reviewer provides feedback, loop continues until quality meets threshold.',
  'google-adk',
  'custom',
  'Loop',
  'intermediate',
  '["loop", "writer", "reviewer", "feedback", "adk", "iterative"]',
  '{"nodes":[{"id":"input_1","type":"adk-input","position":{"x":50,"y":200},"data":{"label":"Input"}},{"id":"writer","type":"adk-llm-agent","position":{"x":250,"y":100},"data":{"label":"Writer","name":"writer","model":"gemini-2.0-flash","instruction":"Write or revise content based on feedback. When the reviewer approves, escalate to end the loop.","outputKey":"draft"}},{"id":"reviewer","type":"adk-llm-agent","position":{"x":250,"y":300},"data":{"label":"Reviewer","name":"reviewer","model":"gemini-2.0-flash","instruction":"Review the draft. If quality is good, approve and escalate. Otherwise provide specific feedback for improvement.","outputKey":"feedback"}},{"id":"loop","type":"adk-loop","position":{"x":500,"y":200},"data":{"label":"Refinement Loop","name":"refinement_loop","maxIterations":5}},{"id":"output_1","type":"adk-output","position":{"x":750,"y":200},"data":{"label":"Output"}}],"edges":[{"id":"e1","source":"input_1","target":"loop","animated":true},{"id":"e2","source":"writer","target":"loop","targetHandle":"sub-agents","animated":true},{"id":"e3","source":"reviewer","target":"loop","targetHandle":"sub-agents","animated":true},{"id":"e4","source":"loop","target":"output_1","animated":true}]}',
  'https://google.github.io/adk-docs/agents/workflow-agents/loop-agent/',
  'Google ADK Docs',
  1,
  1
),
(
  'adk-mcp-research-agent',
  'ADK MCP Research Agent',
  'Single LLM agent connected to MCP servers for web search and file access. Demonstrates MCPToolset integration.',
  'google-adk',
  'single-agent',
  'Single + MCP',
  'beginner',
  '["mcp", "research", "search", "filesystem", "adk", "tools"]',
  '{"nodes":[{"id":"input_1","type":"adk-input","position":{"x":50,"y":200},"data":{"label":"Input"}},{"id":"search_tool","type":"adk-builtin-tool","position":{"x":200,"y":80},"data":{"label":"Google Search","toolType":"google_search"}},{"id":"mcp_filesystem","type":"adk-mcp-tool","position":{"x":200,"y":320},"data":{"label":"Filesystem MCP","serverName":"filesystem","transport":"stdio","command":"npx -y @modelcontextprotocol/server-filesystem ."}},{"id":"agent","type":"adk-llm-agent","position":{"x":450,"y":200},"data":{"label":"Research Agent","name":"research_agent","model":"gemini-2.0-flash","instruction":"You are a research assistant with web search and file system access. Search the web for information and save findings to files."}},{"id":"output_1","type":"adk-output","position":{"x":700,"y":200},"data":{"label":"Output"}}],"edges":[{"id":"e1","source":"input_1","target":"agent","targetHandle":"input","animated":true},{"id":"e2","source":"search_tool","target":"agent","targetHandle":"tools","animated":true},{"id":"e3","source":"mcp_filesystem","target":"agent","targetHandle":"tools","animated":true},{"id":"e4","source":"agent","sourceHandle":"output","target":"output_1","animated":true}]}',
  'https://google.github.io/adk-docs/tools-custom/mcp-tools/',
  'Google ADK Docs',
  1,
  1
);
