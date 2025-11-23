const cache = require('../../../src/utils/cache');

describe('Cache Utility', () => {
  beforeEach(() => {
    cache.clear();
  });

  afterEach(() => {
    cache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve value', () => {
      cache.set('key1', 'value1');
      const result = cache.get('key1');

      expect(result).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should store complex objects', () => {
      const obj = { name: 'Test', count: 42 };
      cache.set('obj', obj);
      const result = cache.get('obj');

      expect(result).toEqual(obj);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete key', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');

      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.size()).toBe(0);
    });
  });

  describe('TTL', () => {
    it('should expire after TTL', (done) => {
      cache.set('key1', 'value1', 1); // 1 second TTL

      setTimeout(() => {
        expect(cache.has('key1')).toBe(false);
        done();
      }, 1100);
    }, 2000);
  });

  describe('stats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.stats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });
});
