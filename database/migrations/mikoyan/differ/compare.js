const { readFile, writeFile } = require("fs/promises");

// RESET LOG FILE for new comparison
const DIFF_LOG_PATH = "comparison.json";
writeFile(DIFF_LOG_PATH, "[]");

const WRITE_QUEUE = {
  queue: [],
  is_writing: false,
};

const SAMPLE_USERS_PATH = "sample-live.user.json";
const NORMALIZED_USERS_PATH = "normalized-live.user.json";

const REMOVED_FIELDS = [
  "history",
  "sound",
  "badges",
  "password",
  "__data",
  "__cachedRelations",
  "__strict",
  "__persisted",
  "__dataSource",
];

async function main() {
  const sample_users = await get_users(SAMPLE_USERS_PATH);
  const normalized_users = await get_users(NORMALIZED_USERS_PATH);

  for (const sample_user of sample_users) {
    const normalized_user = normalized_users.find(
      (user) => user._id.$oid === sample_user._id.$oid
    );
    await compare_sample_to_normalized_user(sample_user, normalized_user);
  }
}

main().catch(console.error);

async function get_users(path) {
  const data = await readFile(path, "utf-8");

  return JSON.parse(data);
}

/**
 * Compares the user passed in with the user in after parsing.
 *
 * @param {Object} sample_user - The original user before normalization
 * @param {Object} normalized_user - The user after normalization
 */
async function compare_sample_to_normalized_user(sample_user, normalized_user) {
  if (!normalized_user) {
    return await add_to_log({
      property: sample_user._id.$oid,
      original: sample_user,
      normalized: "fcc-undefined",
    });
  }

  await deep_compare(sample_user, normalized_user, `[${sample_user._id.$oid}]`);
}

function fcc_undefined(val) {
  return typeof val === "undefined" ? "fcc-undefined" : val;
}

/// Compare the original with the normalized object
/// Output:
/// - If equal, return undefined
/// - If not equal, { expected: any, actual: any, loc: string }
///
/// If original and normalized are objects:
/// - Append `.${key}` to the loc for object literals, or `[${index}]` for arrays
async function deep_compare(original, normalized, key) {
  if (original === normalized) {
    return;
  }

  /// Ignore common, expected differences:
  /// | Original  | Normalized |
  /// | --------- | ---------- |
  /// | undefined | [] |
  /// | undefined | null |
  {
    if (undefined_eq_empty_array(original, normalized)) {
      return;
    }

    if (undefined_eq_null(original, normalized)) {
      return;
    }
  }

  if (typeof original !== typeof normalized) {
    return await add_to_log({
      property: key,
      original: fcc_undefined(original),
      normalized: fcc_undefined(normalized),
    });
  }

  if (
    typeof original === "object" &&
    original !== null &&
    normalized !== null
  ) {
    if (Array.isArray(original) && Array.isArray(normalized)) {
      const original_copy = original.slice().sort();
      const normalized_copy = normalized.slice().sort();

      for (let i = 0; i < original_copy.length; i++) {
        await deep_compare(
          original_copy[i],
          normalized_copy[i],
          key + `[${i}]`
        );
      }
      return;
    }

    const original_keys = Object.keys(original);
    // const normalized_keys = Object.keys(normalized);

    // Objects do not have to be the same length
    for (const k of original_keys) {
      // If key is removed prop, then skip
      if (REMOVED_FIELDS.includes(k)) {
        continue;
      }
      await deep_compare(original?.[k], normalized?.[k], key + `.${k}`);
    }

    return;
  } else {
    return await add_to_log({
      property: key,
      original: fcc_undefined(original),
      normalized: fcc_undefined(normalized),
    });
  }
}

// Find all records with email: null
// Move records to own collection
// Normalized DB removing them from user coll
// Create platform for Campers to claim their accounts from old external platforms
//  - Recreate user record

function undefined_eq_empty_array(a, b) {
  if (Array.isArray(b) && b.length === 0) {
    return typeof a === "undefined";
  }
  return false;
}

function undefined_eq_null(a, b) {
  return typeof a === "undefined" && b === null;
}

async function add_to_log(value) {
  if (WRITE_QUEUE.is_writing) {
    WRITE_QUEUE.queue.push(value);
    return;
  }
  WRITE_QUEUE.is_writing = true;
  const data = await readFile(DIFF_LOG_PATH, "utf-8");
  const logs = JSON.parse(data);
  logs.push(value);
  await writeFile(DIFF_LOG_PATH, JSON.stringify(logs, null, 2));
  WRITE_QUEUE.is_writing = false;
  handle_queue();
}

// Handle any remaining logs in the queue
async function handle_queue() {
  if (WRITE_QUEUE.queue.length > 0) {
    const value = WRITE_QUEUE.queue.shift();
    if (value) {
      await add_to_log(value);
    }
  }
}
