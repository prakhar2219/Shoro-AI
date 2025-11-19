import mongoose from 'mongoose';
import { CONFIG } from '../config/config';
import User from '../models/user.model';
import logger from '../config/logger';

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(CONFIG.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      logger.info(`Super admin already exists: ${existingSuperAdmin.email}`);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      name: 'Pankaj Tulshyan',
      email: 'pankajtulshyan@gmail.com',
      password: 'Pankaj@1234',
      role: 'super_admin',
      active: true,
    });

    logger.info(`✅ Super admin created successfully!`);
    logger.info(`Email: ${superAdmin.email}`);
    logger.info(`Role: ${superAdmin.role}`);
    logger.info(`⚠️  Please change the password after first login!`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding super admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
