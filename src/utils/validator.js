/**
 * validator.js
 * A reusable, chainable input validation utility.
 * Drop into any project at src/utils/validator.js
 *
 * Usage:
 *   import { Validator, sanitize } from './utils/validator.js';
 *
 *   const result = new Validator(value, "Field Name")
 *     .required()
 *     .minLength(3)
 *     .isEmail()
 *     .validate();
 *
 *   if (!result.valid) console.log(result.errors);
 */

// ─────────────────────────────────────────────
// SANITIZER (run this BEFORE validating)
// ─────────────────────────────────────────────

/**
 * Strips dangerous characters from a string to prevent XSS.
 * Use on any user input before storing or rendering.
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Safely parses a JSON string. Returns null if invalid.
 * Always validate structure after parsing.
 * @param {string} str
 * @returns {object|null}
 */
export function safeParseJSON(str) {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    return parsed;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// VALIDATOR CLASS
// ─────────────────────────────────────────────

export class Validator {
  /**
   * @param {any} value - The value to validate
   * @param {string} fieldName - Human-readable field name for error messages
   */
  constructor(value, fieldName = "Field") {
    this.value = value;
    this.fieldName = fieldName;
    this.errors = [];
    this._skip = false; // used by optional() to skip further checks if empty
  }

  // ─── PRESENCE ───────────────────────────────

  /**
   * Fails if value is null, undefined, or empty string.
   */
  required() {
    if (
      this.value === null ||
      this.value === undefined ||
      String(this.value).trim() === ""
    ) {
      this.errors.push(`${this.fieldName} is required.`);
      this._skip = true; // no point running further checks on empty value
    }
    return this;
  }

  /**
   * Marks field as optional. If empty, skips all further checks.
   * Use instead of required() for non-mandatory fields.
   */
  optional() {
    if (
      this.value === null ||
      this.value === undefined ||
      String(this.value).trim() === ""
    ) {
      this._skip = true;
    }
    return this;
  }

  // ─── STRING CHECKS ───────────────────────────

  /**
   * Minimum character length.
   * @param {number} n
   */
  minLength(n) {
    if (this._skip) return this;
    if (String(this.value).length < n) {
      this.errors.push(`${this.fieldName} must be at least ${n} characters.`);
    }
    return this;
  }

  /**
   * Maximum character length.
   * @param {number} n
   */
  maxLength(n) {
    if (this._skip) return this;
    if (String(this.value).length > n) {
      this.errors.push(`${this.fieldName} must be no more than ${n} characters.`);
    }
    return this;
  }

  /**
   * Exact character length.
   * @param {number} n
   */
  exactLength(n) {
    if (this._skip) return this;
    if (String(this.value).length !== n) {
      this.errors.push(`${this.fieldName} must be exactly ${n} characters.`);
    }
    return this;
  }

  /**
   * Value must not contain any whitespace.
   */
  noSpaces() {
    if (this._skip) return this;
    if (/\s/.test(this.value)) {
      this.errors.push(`${this.fieldName} must not contain spaces.`);
    }
    return this;
  }

  /**
   * Checks that value contains no script-injection characters.
   * Good first-pass XSS guard on top of sanitize().
   */
  noScript() {
    if (this._skip) return this;
    if (/[<>"'`]/.test(this.value)) {
      this.errors.push(`${this.fieldName} contains invalid characters.`);
    }
    return this;
  }

  // ─── FORMAT CHECKS ───────────────────────────

  /**
   * Must be a valid email address.
   */
  isEmail() {
    if (this._skip) return this;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(this.value))) {
      this.errors.push(`${this.fieldName} must be a valid email address.`);
    }
    return this;
  }

  /**
   * Must be a valid URL (http or https).
   */
  isUrl() {
    if (this._skip) return this;
    try {
      const url = new URL(this.value);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      this.errors.push(`${this.fieldName} must be a valid URL (http or https).`);
    }
    return this;
  }

  /**
   * Must be a valid phone number (international-friendly).
   */
  isPhone() {
    if (this._skip) return this;
    const re = /^\+?[\d\s\-().]{7,20}$/;
    if (!re.test(String(this.value))) {
      this.errors.push(`${this.fieldName} must be a valid phone number.`);
    }
    return this;
  }

  /**
   * Must be a US ZIP code (5-digit or ZIP+4).
   */
  isZip() {
    if (this._skip) return this;
    const re = /^\d{5}(-\d{4})?$/;
    if (!re.test(String(this.value))) {
      this.errors.push(`${this.fieldName} must be a valid ZIP code.`);
    }
    return this;
  }

  /**
   * Must match a date in YYYY-MM-DD format.
   */
  isDate() {
    if (this._skip) return this;
    const re = /^\d{4}-\d{2}-\d{2}$/;
    const d = new Date(this.value);
    if (!re.test(String(this.value)) || isNaN(d.getTime())) {
      this.errors.push(`${this.fieldName} must be a valid date (YYYY-MM-DD).`);
    }
    return this;
  }

  /**
   * Must contain at least one uppercase, one lowercase, one number,
   * and one special character. Minimum 8 characters.
   * Good for password fields.
   */
  isStrongPassword() {
    if (this._skip) return this;
    const checks = [
      { re: /.{8,}/, msg: "at least 8 characters" },
      { re: /[A-Z]/, msg: "one uppercase letter" },
      { re: /[a-z]/, msg: "one lowercase letter" },
      { re: /[0-9]/, msg: "one number" },
      { re: /[^A-Za-z0-9]/, msg: "one special character" },
    ];
    const failed = checks.filter((c) => !c.re.test(String(this.value)));
    if (failed.length > 0) {
      this.errors.push(
        `${this.fieldName} must contain ${failed.map((f) => f.msg).join(", ")}.`
      );
    }
    return this;
  }

  // ─── NUMBER CHECKS ───────────────────────────

  /**
   * Must be a numeric value.
   */
  isNumber() {
    if (this._skip) return this;
    if (isNaN(this.value) || isNaN(parseFloat(this.value))) {
      this.errors.push(`${this.fieldName} must be a number.`);
    }
    return this;
  }

  /**
   * Must be a whole integer.
   */
  isInteger() {
    if (this._skip) return this;
    if (!Number.isInteger(Number(this.value))) {
      this.errors.push(`${this.fieldName} must be a whole number.`);
    }
    return this;
  }

  /**
   * Must be within a numeric range (inclusive).
   * @param {number} min
   * @param {number} max
   */
  inRange(min, max) {
    if (this._skip) return this;
    const num = Number(this.value);
    if (isNaN(num) || num < min || num > max) {
      this.errors.push(`${this.fieldName} must be between ${min} and ${max}.`);
    }
    return this;
  }

  /**
   * Must be greater than a minimum value.
   * @param {number} min
   */
  min(min) {
    if (this._skip) return this;
    if (Number(this.value) < min) {
      this.errors.push(`${this.fieldName} must be at least ${min}.`);
    }
    return this;
  }

  /**
   * Must be less than a maximum value.
   * @param {number} max
   */
  max(max) {
    if (this._skip) return this;
    if (Number(this.value) > max) {
      this.errors.push(`${this.fieldName} must be no more than ${max}.`);
    }
    return this;
  }

  // ─── WHITELIST / PATTERN ─────────────────────

  /**
   * Value must be one of the allowed options.
   * Great for dropdowns, selects, and enums.
   * @param {Array} arr - Array of allowed values
   */
  isOneOf(arr) {
    if (this._skip) return this;
    if (!arr.includes(this.value)) {
      this.errors.push(
        `${this.fieldName} must be one of: ${arr.join(", ")}.`
      );
    }
    return this;
  }

  /**
   * Value must match a custom regular expression.
   * @param {RegExp} regex
   * @param {string} message - Custom error message
   */
  matches(regex, message) {
    if (this._skip) return this;
    if (!regex.test(String(this.value))) {
      this.errors.push(message || `${this.fieldName} format is invalid.`);
    }
    return this;
  }

  // ─── COMPARISON ──────────────────────────────

  /**
   * Value must equal another value. Useful for confirm password fields.
   * @param {any} otherValue
   * @param {string} otherFieldName
   */
  equals(otherValue, otherFieldName = "values") {
    if (this._skip) return this;
    if (this.value !== otherValue) {
      this.errors.push(`${this.fieldName} must match ${otherFieldName}.`);
    }
    return this;
  }

  // ─── ESCAPE HATCH ────────────────────────────

  /**
   * Run any custom validation function.
   * Function receives the value and should return true (pass) or a string (error message).
   * @param {Function} fn
   */
  custom(fn) {
    if (this._skip) return this;
    const result = fn(this.value);
    if (result !== true) {
      this.errors.push(result || `${this.fieldName} is invalid.`);
    }
    return this;
  }

  // ─── RESULT ──────────────────────────────────

  /**
   * Returns the final validation result.
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate() {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
    };
  }
}

// ─────────────────────────────────────────────
// FORM VALIDATOR (validates multiple fields at once)
// ─────────────────────────────────────────────

/**
 * Validates an entire form object against a schema of rules.
 *
 * @param {object} formData - Key/value pairs of field names and their values
 * @param {object} schema   - Key/value pairs of field names and validator functions
 * @returns {{ valid: boolean, errors: object }}
 *
 * Example schema:
 *   const schema = {
 *     email: (val) => new Validator(val, "Email").required().isEmail().validate(),
 *     age:   (val) => new Validator(val, "Age").required().isInteger().inRange(18, 99).validate(),
 *   };
 */
export function validateForm(formData, schema) {
  const errors = {};

  for (const field of Object.keys(schema)) {
    const result = schema[field](formData[field]);
    if (!result.valid) {
      errors[field] = result.errors;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
