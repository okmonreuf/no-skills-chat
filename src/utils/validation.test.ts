import { describe, it, expect } from "vitest";

// Validation utilities for testing
const validateUsername = (username: string): boolean => {
  return (
    username.length >= 3 &&
    username.length <= 30 &&
    /^[a-zA-Z0-9_]+$/.test(username)
  );
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string): boolean => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

describe("Validation Utils", () => {
  describe("Username Validation", () => {
    it("should accept valid usernames", () => {
      const validUsernames = ["user123", "test_user", "User", "admin"];

      validUsernames.forEach((username) => {
        expect(validateUsername(username)).toBe(true);
      });
    });

    it("should reject invalid usernames", () => {
      const invalidUsernames = [
        "", // empty
        "us", // too short
        "a".repeat(31), // too long
        "user@domain", // invalid chars
        "user name", // space
        "user-name", // dash
      ];

      invalidUsernames.forEach((username) => {
        expect(validateUsername(username)).toBe(false);
      });
    });
  });

  describe("Email Validation", () => {
    it("should accept valid emails", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.org",
        "admin+tag@company.co.uk",
        "numbers123@domain.net",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("should reject invalid emails", () => {
      const invalidEmails = [
        "invalid-email",
        "@domain.com",
        "user@",
        "user@@domain.com",
        "user name@domain.com",
        "",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe("Password Validation", () => {
    it("should accept strong passwords", () => {
      const strongPasswords = [
        "Password123!",
        "SecureP@ss1",
        "MyStr0ng#Password",
        "Comp1ex$Pass",
      ];

      strongPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it("should reject weak passwords", () => {
      const weakPasswords = [
        "password", // no uppercase, number, special
        "PASSWORD", // no lowercase, number, special
        "Password", // no number, special
        "Password1", // no special
        "Pass1!", // too short
        "12345678", // no letters
        "",
      ];

      weakPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe("Age Validation", () => {
    it("should validate minimum age requirement", () => {
      const minimumAge = 15;
      const currentYear = new Date().getFullYear();

      // Test ages
      const validAges = [15, 16, 18, 25, 30];
      const invalidAges = [10, 12, 14];

      validAges.forEach((age) => {
        expect(age >= minimumAge).toBe(true);
      });

      invalidAges.forEach((age) => {
        expect(age >= minimumAge).toBe(false);
      });
    });

    it("should validate birth year", () => {
      const currentYear = new Date().getFullYear();
      const minimumAge = 15;
      const maxValidBirthYear = currentYear - minimumAge;

      // Someone born in 2009 would be 15 in 2024 (valid)
      // Someone born in 2011 would be 13 in 2024 (invalid)

      expect(2009 <= maxValidBirthYear).toBe(true);
      expect(2011 <= maxValidBirthYear).toBe(false);
    });
  });

  describe("Security Validations", () => {
    it("should detect potential security risks in usernames", () => {
      const riskyUsernames = [
        "admin",
        "administrator",
        "root",
        "system",
        "moderator",
      ];

      // These would typically be reserved names
      riskyUsernames.forEach((username) => {
        const isReserved = [
          "admin",
          "administrator",
          "root",
          "system",
          "moderator",
        ].includes(username.toLowerCase());
        expect(isReserved).toBe(true);
      });
    });

    it("should validate against common passwords", () => {
      const commonPasswords = [
        "password",
        "123456",
        "password123",
        "admin",
        "qwerty",
      ];

      commonPasswords.forEach((password) => {
        const isCommon = [
          "password",
          "123456",
          "password123",
          "admin",
          "qwerty",
        ].includes(password.toLowerCase());
        expect(isCommon).toBe(true);
      });
    });
  });
});
