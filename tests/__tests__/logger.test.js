const Logger = require('../../src/server/utils/logger');
const fs = require('fs');
const path = require('path');

describe('Logger', () => {
  let logger;
  let testLogPath;

  beforeEach(() => {
    testLogPath = path.join(__dirname, 'test.log');
    logger = new Logger({ logPath: testLogPath, level: 'DEBUG' });
  });

  afterEach(() => {
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
    const rotated = testLogPath + '.1';
    if (fs.existsSync(rotated)) {
      fs.unlinkSync(rotated);
    }
  });

  test('logs messages', () => {
    logger.info('Test message');
    const content = fs.readFileSync(testLogPath, 'utf-8');
    expect(content).toContain('Test message');
    expect(content).toContain('[INFO]');
  });

  test('respects log levels', () => {
    const warnLogger = new Logger({ logPath: testLogPath, level: 'WARN' });
    warnLogger.debug('Debug message');
    warnLogger.warn('Warning message');
    
    const content = fs.readFileSync(testLogPath, 'utf-8');
    expect(content).not.toContain('Debug message');
    expect(content).toContain('Warning message');
  });
});
