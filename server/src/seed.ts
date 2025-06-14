import { User, Profile, Photo, Prompt, Test, TestItem, Rating, CreditTransaction } from './models';
import sequelize from './utils/db';

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Rating.destroy({ where: {} });
    await TestItem.destroy({ where: {} });
    await Test.destroy({ where: {} });
    await Photo.destroy({ where: {} });
    await Prompt.destroy({ where: {} });
    await Profile.destroy({ where: {} });
    await CreditTransaction.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test users
    const user1 = await User.create({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      credits: 100,
      is_active: true
    });

    const user2 = await User.create({
      email: 'rater@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Rater',
      credits: 50,
      is_active: true
    });

    // Create profiles
    const profile1 = await Profile.create({
      user_id: user1.id,
      bio: 'This is a test bio for the first user. I love hiking and photography!',
      status: 'complete',
      is_active: true
    });

    const profile2 = await Profile.create({
      user_id: user2.id,
      bio: 'This is a test bio for the second user. I enjoy reading and traveling.',
      status: 'complete',
      is_active: true
    });

    // Create photos
    const photos = await Promise.all([
      Photo.create({
        profile_id: profile1.id,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        order_index: 0
      }),
      Photo.create({
        profile_id: profile1.id,
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        order_index: 1
      }),
      Photo.create({
        profile_id: profile1.id,
        url: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43',
        order_index: 2
      })
    ]);

    // Create prompts
    const prompts = await Promise.all([
      Prompt.create({
        profile_id: profile1.id,
        question: 'What\'s your favorite travel destination?',
        answer: 'I love exploring the mountains of Switzerland!'
      }),
      Prompt.create({
        profile_id: profile1.id,
        question: 'What\'s your go-to karaoke song?',
        answer: 'Sweet Caroline by Neil Diamond'
      }),
      Prompt.create({
        profile_id: profile1.id,
        question: 'What\'s your ideal weekend?',
        answer: 'Hiking in the morning, reading in the afternoon, and dinner with friends in the evening.'
      })
    ]);

    // Create a test
    const test = await Test.create({
      user_id: user1.id,
      type: 'full_profile',
      status: 'complete',
      cost: 10,
      started_at: new Date(Date.now() - 86400000), // 1 day ago
      completed_at: new Date()
    });

    // Create test items
    await Promise.all([
      ...photos.map(photo => 
        TestItem.create({
          test_id: test.id,
          item_type: 'photo',
          item_id: photo.id,
          original_item_id: photo.id
        })
      ),
      ...prompts.map(prompt =>
        TestItem.create({
          test_id: test.id,
          item_type: 'prompt',
          item_id: prompt.id,
          original_item_id: prompt.id
        })
      )
    ]);

    // Create ratings
    await Promise.all([
      Rating.create({
        test_id: test.id,
        rater_id: user2.id,
        item_type: 'photo',
        item_id: photos[0].id,
        rating: 5,
        feedback: 'Great photo!',
        is_anonymous: false
      }),
      Rating.create({
        test_id: test.id,
        rater_id: user2.id,
        item_type: 'prompt',
        item_id: prompts[0].id,
        rating: 4,
        feedback: 'Interesting answer!',
        is_anonymous: false
      })
    ]);

    // Create credit transactions
    await Promise.all([
      CreditTransaction.create({
        user_id: user1.id,
        amount: 100,
        type: 'purchase',
        description: 'Initial credit purchase'
      }),
      CreditTransaction.create({
        user_id: user1.id,
        amount: -10,
        type: 'test',
        description: 'Full profile test',
        reference_id: test.id
      })
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase(); 