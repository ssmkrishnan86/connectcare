#!/usr/bin/env node

/**
 * ==============================================================================
 * ConnectCare Database Cleaner CLI Runner
 * Target: Render PostgreSQL Database (https://connectcare-0k4a.onrender.com/)
 * ==============================================================================
 *
 * Usage:
 *   node scripts/clear-database.js [options] [DATABASE_URL]
 *
 * Options:
 *   --url, -u <url>           PostgreSQL connection string or External Database URL
 *   --yes, -y                 Skip interactive confirmation prompt
 *   --help, -h                Show this help message
 *
 * Example:
 *   node scripts/clear-database.js "postgres://user:password@dpg-xxxxx.oregon-postgres.render.com/connectcare_db"
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Terminal Color Formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function printBanner() {
  console.log(`\n${colors.cyan}${colors.bright}====================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}          ConnectCare Database Cleanup & Reset Utility              ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}====================================================================${colors.reset}\n`);
}

function printHelp() {
  printBanner();
  console.log(`Clears transactional, clinical, patient, and log records while preserving
the System Administrator account, master roles, permissions, and app settings.\n`);
  console.log(`${colors.yellow}Usage:${colors.reset}`);
  console.log(`  node scripts/clear-database.js [options] [DATABASE_URL]\n`);
  console.log(`${colors.yellow}Options:${colors.reset}`);
  console.log(`  --url, -u <url>     PostgreSQL External Database URL or Connection String`);
  console.log(`  --yes, -y           Skip confirmation prompt (for automation)`);
  console.log(`  --help, -h          Display this help message\n`);
  console.log(`${colors.yellow}Examples:${colors.reset}`);
  console.log(`  node scripts/clear-database.js`);
  console.log(`  node scripts/clear-database.js "postgres://user:pass@host:5432/db?sslmode=require"`);
  console.log(`  node scripts/clear-database.js --yes\n`);
}

async function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

// Ensure 'pg' is available
async function getPgClient() {
  try {
    const { default: pkg } = await import('pg');
    return pkg;
  } catch {
    console.log(`${colors.yellow}ℹ 'pg' package not found. Installing temporarily...${colors.reset}`);
    try {
      execSync('npm install --no-save pg', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
      const { default: pkg } = await import('pg');
      return pkg;
    } catch (err) {
      console.error(`${colors.red}❌ Failed to load 'pg' client. Run 'npm install pg' first.${colors.reset}`, err.message);
      process.exit(1);
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let dbUrl = process.env.DATABASE_URL || process.env.ConnectionStrings__DefaultConnection || '';
  let skipConfirm = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--yes' || arg === '-y') {
      skipConfirm = true;
    } else if (arg === '--url' || arg === '-u') {
      dbUrl = args[++i];
    } else if (!arg.startsWith('-') && !dbUrl) {
      dbUrl = arg;
    }
  }

  return { dbUrl, skipConfirm };
}

async function main() {
  const { dbUrl: initialUrl, skipConfirm } = parseArgs();

  printBanner();

  let connectionString = initialUrl;

  if (!connectionString) {
    console.log(`${colors.yellow}No database connection string specified.${colors.reset}`);
    console.log(`You can find your External Database URL in the ${colors.bright}Render Dashboard${colors.reset} -> ${colors.bright}connectcare-db${colors.reset} -> ${colors.bright}External Database URL${colors.reset}.\n`);
    connectionString = await prompt(`${colors.cyan}Enter PostgreSQL Database URL: ${colors.reset}`);
  }

  if (!connectionString) {
    console.error(`${colors.red}❌ Error: A database connection URL is required.${colors.reset}`);
    process.exit(1);
  }

  // Load SQL script
  const sqlFilePath = path.join(__dirname, 'clear-database.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`${colors.red}❌ Error: SQL file not found at ${sqlFilePath}${colors.reset}`);
    process.exit(1);
  }
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Confirmation prompt
  if (!skipConfirm) {
    console.log(`\n${colors.red}${colors.bright}⚠️  WARNING: You are about to clear all patient, clinical, task, and log data!${colors.reset}`);
    console.log(`${colors.green}✔  The Administrator account (admin), Roles, Permissions, and App Settings will be PRESERVED.${colors.reset}\n`);

    const confirm = await prompt(`${colors.yellow}Are you sure you want to proceed? Type 'YES' to confirm: ${colors.reset}`);
    if (confirm !== 'YES') {
      console.log(`${colors.blue}Operation cancelled by user.${colors.reset}`);
      process.exit(0);
    }
  }

  console.log(`\n${colors.cyan}Connecting to PostgreSQL database...${colors.reset}`);

  const { Client } = await getPgClient();

  // Setup client with SSL enabled if connecting to Render/Cloud
  const isCloud = connectionString.includes('render.com') || connectionString.includes('aws') || connectionString.includes('sslmode=require');
  const client = new Client({
    connectionString,
    ssl: isCloud ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log(`${colors.green}✔ Connected successfully.${colors.reset}\n`);

    console.log(`${colors.cyan}Executing database cleanup script...${colors.reset}`);
    const startTime = Date.now();

    await client.query(sqlContent);

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`${colors.green}✔ Cleanup script executed successfully in ${elapsedSeconds}s.${colors.reset}\n`);

    // Verify Admin user status
    console.log(`${colors.cyan}Verifying Admin account and master tables...${colors.reset}`);
    const adminCheck = await client.query(`
      SELECT u.id, u.username, u.email, u.role, u.is_active,
             (SELECT COUNT(*) FROM users) as total_users,
             (SELECT COUNT(*) FROM patients) as total_patients,
             (SELECT COUNT(*) FROM tasks) as total_tasks,
             (SELECT COUNT(*) FROM app_permissions) as total_permissions,
             (SELECT COUNT(*) FROM app_roles) as total_roles
      FROM users u
      WHERE lower(u.username) = 'admin'
      LIMIT 1;
    `);

    if (adminCheck.rows.length > 0) {
      const stats = adminCheck.rows[0];
      console.log(`\n${colors.green}${colors.bright}====================================================================${colors.reset}`);
      console.log(`${colors.green}${colors.bright}                    CLEANUP COMPLETE & VERIFIED                     ${colors.reset}`);
      console.log(`${colors.green}${colors.bright}====================================================================${colors.reset}`);
      console.log(`  ${colors.white}• Admin Username:     ${colors.bright}${stats.username}${colors.reset}`);
      console.log(`  ${colors.white}• Admin Email:        ${colors.bright}${stats.email}${colors.reset}`);
      console.log(`  ${colors.white}• Admin Status:       ${colors.bright}${stats.is_active ? 'Active' : 'Inactive'}${colors.reset}`);
      console.log(`  ${colors.white}• Remaining Users:    ${colors.bright}${stats.total_users}${colors.reset}`);
      console.log(`  ${colors.white}• Remaining Patients: ${colors.bright}${stats.total_patients} (cleared)${colors.reset}`);
      console.log(`  ${colors.white}• Remaining Tasks:    ${colors.bright}${stats.total_tasks} (cleared)${colors.reset}`);
      console.log(`  ${colors.white}• Master Roles:       ${colors.bright}${stats.total_roles} (preserved)${colors.reset}`);
      console.log(`  ${colors.white}• System Permissions: ${colors.bright}${stats.total_permissions} (preserved)${colors.reset}`);
      console.log(`${colors.green}${colors.bright}====================================================================${colors.reset}\n`);
      console.log(`${colors.green}You can now log into ConnectCare at https://connectcare-0k4a.onrender.com/ with:${colors.reset}`);
      console.log(`  ${colors.yellow}Username:${colors.reset} admin`);
      console.log(`  ${colors.yellow}Password:${colors.reset} admin123 (or your existing admin password)\n`);
    } else {
      console.log(`${colors.yellow}⚠ Notice: Admin user verification returned 0 rows. Please check the users table.${colors.reset}`);
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Error executing cleanup:${colors.reset}`, error.message);
    if (error.detail) console.error(`${colors.dim}Detail: ${error.detail}${colors.reset}`);
    if (error.hint) console.error(`${colors.dim}Hint: ${error.hint}${colors.reset}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  process.exit(1);
});
