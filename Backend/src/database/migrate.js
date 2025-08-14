const { pool } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🚀 Starting database migration...');

    // Create enum types
    console.log('📝 Creating enum types...');
    await pool.query(`
      DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('content-creator', 'entrepreneur', 'social-media-manager', 'admin');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
          CREATE TYPE content_genre AS ENUM ('educational', 'entertainment', 'gaming', 'lifestyle', 'music', 'tech', 'travel', 'other');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
          CREATE TYPE business_category AS ENUM ('ecommerce', 'saas', 'consulting', 'agency', 'retail', 'manufacturing', 'other');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
          CREATE TYPE client_type AS ENUM ('influencers', 'small-businesses', 'corporate', 'individuals', 'mixed');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
          CREATE TYPE business_size AS ENUM ('solo', 'small-team', 'medium', 'large');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
          CREATE TYPE social_media_niche AS ENUM ('content-creation', 'community-management', 'marketing-campaigns', 'analytics', 'full-service');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create user_profiles table
    console.log('👥 Creating user_profiles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          user_role user_role,
          profile_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create content_creator_profiles table
    console.log('🎬 Creating content_creator_profiles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_creator_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
          content_genre content_genre NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create entrepreneur_profiles table
    console.log('💼 Creating entrepreneur_profiles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entrepreneur_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
          business_category business_category NOT NULL,
          business_description TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create social_media_manager_profiles table
    console.log('📱 Creating social_media_manager_profiles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_media_manager_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
          client_type client_type NOT NULL,
          business_size business_size NOT NULL,
          social_media_niche social_media_niche NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    console.log('🔍 Creating indexes...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(user_role);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_content_creator_user_id ON content_creator_profiles(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_entrepreneur_user_id ON entrepreneur_profiles(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_social_media_manager_user_id ON social_media_manager_profiles(user_id);');

    // Create function to update updated_at timestamp
    console.log('⚙️ Creating update functions...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers for updated_at
    console.log('🔗 Creating triggers...');
    await pool.query(`
      DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
      CREATE TRIGGER update_user_profiles_updated_at
          BEFORE UPDATE ON user_profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_content_creator_profiles_updated_at ON content_creator_profiles;
      CREATE TRIGGER update_content_creator_profiles_updated_at
          BEFORE UPDATE ON content_creator_profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_entrepreneur_profiles_updated_at ON entrepreneur_profiles;
      CREATE TRIGGER update_entrepreneur_profiles_updated_at
          BEFORE UPDATE ON entrepreneur_profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_social_media_manager_profiles_updated_at ON social_media_manager_profiles;
      CREATE TRIGGER update_social_media_manager_profiles_updated_at
          BEFORE UPDATE ON social_media_manager_profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - user_profiles');
    console.log('   - content_creator_profiles');
    console.log('   - entrepreneur_profiles');
    console.log('   - social_media_manager_profiles');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables }; 