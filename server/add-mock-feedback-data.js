const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('profile_feedback', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

async function addMockFeedbackData() {
  try {
    console.log('Adding mock feedback data...');

    // Get user ID 8 (Joey's user)
    const userId = 8;

    // Get the user's profile
    const [profileResults] = await sequelize.query(
      'SELECT id FROM profiles WHERE user_id = ?',
      { replacements: [userId] }
    );

    if (profileResults.length === 0) {
      console.log('No profile found for user 8');
      return;
    }

    const profileId = profileResults[0].id;
    console.log('Found profile ID:', profileId);

    // Get existing photos and prompts
    const [photos] = await sequelize.query(
      'SELECT id FROM photos WHERE profile_id = ?',
      { replacements: [profileId] }
    );

    const [prompts] = await sequelize.query(
      'SELECT id FROM prompts WHERE profile_id = ?',
      { replacements: [profileId] }
    );

    console.log('Found photos:', photos.length);
    console.log('Found prompts:', prompts.length);

    // Create some mock tests
    const [testResults] = await sequelize.query(`
      INSERT INTO tests (user_id, type, status, cost, started_at, created_at, updated_at)
      VALUES 
        (?, 'single_photo', 'complete', 5, NOW(), NOW(), NOW()),
        (?, 'single_prompt', 'complete', 5, NOW(), NOW(), NOW()),
        (?, 'full_profile', 'complete', 15, NOW(), NOW(), NOW())
      RETURNING id
    `, { replacements: [userId, userId, userId] });

    const testIds = testResults.map(r => r.id);
    console.log('Created test IDs:', testIds);

    // Add mock ratings for photos
    if (photos.length > 0) {
      const photoId = photos[0].id;
      console.log('Adding ratings for photo ID:', photoId);

      // Add various ratings for the photo
      await sequelize.query(`
        INSERT INTO ratings (test_id, rater_id, item_type, item_id, rating, feedback, is_anonymous, created_at)
        VALUES 
          (?, ?, 'photo', ?, 5, 'Great photo! Love the smile.', false, NOW()),
          (?, ?, 'photo', ?, 4, 'Nice photo, shows personality well.', false, NOW()),
          (?, ?, 'photo', ?, 5, 'Very attractive photo!', false, NOW()),
          (?, ?, 'photo', ?, 3, 'It''s okay, but could be better.', false, NOW()),
          (?, ?, 'photo', ?, 4, 'Good lighting and composition.', false, NOW()),
          (?, ?, 'photo', ?, 2, 'Not my type, sorry.', false, NOW()),
          (?, ?, 'photo', ?, 5, 'Absolutely love this photo!', false, NOW()),
          (?, ?, 'photo', ?, 4, 'Shows confidence and style.', false, NOW()),
          (?, ?, 'photo', ?, 3, 'Decent photo, nothing special.', false, NOW()),
          (?, ?, 'photo', ?, 1, 'Not appealing at all.', false, NOW())
      `, { 
        replacements: [
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId,
          testIds[0], userId, photoId
        ] 
      });
    }

    // Add mock ratings for prompts
    if (prompts.length > 0) {
      const promptId = prompts[0].id;
      console.log('Adding ratings for prompt ID:', promptId);

      // Add various ratings for the prompt
      await sequelize.query(`
        INSERT INTO ratings (test_id, rater_id, item_type, item_id, rating, feedback, is_anonymous, created_at)
        VALUES 
          (?, ?, 'prompt', ?, 4, 'Interesting answer, shows personality.', false, NOW()),
          (?, ?, 'prompt', ?, 5, 'Love this response! Very engaging.', false, NOW()),
          (?, ?, 'prompt', ?, 3, 'Okay answer, but could be more detailed.', false, NOW()),
          (?, ?, 'prompt', ?, 2, 'Too short and generic.', false, NOW()),
          (?, ?, 'prompt', ?, 4, 'Good sense of humor in the response.', false, NOW()),
          (?, ?, 'prompt', ?, 5, 'This makes me want to know more!', false, NOW()),
          (?, ?, 'prompt', ?, 3, 'Average response, nothing special.', false, NOW()),
          (?, ?, 'prompt', ?, 1, 'Boring and unoriginal.', false, NOW()),
          (?, ?, 'prompt', ?, 4, 'Shows creativity and thoughtfulness.', false, NOW()),
          (?, ?, 'prompt', ?, 5, 'Excellent answer! Very memorable.', false, NOW())
      `, { 
        replacements: [
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId,
          testIds[1], userId, promptId
        ] 
      });
    }

    // Add some additional mock users for ratings (so we have different raters)
    const [mockUsers] = await sequelize.query(`
      INSERT INTO users (email, first_name, last_name, password_hash, created_at, updated_at)
      VALUES 
        ('rater1@test.com', 'Alice', 'Johnson', 'dummy_hash', NOW(), NOW()),
        ('rater2@test.com', 'Bob', 'Smith', 'dummy_hash', NOW(), NOW()),
        ('rater3@test.com', 'Carol', 'Davis', 'dummy_hash', NOW(), NOW()),
        ('rater4@test.com', 'David', 'Wilson', 'dummy_hash', NOW(), NOW()),
        ('rater5@test.com', 'Eva', 'Brown', 'dummy_hash', NOW(), NOW())
      RETURNING id
    `, { replacements: [] });

    const mockUserIds = mockUsers.map(u => u.id);
    console.log('Created mock user IDs:', mockUserIds);

    // Add more diverse ratings with different users
    if (photos.length > 0) {
      const photoId = photos[0].id;
      await sequelize.query(`
        INSERT INTO ratings (test_id, rater_id, item_type, item_id, rating, feedback, is_anonymous, created_at)
        VALUES 
          (?, ?, 'photo', ?, 5, 'Stunning photo!', false, NOW()),
          (?, ?, 'photo', ?, 4, 'Very attractive!', false, NOW()),
          (?, ?, 'photo', ?, 3, 'Nice but could be better.', false, NOW()),
          (?, ?, 'photo', ?, 5, 'Love the energy in this photo!', false, NOW()),
          (?, ?, 'photo', ?, 2, 'Not really my style.', false, NOW())
      `, { 
        replacements: [
          testIds[2], mockUserIds[0], photoId,
          testIds[2], mockUserIds[1], photoId,
          testIds[2], mockUserIds[2], photoId,
          testIds[2], mockUserIds[3], photoId,
          testIds[2], mockUserIds[4], photoId
        ] 
      });
    }

    if (prompts.length > 0) {
      const promptId = prompts[0].id;
      await sequelize.query(`
        INSERT INTO ratings (test_id, rater_id, item_type, item_id, rating, feedback, is_anonymous, created_at)
        VALUES 
          (?, ?, 'prompt', ?, 4, 'Great sense of humor!', false, NOW()),
          (?, ?, 'prompt', ?, 5, 'This is exactly what I''m looking for!', false, NOW()),
          (?, ?, 'prompt', ?, 3, 'Interesting perspective.', false, NOW()),
          (?, ?, 'prompt', ?, 4, 'Shows intelligence and wit.', false, NOW()),
          (?, ?, 'prompt', ?, 1, 'Not impressed with this answer.', false, NOW())
      `, { 
        replacements: [
          testIds[2], mockUserIds[0], promptId,
          testIds[2], mockUserIds[1], promptId,
          testIds[2], mockUserIds[2], promptId,
          testIds[2], mockUserIds[3], promptId,
          testIds[2], mockUserIds[4], promptId
        ] 
      });
    }

    console.log('✅ Mock feedback data added successfully!');
    console.log('📊 Summary:');
    console.log(`   - Created ${testIds.length} tests`);
    console.log(`   - Added ratings for ${photos.length} photos`);
    console.log(`   - Added ratings for ${prompts.length} prompts`);
    console.log(`   - Created ${mockUserIds.length} mock raters`);

    // Show the rating distribution
    const [photoRatings] = await sequelize.query(`
      SELECT rating, COUNT(*) as count 
      FROM ratings 
      WHERE item_type = 'photo' AND item_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, { replacements: [photos[0]?.id] });

    const [promptRatings] = await sequelize.query(`
      SELECT rating, COUNT(*) as count 
      FROM ratings 
      WHERE item_type = 'prompt' AND item_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, { replacements: [prompts[0]?.id] });

    console.log('📈 Photo Rating Distribution:', photoRatings);
    console.log('📈 Prompt Rating Distribution:', promptRatings);

  } catch (error) {
    console.error('❌ Error adding mock data:', error);
  } finally {
    await sequelize.close();
  }
}

addMockFeedbackData(); 