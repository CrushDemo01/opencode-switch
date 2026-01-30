const Validator = require('../../src/server/utils/validator');

describe('Validator', () => {
  describe('isValidProviderId', () => {
    test('validates correct provider IDs', () => {
      expect(Validator.isValidProviderId('openai')).toBe(true);
      expect(Validator.isValidProviderId('my-provider')).toBe(true);
      expect(Validator.isValidProviderId('provider_123')).toBe(true);
    });

    test('rejects invalid provider IDs', () => {
      expect(Validator.isValidProviderId('')).toBe(false);
      expect(Validator.isValidProviderId(null)).toBe(false);
      expect(Validator.isValidProviderId('provider.id')).toBe(false);
      expect(Validator.isValidProviderId('provider id')).toBe(false);
    });
  });

  describe('isValidBaseURL', () => {
    test('validates correct URLs', () => {
      expect(Validator.isValidBaseURL('https://api.openai.com/v1')).toBe(true);
      expect(Validator.isValidBaseURL('http://localhost:11434/v1')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      expect(Validator.isValidBaseURL('')).toBe(false);
      expect(Validator.isValidBaseURL('not-a-url')).toBe(false);
      expect(Validator.isValidBaseURL('ftp://invalid.com')).toBe(false);
    });
  });

  describe('isValidApiKey', () => {
    test('validates correct API keys', () => {
      expect(Validator.isValidApiKey('sk-1234567890')).toBe(true);
      expect(Validator.isValidApiKey('valid-key')).toBe(true);
    });

    test('rejects invalid API keys', () => {
      expect(Validator.isValidApiKey('')).toBe(false);
      expect(Validator.isValidApiKey(null)).toBe(false);
    });
  });

  describe('validateProviderConfig', () => {
    test('validates complete config', () => {
      const config = {
        providerId: 'openai',
        name: 'OpenAI',
        options: {
          baseURL: 'https://api.openai.com/v1',
          apiKey: 'sk-1234567890'
        },
        models: {
          'gpt-4': { name: 'gpt-4' }
        }
      };
      const result = Validator.validateProviderConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects invalid config', () => {
      const config = {
        providerId: 'invalid.id',
        options: {
          baseURL: 'not-a-url',
          apiKey: 'sk-1234567890'
        }
      };
      const result = Validator.validateProviderConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
