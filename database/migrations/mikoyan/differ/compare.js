const { readFile, writeFile } = require("fs/promises");

// RESET LOG FILE for new comparison
const DIFF_LOG_PATH = "comparison.json";
writeFile(DIFF_LOG_PATH, "[]");

const WRITE_QUEUE = {
  queue: [],
  is_writing: false,
};

const SAMPLE_USERS_PATH = "sample-users.json";
const NORMALIZED_USERS_PATH = "normalized-users.json";

async function main() {
  const sample_users = await get_users(SAMPLE_USERS_PATH); // TODO
  const normalized_users = await get_users(NORMALIZED_USERS_PATH); // TODO

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
 * Compares the user passed in with the user in the  after parsing.
 *
 * ```json
 * [{
 *   "_id": string,
 *   "property": string,
 *   "expected": JSON,
 *   "actual": JSON | undefined
 * }]
 * ```
 * @param {Object} sample_user - The original user before normalization
 * @param {Object} normalized_user - The user after normalization
 */
async function compare_sample_to_normalized_user(sample_user, normalized_user) {
  if (!normalized_user) {
    return await add_to_log({
      _id: sample_user._id.$oid,
      property: null,
      expected: sample_user,
      actual: "fcc-undefined",
    });
  }

  const user_keys = Object.keys(sample_user);

  for (const key of user_keys) {
    const res = deep_compare(key, sample_user[key], normalized_user[key]);
    if (res?.loc) {
      await add_to_log({
        _id: sample_user._id.$oid,
        property: res.loc,
        expected: res.expected,
        actual: res.actual,
      });
    }
    // if (!is_deep_equal(sample_user[key], normalized_user[key]), key) {
    //   await add_to_log({
    //     _id: sample_user._id.$oid,
    //     property: key,
    //     expected: fcc_undefined(sample_user[key]),
    //     actual: fcc_undefined(normalized_user[key]),
    //   });
    // }
  }
}

function fcc_undefined(val) {
  return typeof val === "undefined" ? "fcc-undefined" : val;
}

function deep_compare(key, a, b) {
  if (a === b) {
    return;
  }

  {
    // Sample has undefined for props which are empty arrays.
    // For the sake of less diff, empty arrays are treated equivalent to undefined.
    if (empty_array_eq_undefined(a, b)) {
      return;
    }

    // For the sake of less diff, undefined props are treated equivalent to null.
    if (undefined_eq_null(a, b)) {
      return;
    }
  }

  if (typeof a !== typeof b) {
    return { expected: a, actual: b, loc: key };
  }

  if (typeof a === "object" && a !== null && b !== null) {
    // Handle arrays such that order does not matter
    if (Array.isArray(a) && Array.isArray(b)) {
      const a_copy = a.slice().sort();
      const b_copy = b.slice().sort();

      const expected = [];
      const actual = [];
      let loc = key;

      for (let i = 0; i < a_copy.length; i++) {
        const res = deep_compare(key + `[${i}]`, a_copy[i], b_copy[i]);
        if (res) {
          expected.push(res.expected);
          actual.push(res.actual);
          loc = res.loc;
        }
      }

      return { expected, actual, loc };
    }

    const a_keys = Object.keys(a);
    const b_keys = Object.keys(b);

    // Objects do not have to be the same length
    // if (a_keys.length !== b_keys.length) {
    //   return false;
    // }

    for (const k of a_keys) {
      const res = deep_compare(key + `.${k}`, a[k], b[k]);
      if (res) {
        return res;
      }
    }
    for (const k of b_keys) {
      const res = deep_compare(key + `.${k}`, a[k], b[k]);
      if (res) {
        return res;
      }
    }

    return;
  }

  return { expected: a, actual: b, loc: key };
}

function empty_array_eq_undefined(a, b) {
  if (Array.isArray(a) && a.length === 0) {
    return typeof b === "undefined";
  }

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
  // console.log('Data: ', data);
  // console.log('-----------');
  // console.log('Value: ', value);
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
