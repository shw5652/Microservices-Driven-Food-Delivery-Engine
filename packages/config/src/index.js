import dotenv from 'dotenv';

// Load the service's .env file (from the folder the service is started in).
dotenv.config({ quiet: true });

// Values that must never be used as secrets, even if someone sets them.
const WEAK_SECRETS = ['dev-secret', 'refresh-secret', 'secret', 'changeme', 'password'];

/**
 * Reads and checks environment variables. Stops the service with a clear
 * message if anything is missing or unsafe.
 *
 * Each rule can have:
 *   type:      'string' (default) | 'number' | 'boolean'
 *   required:  true by default; set false for optional values
 *   default:   value to use when the variable is not set
 *   secret:    true -> must be at least 32 characters and not a known weak value
 *
 * Example:
 *   const config = loadConfig({
 *     PORT: { type: 'number', default: 4004 },
 *     DATABASE_URL: {},
 *     JWT_SECRET: { secret: true },
 *   });
 */
export function loadConfig(spec) {
  const config = {};
  const problems = [];

  for (const [key, rule] of Object.entries(spec)) {
    const raw = process.env[key];
    const isMissing = raw === undefined || raw === '';

    if (isMissing) {
      if (rule.default !== undefined) {
        config[key] = rule.default;
      } else if (rule.required === false) {
        config[key] = undefined;
      } else {
        problems.push(`${key} is missing`);
      }
      continue;
    }

    if (rule.secret) {
      if (WEAK_SECRETS.includes(raw.toLowerCase())) {
        problems.push(`${key} is set to a known weak value`);
        continue;
      }
      if (raw.length < 32) {
        problems.push(`${key} must be at least 32 characters`);
        continue;
      }
    }

    if (rule.type === 'number') {
      const n = Number(raw);
      if (Number.isNaN(n)) {
        problems.push(`${key} must be a number (got "${raw}")`);
        continue;
      }
      config[key] = n;
    } else if (rule.type === 'boolean') {
      config[key] = raw === 'true';
    } else {
      config[key] = raw;
    }
  }

  if (problems.length > 0) {
    console.error('\nConfiguration error, service not started:');
    for (const p of problems) console.error(`  - ${p}`);
    console.error('\nFix your .env file and try again.\n');
    process.exit(1);
  }

  return Object.freeze(config);
}