-- Migration: 004_create_rate_limiting_and_eval
-- Description: Rate limiting + agent evaluation tracking
-- Created: 2026-07-11

-- Rate limiting tokens
CREATE TABLE IF NOT EXISTS `rate_limit_tokens` (
    `user_id` VARCHAR(255) PRIMARY KEY,
    `tokens_remaining` INT UNSIGNED DEFAULT 100 COMMENT 'Available requests',
    `max_tokens` INT UNSIGNED DEFAULT 100 COMMENT 'Bucket capacity',
    `refill_rate` INT UNSIGNED DEFAULT 10 COMMENT 'Tokens per minute',
    `last_refill` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_last_refill` (`last_refill`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Token-bucket rate limiting per user';

-- Agent run evaluations
CREATE TABLE IF NOT EXISTS `agent_evaluations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` VARCHAR(50),
    `execution_id` VARCHAR(100) NOT NULL,
    `result` ENUM('pass', 'fail', 'partial') NOT NULL,
    `score` DECIMAL(3,2) COMMENT 'Quality score 0.00-1.00',
    `evaluator` VARCHAR(50) COMMENT 'human | auto | custom',
    `criteria` JSON COMMENT 'Evaluation criteria and scores',
    `notes` TEXT,
    `evaluated_by` VARCHAR(255),
    `evaluated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_project` (`project_id`),
    INDEX `idx_execution` (`execution_id`),
    INDEX `idx_result` (`result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Quality tracking for agent executions — pass/fail + scoring';
