const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/userModel');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cre8hub';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️ Database already contains data. Skipping seeding.');
      await mongoose.disconnect();
      return;
    }

    // Create sample users
    console.log('👥 Creating sample users...');
    
    const users = [
      {
        email: 'john.doe@example.com',
        password: 'Password123!',
        fullName: 'John Doe',
        userRole: 'content-creator',
        profileCompleted: true,
        emailVerified: true,
        contentCreatorProfile: {
          contentGenre: 'tech',
          bio: 'Tech enthusiast and content creator sharing insights about the latest in technology and innovation.',
          socialMediaLinks: {
            youtube: 'https://youtube.com/@johndoe',
            instagram: 'https://instagram.com/johndoe',
            twitter: 'https://twitter.com/johndoe'
          },
          contentStats: {
            totalVideos: 150,
            totalViews: 2500000,
            totalSubscribers: 50000,
            averageViewsPerVideo: 16667
          },
          targetAudience: {
            ageRange: { min: 18, max: 35 },
            interests: ['technology', 'innovation', 'startups', 'coding'],
            location: 'San Francisco, CA'
          },
          collaborationPreferences: {
            isOpenToCollaborations: true,
            preferredCollaborationTypes: ['sponsored-content', 'product-reviews'],
            minimumCollaborationRate: 1000,
            rateCurrency: 'USD'
          }
        }
      },
      {
        email: 'jane.smith@example.com',
        password: 'Password123!',
        fullName: 'Jane Smith',
        userRole: 'entrepreneur',
        profileCompleted: true,
        emailVerified: true,
        entrepreneurProfile: {
          businessCategory: 'saas',
          businessDescription: 'Building innovative software solutions for modern businesses, focusing on automation and efficiency.',
          businessName: 'TechFlow Solutions',
          businessWebsite: 'https://techflowsolutions.com',
          businessSize: 'medium',
          annualRevenue: '1m-5m',
          yearsInBusiness: 3,
          targetMarket: {
            industry: ['technology', 'finance', 'healthcare'],
            customerType: 'b2b',
            geographicFocus: ['North America', 'Europe'],
            customerSize: 'medium-businesses'
          },
          marketingNeeds: {
            primaryGoals: ['lead-generation', 'brand-awareness'],
            budget: '10k-25k',
            timeline: 'within-quarter',
            preferredChannels: ['social-media', 'content-marketing', 'email-marketing']
          },
          collaborationPreferences: {
            isOpenToCollaborations: true,
            preferredCollaborationTypes: ['content-creation', 'social-media-management'],
            minimumProjectValue: 5000,
            preferredPaymentTerms: 'monthly'
          }
        }
      },
      {
        email: 'mike.johnson@example.com',
        password: 'Password123!',
        fullName: 'Mike Johnson',
        userRole: 'social-media-manager',
        profileCompleted: true,
        emailVerified: true,
        socialMediaManagerProfile: {
          clientType: 'small-businesses',
          businessSize: 'small-team',
          socialMediaNiche: 'full-service',
          bio: 'Experienced social media manager helping small businesses grow their online presence and engage with their audience.',
          experience: {
            yearsOfExperience: 5,
            industriesWorked: ['retail', 'restaurants', 'healthcare', 'real-estate'],
            certifications: [{
              name: 'Facebook Blueprint',
              issuer: 'Facebook',
              dateObtained: new Date('2022-01-15')
            }]
          },
          services: {
            primaryServices: ['social-media-management', 'content-strategy', 'community-management'],
            additionalServices: ['brand voice development', 'crisis management'],
            servicePackages: [{
              name: 'Starter Package',
              description: 'Basic social media management for small businesses',
              price: 800,
              priceType: 'monthly',
              features: ['3 posts per week', 'Community management', 'Monthly report']
            }]
          },
          socialMediaPlatforms: {
            platforms: [
              { name: 'facebook', expertise: 'expert', yearsOfExperience: 5 },
              { name: 'instagram', expertise: 'expert', yearsOfExperience: 5 },
              { name: 'linkedin', expertise: 'advanced', yearsOfExperience: 3 }
            ],
            crossPlatformStrategy: true
          },
          clientPortfolio: {
            currentClients: 8,
            totalClientsServed: 25,
            averageClientRetention: 85
          },
          collaborationPreferences: {
            isOpenToCollaborations: true,
            preferredCollaborationTypes: ['referral-partnerships', 'white-label-services'],
            minimumProjectValue: 1000,
            preferredPaymentTerms: 'monthly',
            availability: {
              isAvailable: true,
              responseTime: 'within-24h',
              maxClients: 12
            }
          }
        }
      },
      {
        email: 'admin@cre8hub.com',
        password: 'Admin123!',
        fullName: 'Admin User',
        userRole: 'admin',
        profileCompleted: true,
        emailVerified: true
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${savedUser.fullName} (${savedUser.email})`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Sample data created:');
    console.log('   - 4 sample users (including admin)');
    console.log('   - 1 content creator with complete profile');
    console.log('   - 1 entrepreneur with complete profile');
    console.log('   - 1 social media manager with complete profile');
    console.log('');
    console.log('🔑 Sample login credentials:');
    console.log('   Content Creator: john.doe@example.com / Password123!');
    console.log('   Entrepreneur: jane.smith@example.com / Password123!');
    console.log('   Social Media Manager: mike.johnson@example.com / Password123!');
    console.log('   Admin: admin@cre8hub.com / Admin123!');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase }; 