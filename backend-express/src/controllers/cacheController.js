const { cache } = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

/**
 * Cache Controller - Manage cache operations
 */
class CacheController {
  /**
   * Get cache statistics
   * GET /api/cache/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = cache.getStats();
    successResponse(res, stats, 'Cache statistics retrieved');
  });

  /**
   * Clear all cache
   * DELETE /api/cache/clear
   */
  clearCache = asyncHandler(async (req, res) => {
    cache.clear();
    successResponse(res, {}, 'Cache cleared successfully');
  });

  /**
   * Delete cache by pattern
   * DELETE /api/cache/pattern/:pattern
   */
  deletePattern = asyncHandler(async (req, res) => {
    const { pattern } = req.params;
    const deleted = cache.deletePattern(pattern);
    successResponse(res, { deleted }, `Deleted ${deleted} cache entries`);
  });
}

module.exports = new CacheController();
