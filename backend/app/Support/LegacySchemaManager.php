<?php

namespace App\Support;

use Illuminate\Database\ConnectionInterface;
use Throwable;

class LegacySchemaManager
{
    public static function columnExists(ConnectionInterface $db, string $table, string $column): bool
    {
        $database = (string) $db->getDatabaseName();
        $result = $db->select(
            'SELECT 1
             FROM information_schema.columns
             WHERE table_schema = ?
               AND table_name = ?
               AND column_name = ?
             LIMIT 1',
            [$database, $table, $column]
        );

        return ! empty($result);
    }

    public static function ensureReviewAndNotificationSchema(ConnectionInterface $db): void
    {
        static $done = false;

        if ($done) {
            return;
        }

        try {
            if (! self::columnExists($db, 'change_log', 'admin_comment')) {
                $db->statement("ALTER TABLE change_log ADD COLUMN admin_comment TEXT NULL AFTER status");
            }
        } catch (Throwable) {
            // Keep the application usable even if the legacy schema cannot be upgraded automatically.
        }

        try {
            $db->statement(
                <<<SQL
                CREATE TABLE IF NOT EXISTS staff_notification (
                    notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    user_id BIGINT(20) NOT NULL,
                    log_id BIGINT(20) DEFAULT NULL,
                    title VARCHAR(190) NOT NULL,
                    message TEXT NULL,
                    target_url VARCHAR(255) NOT NULL DEFAULT '/staff/history',
                    is_read TINYINT(1) NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    read_at DATETIME NULL,
                    PRIMARY KEY (notification_id),
                    KEY idx_staff_notification_user_read_time (user_id, is_read, created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
                SQL
            );
        } catch (Throwable) {
            // Keep the application usable even if the legacy schema cannot be upgraded automatically.
        }

        $done = true;
    }

    public static function ensurePasswordResetSchema(ConnectionInterface $db): void
    {
        static $done = false;

        if ($done) {
            return;
        }

        try {
            $db->statement(
                <<<SQL
                CREATE TABLE IF NOT EXISTS password_reset_token (
                    reset_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    user_id BIGINT(20) NOT NULL,
                    token_hash CHAR(64) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    used_at DATETIME NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (reset_id),
                    UNIQUE KEY uniq_token_hash (token_hash),
                    KEY idx_prt_user (user_id),
                    KEY idx_prt_expires (expires_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
                SQL
            );
        } catch (Throwable) {
            // Keep the application usable even if the legacy schema cannot be upgraded automatically.
        }

        $done = true;
    }

    public static function ensureStaffIdCardSchema(ConnectionInterface $db): void
    {
        static $done = false;

        if ($done) {
            return;
        }

        try {
            $db->statement(
                <<<SQL
                CREATE TABLE IF NOT EXISTS staff_id_card_request (
                    request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    user_id BIGINT(20) NOT NULL,
                    staff_id BIGINT(20) NOT NULL,
                    request_type VARCHAR(60) NOT NULL DEFAULT 'Replacement',
                    reason TEXT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
                    admin_comment TEXT NULL,
                    requested_at DATETIME NOT NULL,
                    processed_at DATETIME NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (request_id),
                    KEY idx_staff_id_card_request_staff (staff_id, request_id),
                    KEY idx_staff_id_card_request_user (user_id, request_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
                SQL
            );
        } catch (Throwable) {
            // Keep the application usable even if the legacy schema cannot be upgraded automatically.
        }

        $done = true;
    }

    public static function ensureRolePermissionsSchema(ConnectionInterface $db): void
    {
        static $done = false;

        if ($done) {
            return;
        }

        try {
            $db->statement(
                <<<SQL
                CREATE TABLE IF NOT EXISTS role_permissions (
                    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    role_key VARCHAR(30) NOT NULL,
                    permissions JSON NOT NULL,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uniq_role_key (role_key)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
                SQL
            );
        } catch (Throwable) {
            // Keep the application usable even if the legacy schema cannot be upgraded automatically.
        }

        $done = true;
    }
}
