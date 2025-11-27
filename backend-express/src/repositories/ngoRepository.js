const NGO = require('../../models/NGO');

/**
 * NGO Repository - Handles all database operations for NGOs
 */
class NGORepository {
  /**
   * Find NGO by email
   */
  async findByEmail(email) {
    return await NGO.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find NGO by ID
   */
  async findById(id) {
    return await NGO.findById(id).select('-password');
  }

  /**
   * Find NGO by ID with password (for authentication)
   */
  async findByIdWithPassword(id) {
    return await NGO.findById(id);
  }

  /**
   * Create new NGO
   */
  async create(ngoData) {
    const ngo = new NGO(ngoData);
    return await ngo.save();
  }

  /**
   * Find all NGOs
   */
  async findAll(filter = {}) {
    return await NGO.find(filter).select('-password');
  }

  /**
   * Update NGO
   */
  async update(id, updateData) {
    return await NGO.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  /**
   * Delete NGO
   */
  async delete(id) {
    return await NGO.findByIdAndDelete(id);
  }

  /**
   * Update NGO status (active/blocked)
   */
  async updateStatus(id, status) {
    return await NGO.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');
  }
}

module.exports = new NGORepository();
