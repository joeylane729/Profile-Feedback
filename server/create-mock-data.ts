import { User, Profile, Photo, Prompt, Test, TestItem, Rating, CreditTransaction, Credits } from './src/models';
import sequelize from './src/utils/db';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

// Mock user data with diverse personalities
const mockUsers = [
  {
    email: 'sarah.chen@email.com',
    password: 'password123',
    first_name: 'Sarah',
    last_name: 'Chen',
    bio: 'Software engineer by day, amateur photographer by night. Love hiking, trying new restaurants, and exploring hidden gems in the city. Looking for someone who shares my curiosity for life and doesn\'t mind getting lost on adventures.',
    interests: ['photography', 'hiking', 'food', 'technology'],
    age: 28,
    profession: 'Software Engineer'
  },
  {
    email: 'marcus.johnson@email.com',
    password: 'password123',
    first_name: 'Marcus',
    last_name: 'Johnson',
    bio: 'Marketing director with a passion for travel and food. I\'ve visited 15 countries and counting. Love cooking, wine tasting, and finding the best local spots wherever I go. Seeking someone who appreciates good conversation and great food.',
    interests: ['travel', 'cooking', 'wine', 'marketing'],
    age: 32,
    profession: 'Marketing Director'
  },
  {
    email: 'emma.rodriguez@email.com',
    password: 'password123',
    first_name: 'Emma',
    last_name: 'Rodriguez',
    bio: 'Creative soul working as a graphic designer. I find beauty in everyday moments and love expressing myself through art. Enjoys yoga, live music, and deep conversations over coffee. Looking for someone who values authenticity and creativity.',
    interests: ['art', 'yoga', 'music', 'coffee'],
    age: 25,
    profession: 'Graphic Designer'
  },
  {
    email: 'david.kim@email.com',
    password: 'password123',
    first_name: 'David',
    last_name: 'Kim',
    bio: 'Financial analyst who believes in work-life balance. I\'m into fitness, cooking, and learning new skills. Currently mastering the art of making the perfect sourdough bread. Seeking someone who values growth and doesn\'t take life too seriously.',
    interests: ['fitness', 'cooking', 'finance', 'learning'],
    age: 30,
    profession: 'Financial Analyst'
  },
  {
    email: 'lisa.thompson@email.com',
    password: 'password123',
    first_name: 'Lisa',
    last_name: 'Thompson',
    bio: 'Elementary school teacher with a heart for helping others. I love reading, gardening, and spending time outdoors. My students keep me young at heart. Looking for someone who values kindness, education, and simple pleasures in life.',
    interests: ['teaching', 'reading', 'gardening', 'outdoors'],
    age: 27,
    profession: 'Teacher'
  },
  {
    email: 'alex.rivera@email.com',
    password: 'password123',
    first_name: 'Alex',
    last_name: 'Rivera',
    bio: 'Nurse who finds fulfillment in helping people. I\'m passionate about health, music, and volunteer work. Love playing guitar and discovering new bands. Seeking someone who values compassion, adventure, and meaningful connections.',
    interests: ['healthcare', 'music', 'volunteering', 'guitar'],
    age: 29,
    profession: 'Nurse'
  },
  {
    email: 'jordan.smith@email.com',
    password: 'password123',
    first_name: 'Jordan',
    last_name: 'Smith',
    bio: 'Architect with an eye for design and a love for travel. I believe good design can change the world. Enjoys sketching, exploring new cities, and finding inspiration in unexpected places. Looking for someone who appreciates beauty and adventure.',
    interests: ['architecture', 'design', 'travel', 'sketching'],
    age: 31,
    profession: 'Architect'
  },
  {
    email: 'maya.patel@email.com',
    password: 'password123',
    first_name: 'Maya',
    last_name: 'Patel',
    bio: 'Data scientist who loves solving puzzles and understanding patterns. I practice yoga and meditation to stay balanced. Enjoy reading sci-fi novels and experimenting with new recipes. Seeking someone who values intelligence, mindfulness, and growth.',
    interests: ['data science', 'yoga', 'meditation', 'reading'],
    age: 26,
    profession: 'Data Scientist'
  },
  {
    email: 'chris.wilson@email.com',
    password: 'password123',
    first_name: 'Chris',
    last_name: 'Wilson',
    bio: 'Chef who believes food brings people together. I love experimenting with flavors and creating memorable dining experiences. When not in the kitchen, I enjoy hiking and photography. Looking for someone who appreciates good food and great conversation.',
    interests: ['cooking', 'food', 'hiking', 'photography'],
    age: 33,
    profession: 'Chef'
  },
  {
    email: 'taylor.brown@email.com',
    password: 'password123',
    first_name: 'Taylor',
    last_name: 'Brown',
    bio: 'Graduate student studying environmental science. Passionate about sustainability and making a positive impact. Love hiking, coffee shops, and deep discussions about the future of our planet. Seeking someone who shares my values and curiosity.',
    interests: ['environmental science', 'sustainability', 'hiking', 'coffee'],
    age: 24,
    profession: 'Graduate Student'
  }
];

// Available photo files (excluding test photos and very small files)
const availablePhotos = [
  'photo-1750543276267-703573320.jpg',
  'photo-1750546650447-206730398.jpg',
  'photo-1750547970018-399724279.jpg',
  'photo-1750548141315-173663968.jpg',
  'photo-1750548324089-4937285.jpg',
  'photo-1750548643335-452064133.jpg',
  'photo-1750548643926-211043390.jpg',
  'photo-1750549830203-124152164.jpg',
  'photo-1750550432304-304038586.jpg',
  'photo-1750554117650-277471236.jpg',
  'photo-1750554118695-281513194.jpg',
  'mock-photo-001.jpg',
  'mock-photo-002.jpg',
  'mock-photo-003.jpg',
  'mock-photo-004.jpg',
  'mock-photo-005.jpg',
  'mock-photo-006.jpg',
  'mock-photo-007.jpg',
  'mock-photo-008.jpg',
  'mock-photo-009.jpg',
  'mock-photo-010.jpg',
  'mock-photo-011.jpg',
  'mock-photo-012.jpg',
  'mock-photo-013.jpg',
  'mock-photo-014.jpg',
  'mock-photo-015.jpg',
  'mock-photo-016.jpg',
  'mock-photo-017.jpg',
  'mock-photo-018.jpg',
  'mock-photo-019.jpg',
  'mock-photo-020.jpg',
  'mock-photo-021.jpg',
  'mock-photo-022.jpg',
  'mock-photo-023.jpg',
  'mock-photo-024.jpg',
  'mock-photo-025.jpg',
  'mock-photo-026.jpg',
  'mock-photo-027.jpg',
  'mock-photo-028.jpg',
  'mock-photo-029.jpg',
  'mock-photo-030.jpg'
];

// Common dating app prompts with varied answers
const promptTemplates = [
  {
    question: "I'm looking for",
    answers: [
      "Someone who loves hiking and outdoor adventures. I want to find a partner who shares my passion for exploring nature and trying new experiences.",
      "A genuine connection with someone who values authenticity and meaningful conversations. I'm not interested in surface-level relationships.",
      "A partner who appreciates good food and great conversation. Someone who doesn't mind getting lost in a new city together.",
      "Someone who challenges me intellectually and supports my goals. I value growth and want to grow together.",
      "A kind soul who makes me laugh and doesn't take life too seriously. Looking for someone who values joy and simple pleasures.",
      "A creative spirit who sees beauty in everyday moments. Someone who inspires me and shares my passion for art and expression.",
      "A thoughtful person who cares about making a positive impact. I want to build something meaningful together.",
      "Someone who values health and wellness as much as I do. Looking for a partner in both life and fitness.",
      "A curious mind who loves learning and trying new things. I want someone who keeps me inspired and engaged.",
      "A warm heart who values family and meaningful relationships. Looking for someone to build a life with."
    ]
  },
  {
    question: "My ideal first date",
    answers: [
      "A casual coffee followed by a walk in the park. I love getting to know someone in a relaxed setting where we can really talk and connect.",
      "Trying a new restaurant neither of us has been to. I think it's fun to discover new places together and share the experience.",
      "A hike with a picnic at the top. I love being outdoors and think it's a great way to see if we have compatible energy levels.",
      "A museum or art gallery visit. I enjoy cultural experiences and think they provide great conversation starters.",
      "Cooking dinner together. I love food and think it's a fun, interactive way to get to know each other.",
      "A live music show at a small venue. Music is important to me and I think it says a lot about someone's taste.",
      "A farmers market followed by cooking with what we find. I love fresh ingredients and creative cooking.",
      "A bike ride around the city. It's active, fun, and gives us a chance to explore together.",
      "A wine tasting at a local vineyard. I appreciate good wine and the relaxed atmosphere it creates.",
      "A bookstore date where we pick out books for each other. I love reading and think it's a great way to learn about someone."
    ]
  },
  {
    question: "My perfect weekend",
    answers: [
      "Starting with a morning hike, followed by brunch at my favorite local spot. Then maybe some time at the beach or exploring a new neighborhood in the city.",
      "Sleeping in, making a big breakfast, and spending the day reading or watching movies. I value quiet, cozy moments.",
      "Exploring a new city or town I haven't visited before. I love travel and discovering new places, even if it's just a day trip.",
      "A mix of productivity and relaxation - maybe some work in the morning, then meeting friends for dinner and drinks.",
      "Outdoor activities like rock climbing or kayaking, followed by a nice dinner and maybe some live music.",
      "Visiting local markets, trying new restaurants, and maybe catching a show or concert. I love cultural experiences.",
      "Volunteering in the morning, then spending time with family or close friends. I value giving back and meaningful connections.",
      "A spa day or wellness activities like yoga and meditation, followed by a healthy dinner and good conversation.",
      "Working on creative projects, maybe some painting or writing, then sharing the results with friends over dinner.",
      "Attending a workshop or class to learn something new, then practicing it together with someone special."
    ]
  },
  {
    question: "My most controversial opinion",
    answers: [
      "Pineapple absolutely belongs on pizza. The sweet and savory combination is perfect, and I'll defend this to the death.",
      "Coffee is better with a little bit of salt. It enhances the flavor and reduces bitterness. Don't knock it until you try it.",
      "Books are always better than their movie adaptations. The imagination creates a much richer experience.",
      "Breakfast food is acceptable at any time of day. Why limit delicious pancakes and eggs to just mornings?",
      "Cold pizza is superior to hot pizza. The flavors meld together better overnight, and the texture is perfect.",
      "Socks with sandals can be stylish if done right. It's all about the right combination and confidence.",
      "Cats are better conversationalists than dogs. They're more mysterious and have better comedic timing.",
      "The best way to eat a KitKat is to break it apart and eat each layer separately. It's a completely different experience.",
      "Mondays aren't that bad. It's all about your mindset and having something to look forward to.",
      "The best music was made in the 90s. The variety and creativity of that era is unmatched."
    ]
  },
  {
    question: "My love language",
    answers: [
      "Quality time - I feel most loved when someone makes time for me and is fully present in our moments together.",
      "Acts of service - I appreciate when someone does thoughtful things for me, like making coffee in the morning or running an errand.",
      "Physical touch - I feel connected through hugs, holding hands, and other forms of affectionate contact.",
      "Words of affirmation - I value verbal expressions of love, encouragement, and appreciation.",
      "Gifts - I love thoughtful presents that show someone really knows me and pays attention to what I like.",
      "A combination of quality time and physical touch. I need both emotional and physical connection to feel truly loved.",
      "Acts of service and words of affirmation. I appreciate both thoughtful actions and verbal expressions of care.",
      "Quality time and acts of service. I want someone who makes time for me and shows their love through actions.",
      "Physical touch and words of affirmation. I need both affectionate contact and verbal reassurance.",
      "Gifts and quality time. I love thoughtful presents, but I also need meaningful time together to feel connected."
    ]
  }
];

// Feedback templates for ratings
const feedbackTemplates = {
  positive: [
    "Great photo! You look confident and approachable.",
    "Love this answer - it shows personality and thoughtfulness.",
    "This makes me want to know more about you.",
    "You seem genuine and authentic.",
    "This shows you have interesting interests and passions.",
    "You come across as someone who knows what they want.",
    "This demonstrates good communication skills.",
    "You seem like someone who would be fun to spend time with.",
    "This shows depth and self-awareness.",
    "You appear to have a good balance of fun and seriousness."
  ],
  neutral: [
    "This is okay, but could be more specific.",
    "It's fine, but doesn't tell me much about you.",
    "This is a bit generic - could use more personality.",
    "It's not bad, but could be more engaging.",
    "This is acceptable, but not particularly memorable.",
    "It's fine, but I'd like to see more of your personality.",
    "This is okay, but could be more creative.",
    "It's not terrible, but could be more interesting.",
    "This is passable, but not exciting.",
    "It's fine, but doesn't stand out."
  ],
  negative: [
    "This doesn't tell me much about you.",
    "This comes across as a bit generic or cliché.",
    "This doesn't show much personality or creativity.",
    "This could be more engaging or interesting.",
    "This doesn't make me want to learn more about you.",
    "This seems a bit superficial or surface-level.",
    "This doesn't demonstrate much thought or effort.",
    "This could be more authentic or genuine.",
    "This doesn't show what makes you unique.",
    "This could be more specific or detailed."
  ]
};

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random rating value with weighted distribution
function getRandomRating(): 'keep' | 'neutral' | 'delete' {
  const rand = Math.random();
  if (rand < 0.6) return 'keep';      // 60% keep
  if (rand < 0.85) return 'neutral';  // 25% neutral
  return 'delete';                    // 15% delete
}

// Helper function to get random feedback based on rating
function getRandomFeedback(rating: 'keep' | 'neutral' | 'delete'): string {
  switch (rating) {
    case 'keep':
      return getRandomItem(feedbackTemplates.positive);
    case 'neutral':
      return getRandomItem(feedbackTemplates.neutral);
    case 'delete':
      return getRandomItem(feedbackTemplates.negative);
  }
}

const createMockData = async () => {
  try {
    console.log('Starting to create mock data...');

    // Clear existing data (except your original user)
    await Rating.destroy({ where: {} });
    await TestItem.destroy({ where: {} });
    await Test.destroy({ where: {} });
    await Photo.destroy({ where: {} });
    await Prompt.destroy({ where: {} });
    await Profile.destroy({ where: {} });
    await CreditTransaction.destroy({ where: {} });
    await User.destroy({ where: { email: { [Op.ne]: 'jophilane@gmail.com' } } });

    console.log('Cleared existing data');

    const createdUsers: any[] = [];
    const createdProfiles: any[] = [];
    const allPhotos: any[] = [];
    const allPrompts: any[] = [];
    const allTests: any[] = [];

    // Create users and profiles
    for (const mockUser of mockUsers) {
      const user = await User.create({
        email: mockUser.email,
        password: mockUser.password,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        is_active: true
      });

      const profile = await Profile.create({
        user_id: user.id,
        bio: mockUser.bio,
        status: 'complete' as const,
        is_active: true
      });

      createdUsers.push(user);
      createdProfiles.push(profile);

      console.log(`Created user: ${user.first_name} ${user.last_name}`);
    }

    // Create photos for each profile
    for (let i = 0; i < createdProfiles.length; i++) {
      const profile = createdProfiles[i];
      const photoCount = Math.floor(Math.random() * 4) + 3; // 3-6 photos per profile
      const selectedPhotos = getRandomItems(availablePhotos, photoCount);

      for (let j = 0; j < selectedPhotos.length; j++) {
        const photo = await Photo.create({
          profile_id: profile.id,
          url: `/uploads/${selectedPhotos[j]}`,
          order_index: j
        });
        allPhotos.push(photo);
      }

      console.log(`Created ${photoCount} photos for ${createdUsers[i].first_name}`);
    }

    // Create prompts for each profile
    for (let i = 0; i < createdProfiles.length; i++) {
      const profile = createdProfiles[i];
      const promptCount = Math.floor(Math.random() * 3) + 3; // 3-5 prompts per profile
      const selectedPrompts = getRandomItems(promptTemplates, promptCount);

      for (const promptTemplate of selectedPrompts) {
        const prompt = await Prompt.create({
          profile_id: profile.id,
          question: promptTemplate.question,
          answer: getRandomItem(promptTemplate.answers)
        });
        allPrompts.push(prompt);
      }

      console.log(`Created ${promptCount} prompts for ${createdUsers[i].first_name}`);
    }

    // Create tests for each user
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const testCount = Math.floor(Math.random() * 2) + 1; // 1-2 tests per user

      for (let j = 0; j < testCount; j++) {
        const test = await Test.create({
          user_id: user.id,
          type: 'full_profile' as const,
          status: 'complete' as const,
          cost: 10,
          started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
          completed_at: new Date()
        });
        allTests.push(test);

        // Create test items (photos and prompts for this user)
        const userPhotos = allPhotos.filter(p => p.profile_id === createdProfiles[i].id);
        const userPrompts = allPrompts.filter(p => p.profile_id === createdProfiles[i].id);

        // Add photos to test
        for (const photo of userPhotos) {
          await TestItem.create({
            test_id: test.id,
            item_type: 'photo' as const,
            item_id: photo.id,
            original_item_id: photo.id
          });
        }

        // Add prompts to test
        for (const prompt of userPrompts) {
          await TestItem.create({
            test_id: test.id,
            item_type: 'prompt' as const,
            item_id: prompt.id,
            original_item_id: prompt.id
          });
        }
      }

      console.log(`Created ${testCount} tests for ${user.first_name}`);
    }

    // Create cross-ratings between users
    for (let i = 0; i < createdUsers.length; i++) {
      const rater = createdUsers[i];
      
      // Each user rates 3-5 other users' content
      const usersToRate = getRandomItems(createdUsers.filter(u => u.id !== rater.id), Math.floor(Math.random() * 3) + 3);

      for (const ratedUser of usersToRate) {
        const ratedProfile = createdProfiles.find(p => p.user_id === ratedUser.id);
        const ratedPhotos = allPhotos.filter(p => p.profile_id === ratedProfile.id);
        const ratedPrompts = allPrompts.filter(p => p.profile_id === ratedProfile.id);

        // Find a test for the rated user
        const ratedUserTest = allTests.find(t => t.user_id === ratedUser.id);
        if (!ratedUserTest) continue;

        // Rate 2-4 photos
        const photosToRate = getRandomItems(ratedPhotos, Math.min(ratedPhotos.length, Math.floor(Math.random() * 3) + 2));
        for (const photo of photosToRate) {
          const rating = getRandomRating();
          await Rating.create({
            test_id: ratedUserTest.id,
            rater_id: rater.id,
            item_type: 'photo' as const,
            item_id: photo.id,
            rating_value: rating,
            feedback: getRandomFeedback(rating),
            is_anonymous: Math.random() > 0.7 // 30% anonymous
          });
        }

        // Rate 1-3 prompts
        const promptsToRate = getRandomItems(ratedPrompts, Math.min(ratedPrompts.length, Math.floor(Math.random() * 3) + 1));
        for (const prompt of promptsToRate) {
          const rating = getRandomRating();
          await Rating.create({
            test_id: ratedUserTest.id,
            rater_id: rater.id,
            item_type: 'prompt' as const,
            item_id: prompt.id,
            rating_value: rating,
            feedback: getRandomFeedback(rating),
            is_anonymous: Math.random() > 0.7 // 30% anonymous
          });
        }
      }

      console.log(`Created ratings from ${rater.first_name} for ${usersToRate.length} other users`);
    }

    // Create credit transactions for each user
    for (const user of createdUsers) {
      const initialCredits = Math.floor(Math.random() * 50) + 50; // 50-100 credits
      
      await CreditTransaction.create({
        user_id: user.id,
        amount: initialCredits,
        type: 'purchase',
        description: 'Initial credit purchase'
      });

      // Deduct credits for tests
      const userTests = allTests.filter(t => t.user_id === user.id);
      for (const test of userTests) {
        await CreditTransaction.create({
          user_id: user.id,
          amount: -test.cost,
          type: 'test',
          description: `${test.type} test`,
          reference_id: test.id
        });
      }
    }

    console.log('Created credit transactions');

    console.log('\n=== MOCK DATA CREATION COMPLETE ===');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${allPhotos.length} photos`);
    console.log(`Created ${allPrompts.length} prompts`);
    console.log(`Created ${allTests.length} tests`);
    
    const totalRatings = await Rating.count();
    console.log(`Created ${totalRatings} ratings`);

  } catch (error) {
    console.error('Error creating mock data:', error);
  } finally {
    await sequelize.close();
  }
};

createMockData(); 