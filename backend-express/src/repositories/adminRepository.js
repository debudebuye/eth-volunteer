const Admin = require('../../models/admin');

/**
 * Admin Repository - Handles all database operations for admins
 */
class AdminRepository {
  /**
   * Find admin by email
   */
  async findByEmail(email) {
    return await Admin.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find admin by ID
   */
  async findById(id) {
    return await Admin.findById(id).select('-password');
  }

  /**
   * Find admin by ID with password (for authentication)
   */
  async findByIdWithPassword(id) {
    return await Admin.findById(id);
  }

  /**
   * Create new admin
   */
  async create(adminData) {
    const admin = new Admin(adminData);
    return await admin.save();
  }

  /**
   * Find all admins
   */
  async findAll() {
    return await Admin.find().select('-password');
  }

  /**
   * Update admin
   */
  async update(id, updateData) {
    return await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  /**
   * Delete admin
   */
  async delete(id) {
    return await Admin.findByIdAndDelete(id);
  }
}

module.exports = new AdminRepository();
