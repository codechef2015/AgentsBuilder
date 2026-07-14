-- Migration: 001_create_templates_table
-- Description: Create flow_templates table for storing pre-built and user templates
-- Source: https://levelup.gitconnected.com/strands-agents-interesting-multi-agent-pattern-0c7f97088b6d
-- Created: 2026-07-11

CREATE TABLE IF NOT EXISTS `flow_templates` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `template_id` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique slug identifier (e.g., simple-agent, orchestrator-sub-agents)',
    `name` VARCHAR(255) NOT NULL COMMENT 'Display name',
    `description` TEXT COMMENT 'What this template demonstrates',
    `category` ENUM('single-agent', 'agents-as-tools', 'swarm', 'graph', 'a2a', 'workflow', 'custom') NOT NULL DEFAULT 'single-agent',
    `pattern` VARCHAR(100) COMMENT 'Specific pattern type (sequential, parallel, branching, feedback-loop)',
    `difficulty` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    `tags` JSON COMMENT 'Searchable tags array',
    `flow_data` JSON NOT NULL COMMENT 'Complete flow JSON (nodes + edges + graphMode)',
    `thumbnail_url` VARCHAR(500) COMMENT 'Preview image URL',
    `source_url` VARCHAR(500) COMMENT 'Original documentation/article URL',
    `source_author` VARCHAR(255) COMMENT 'Original author or source name',
    `strands_sdk_version` VARCHAR(20) DEFAULT '1.0' COMMENT 'Compatible Strands SDK version',
    `is_official` BOOLEAN DEFAULT FALSE COMMENT 'True if from official Strands docs',
    `is_published` BOOLEAN DEFAULT TRUE COMMENT 'Visible in template gallery',
    `use_count` INT UNSIGNED DEFAULT 0 COMMENT 'How many times this template was used',
    `created_by` VARCHAR(255) COMMENT 'Creator username or email',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_category` (`category`),
    INDEX `idx_difficulty` (`difficulty`),
    INDEX `idx_is_published` (`is_published`),
    INDEX `idx_use_count` (`use_count` DESC),
    FULLTEXT INDEX `ft_search` (`name`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pre-built and user-created flow templates for AgenticBuilder';
