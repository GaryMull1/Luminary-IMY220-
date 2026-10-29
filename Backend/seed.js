import dotenv from 'dotenv';
dotenv.config();

import { connectDB, getDB } from './config/db.js';
import { ObjectId } from 'mongodb';

async function seed() {
  await connectDB();
  const db = getDB();

  console.log('Clearing existing data...');
  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('posts').deleteMany({}),
    db.collection('albums').deleteMany({}),
    db.collection('activity').deleteMany({}),
    db.collection('friendships').deleteMany({}),
    db.collection('friendRequests').deleteMany({}),
    db.collection('reports').deleteMany({}),
    db.collection('reportReasons').deleteMany({})
  ]);

  console.log('Inserting report reasons...');
  const reasonIds = [new ObjectId(), new ObjectId(), new ObjectId()];
  await db.collection('reportReasons').insertMany([
    { _id: reasonIds[0], text: 'Spam or misleading', createdAt: new Date() },
    { _id: reasonIds[1], text: 'Inappropriate content', createdAt: new Date() },
    { _id: reasonIds[2], text: 'Harassment', createdAt: new Date() }
  ]);

  console.log('Inserting 10 users...');
  
  // IDs for relationships
  const testUserId = new ObjectId();
  const aliceId = new ObjectId();
  const bobId = new ObjectId();
  const adminId = new ObjectId();
  const user5Id = new ObjectId();
  const user6Id = new ObjectId();
  const user7Id = new ObjectId();
  const user8Id = new ObjectId();
  const user9Id = new ObjectId();
  const user10Id = new ObjectId();

  await db.collection('users').insertMany([
    {
      _id: testUserId, email: 'test@test.com', password: 'test1234',
      name: 'Test User', username: 'testuser', bio: 'Testing account for IMY 220.',
      profileImage: 'https://picsum.photos/seed/testuser/150', isAdmin: false, createdAt: new Date()
    },
    {
      _id: aliceId, email: 'alice@example.com', password: 'alice1234',
      name: 'Alice Smith', username: 'alice', bio: 'Photography enthusiast.',
      profileImage: 'https://picsum.photos/seed/alice/150', isAdmin: false, createdAt: new Date()
    },
    {
      _id: bobId, email: 'bob@example.com', password: 'bob1234',
      name: 'Bob Jones', username: 'bob', bio: 'Travel and landscapes.',
      profileImage: 'https://picsum.photos/seed/bob/150', isAdmin: false, createdAt: new Date()
    },
    {
      _id: adminId, email: 'admin@test.com', password: 'admin1234',
      name: 'Site Admin', username: 'admin', bio: 'Administrator',
      profileImage: 'https://picsum.photos/seed/admin/150', isAdmin: true, createdAt: new Date()
    },
    {
      _id: user5Id, email: 'charlie@example.com', password: 'charlie123',
      name: 'Charlie Brown', username: 'charlie', bio: 'Just here for the memes.',
      profileImage: '', isAdmin: false, createdAt: new Date()
    },
    {
      _id: user6Id, email: 'diana@example.com', password: 'diana123',
      name: 'Diana Prince', username: 'diana', bio: 'Artist & Designer.',
      profileImage: '', isAdmin: false, createdAt: new Date()
    },
    {
      _id: user7Id, email: 'ethan@example.com', password: 'ethan123',
      name: 'Ethan Hunt', username: 'ethan', bio: 'Action movie fan.',
      profileImage: '', isAdmin: false, createdAt: new Date()
    },
    {
      _id: user8Id, email: 'fiona@example.com', password: 'fiona123',
      name: 'Fiona Gallagher', username: 'fiona', bio: 'Cooking up a storm.',
      profileImage: '', isAdmin: false, createdAt: new Date()
    },
    {
      _id: user9Id, email: 'george@example.com', password: 'george123',
      name: 'George Miller', username: 'george', bio: 'Gamer.',
      profileImage: '', isAdmin: false, createdAt: new Date()
    },
    {
      _id: user10Id, email: 'hannah@example.com', password: 'hannah123',
      name: 'Hannah Baker', username: 'hannah', bio: 'Music is life.',
      profileImage: '', isAdmin: false, createdAt: new Date()
    }
  ]);

  console.log('Inserting friendships (Test User is friends with Alice & Bob)...');
  await db.collection('friendships').insertMany([
    { from: testUserId, to: aliceId, status: 'accepted', createdAt: new Date() },
    { from: testUserId, to: bobId, status: 'accepted', createdAt: new Date() },
    { from: aliceId, to: bobId, status: 'accepted', createdAt: new Date() }
  ]);

  // Also add a pending friend request so Test User has a notification
  await db.collection('friendRequests').insertOne({
    from: user5Id, to: testUserId, status: 'pending', createdAt: new Date()
  });

  console.log('Inserting 10+ posts...');
  
  const postIds = Array.from({ length: 12 }).map(() => new ObjectId());
  const hiddenPostId = new ObjectId(); // Special post for reporting

  const posts = [
    {
      _id: postIds[0], owner: aliceId, image: 'https://picsum.photos/seed/sunset/800/600',
      description: 'Beautiful sunset today! #nature #sunset', hashtags: ['nature', 'sunset'],
      albums: [], comments: [{ _id: new ObjectId(), user: testUserId, text: 'Stunning shot!', createdAt: new Date(), likes: [] }],
      likes: [testUserId, bobId], createdAt: new Date(Date.now() - 1000 * 60 * 120), updatedAt: new Date()
    },
    {
      _id: postIds[1], owner: bobId, image: 'https://picsum.photos/seed/mountains/800/600',
      description: 'Hiking the Alps this weekend. #travel #mountains', hashtags: ['travel', 'mountains'],
      albums: [], comments: [], likes: [aliceId], createdAt: new Date(Date.now() - 1000 * 60 * 60), updatedAt: new Date()
    },
    {
      _id: postIds[2], owner: testUserId, image: 'https://picsum.photos/seed/workspace/800/600',
      description: 'My setup for the IMY 220 project. #coding #setup', hashtags: ['coding', 'setup'],
      albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 30), updatedAt: new Date()
    },
    // Posts from other users to fill the global feed and search
    { _id: postIds[3], owner: user5Id, image: 'https://picsum.photos/seed/city/800/600', description: 'City lights tonight #cityscape', hashtags: ['cityscape'], albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 180), updatedAt: new Date() },
    { _id: postIds[4], owner: user6Id, image: 'https://picsum.photos/seed/art/800/600', description: 'New digital painting #art #design', hashtags: ['art', 'design'], albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 240), updatedAt: new Date() },
    { _id: postIds[5], owner: user7Id, image: 'https://picsum.photos/seed/car/800/600', description: 'Dream car spotted #cars', hashtags: ['cars'], albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 300), updatedAt: new Date() },
    { _id: postIds[6], owner: user8Id, image: 'https://picsum.photos/seed/food/800/600', description: 'Homemade pasta #foodie', hashtags: ['foodie', 'cooking'], albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 360), updatedAt: new Date() },
    { _id: postIds[7], owner: user9Id, image: 'https://picsum.photos/seed/gaming/800/600', description: 'Late night gaming #gamer', hashtags: ['gamer'], albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 420), updatedAt: new Date() },
    { _id: postIds[8], owner: user10Id, image: 'https://picsum.photos/seed/music/800/600', description: 'Live concert #music', hashtags: ['music', 'live'], albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 480), updatedAt: new Date() },
    { _id: postIds[9], owner: aliceId, image: 'https://picsum.photos/seed/forest/800/600', description: 'Morning fog in the forest #nature', hashtags: ['nature', 'forest'], albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 540), updatedAt: new Date() },
    
    // THE HIDDEN POST (Reported 3 times)
    {
      _id: hiddenPostId, owner: bobId, image: 'https://picsum.photos/seed/reported/800/600',
      description: 'This post is going to be reported 3 times!', hashtags: ['test'],
      albums: [], comments: [], likes: [], createdAt: new Date(Date.now() - 1000 * 60 * 600), updatedAt: new Date()
    }
  ];

  await db.collection('posts').insertMany(posts);

  console.log('Inserting reports for the hidden post...');
  await db.collection('reports').insertMany([
    { post: hiddenPostId, reportedBy: aliceId, reason: reasonIds[0], createdAt: new Date() },
    { post: hiddenPostId, reportedBy: testUserId, reason: reasonIds[1], createdAt: new Date() },
    { post: hiddenPostId, reportedBy: user5Id, reason: reasonIds[2], createdAt: new Date() }
  ]);

  console.log('Inserting albums...');
  
  const album1Id = new ObjectId();
  const album2Id = new ObjectId();

  await db.collection('albums').insertMany([
    {
      _id: album1Id, owner: aliceId, name: 'Nature Collection',
      description: 'My best nature shots.', hashtags: ['nature', 'best'], posts: [postIds[0], postIds[9]],
      coverImage: 'https://picsum.photos/seed/sunset/800/600', createdAt: new Date(), updatedAt: new Date()
    },
    {
      _id: album2Id, owner: bobId, name: 'Travel Diaries',
      description: 'Places I have been.', hashtags: ['travel', 'adventure'], posts: [postIds[1]],
      coverImage: 'https://picsum.photos/seed/mountains/800/600', createdAt: new Date(), updatedAt: new Date()
    }
  ]);

  // Link posts to albums in the posts collection
  await db.collection('posts').updateMany(
    { _id: { $in: [postIds[0], postIds[9]] } },
    { $set: { albums: [album1Id] } }
  );
  await db.collection('posts').updateOne(
    { _id: postIds[1] },
    { $set: { albums: [album2Id] } }
  );

  console.log('Inserting activity feed...');
  
  const activities = [
    // Friends' Posts
    { user: aliceId, type: 'post_created', post: postIds[0], album: null, createdAt: posts[0].createdAt },
    { user: bobId, type: 'post_created', post: postIds[1], album: null, createdAt: posts[1].createdAt },
    // My Post
    { user: testUserId, type: 'post_created', post: postIds[2], album: null, createdAt: posts[2].createdAt },
    // Hidden Post
    { user: bobId, type: 'post_created', post: hiddenPostId, album: null, createdAt: posts[10].createdAt },
    // Albums
    { user: aliceId, type: 'album_created', album: album1Id, post: null, createdAt: new Date() },
    { user: bobId, type: 'album_created', album: album2Id, post: null, createdAt: new Date() },
    // Global feed posts
    ...posts.slice(3, 10).map(p => ({
      user: p.owner, type: 'post_created', post: p._id, album: null, createdAt: p.createdAt
    }))
  ];

  await db.collection('activity').insertMany(activities);

  console.log('\nSeed complete!');
  console.log('====================================');
  console.log('  LOGIN CREDENTIALS:');
  console.log('  User:  test@test.com / test1234');
  console.log('  Admin: admin@test.com / admin1234');
  console.log('  Other: alice@example.com / alice1234');
  console.log('====================================');
  console.log('Test the rubric points:');
  console.log('1. Log in as test@test.com.');
  console.log('2. Home Feed -> Shows Alice & Bob\'s posts + Albums.');
  console.log('3. Home Feed -> Scroll down to see the "Hidden post" with a link.');
  console.log('4. Nav Search -> Type "nature" or "alice" to test global search.');

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});