import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

// ---- Users ----
router.get('/users', async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.json({ users });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.params.id);
    await db.collection('posts').deleteMany({ owner: userId });
    await db.collection('albums').deleteMany({ owner: userId });
    await db.collection('friendships').deleteMany({ $or: [{ from: userId }, { to: userId }] });
    await db.collection('friendRequests').deleteMany({ $or: [{ from: userId }, { to: userId }] });
    await db.collection('activity').deleteMany({ user: userId });
    await db.collection('reports').deleteMany({ reportedBy: userId });
    await db.collection('users').deleteOne({ _id: userId });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- Posts ----
router.get('/posts', async (req, res) => {
  try {
    const db = getDB();
    const posts = await db.collection('posts').find({}).toArray();

    // 👇 ADD THIS: Fetch the owners so the frontend knows who made the post
    const ownerIds = [...new Set(posts.map(p => p.owner.toString()))];
    const users = await db.collection('users')
      .find({ _id: { $in: ownerIds.map(id => new ObjectId(id)) } })
      .toArray();

    // 👇 Map the owner data into the post
    const postsWithOwners = posts.map(p => ({
      ...p,
      owner: users.find(u => u._id.toString() === p.owner.toString()) || { name: 'Unknown' }
    }));

    res.json({ posts: postsWithOwners });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/posts/:id', async (req, res) => {
  try {
    const db = getDB();
    const { description, hashtags } = req.body;
    const update = { updatedAt: new Date() };
    if (description !== undefined) update.description = description;
    if (hashtags !== undefined) update.hashtags = hashtags;
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    res.json({ message: 'Post updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- Albums ----
router.get('/albums', async (req, res) => {
  try {
    const db = getDB();
    const albums = await db.collection('albums').find({}).toArray();
    res.json({ albums });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/albums/:id', async (req, res) => {
  try {
    const db = getDB();
    const albumId = new ObjectId(req.params.id);
    await db.collection('posts').updateMany(
      { albums: albumId },
      { $pull: { albums: albumId } }
    );
    await db.collection('activity').deleteMany({ album: albumId });
    await db.collection('albums').deleteOne({ _id: albumId });
    res.json({ message: 'Album deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- Activity ----
router.get('/activity', async (req, res) => {
  try {
    const db = getDB();
    const activity = await db.collection('activity').find({}).sort({ createdAt: -1 }).toArray();
    res.json({ activity });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/activity/:id', async (req, res) => {
  try {
    const db = getDB();
    await db.collection('activity').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Activity deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- Reported Posts ----
router.get('/reported-posts', async (req, res) => {
  try {
    const db = getDB();
    const reports = await db.collection('reports').find({}).toArray();
    const postIds = [...new Set(reports.map(r => r.post.toString()))];

    const posts = await db.collection('posts')
      .find({ _id: { $in: postIds.map(id => new ObjectId(id)) } })
      .toArray();

    // Attach reports to each post
    const result = posts.map(p => ({
      ...p,
      reports: reports.filter(r => r.post.toString() === p._id.toString())
    }));

    res.json({ reportedPosts: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/admin/reported-posts/:postId 
router.delete('/reported-posts/:postId', async (req, res) => {
  try {
    const db = getDB();
    const postId = new ObjectId(req.params.postId);
    const { deletePost } = req.body;

    if (deletePost) {
      await db.collection('posts').deleteOne({ _id: postId });
      await db.collection('reports').deleteMany({ post: postId });
      await db.collection('activity').deleteMany({ post: postId });
      return res.json({ message: 'Post deleted' });
    } else {
      await db.collection('reports').deleteMany({ post: postId });
      return res.json({ message: 'Reports removed' });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---- Report Reasons ----
router.get('/reasons', async (req, res) => {
  try {
    const db = getDB();
    const reasons = await db.collection('reportReasons').find({}).toArray();
    res.json({ reasons });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/reasons', async (req, res) => {
  try {
    const db = getDB();
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });

    const existing = await db.collection('reportReasons').findOne({ text });
    if (existing) return res.status(400).json({ message: 'Reason already exists' });

    const result = await db.collection('reportReasons').insertOne({
      text,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Reason added', reason: { _id: result.insertedId, text } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/reasons/:id', async (req, res) => {
  try {
    const db = getDB();
    await db.collection('reportReasons').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Reason deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;