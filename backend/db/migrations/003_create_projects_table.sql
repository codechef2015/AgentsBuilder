-- Migration: 003_create_projects_table
-- Description: Backend-persisted projects for multi-user sharing
-- Created: 2026-07-11

CREATE TABLE IF NOT EXISTS `projects` (
    `id` VARCHAR(50) PRIMARY KEY COMMENT 'UUID project identifier',
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `owner_id` VARCHAR(255) NOT NULL COMMENT 'Creator user ID or email',
    `flow_data` JSON NOT NULL COMMENT 'Complete flow (nodes + edges + graphMode)',
    `graph_mode` BOOLEAN DEFAULT FALSE,
    `version` VARCHAR(20) DEFAULT '1.0.0',
    `is_public` BOOLEAN DEFAULT FALSE COMMENT 'Accessible via shareable link',
    `share_token` VARCHAR(100) UNIQUE COMMENT 'Token for shareable read-only links',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_owner` (`owner_id`),
    INDEX `idx_share_token` (`share_token`),
    INDEX `idx_updated` (`updated_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project collaborators (roles: owner, editor, viewer)
CREATE TABLE IF NOT EXISTS `project_collaborators` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` VARCHAR(50) NOT NULL,
    `user_id` VARCHAR(255) NOT NULL,
    `role` ENUM('owner', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
    `invited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY `uk_project_user` (`project_id`, `user_id`),
    INDEX `idx_user_projects` (`user_id`),
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project version history
CREATE TABLE IF NOT EXISTS `project_versions` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `project_id` VARCHAR(50) NOT NULL,
    `version_number` INT UNSIGNED NOT NULL,
    `flow_data` JSON NOT NULL,
    `change_summary` TEXT,
    `created_by` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY `uk_project_version` (`project_id`, `version_number`),
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
