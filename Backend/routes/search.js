import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/search?q=term&type=all|users|posts|albums&hashtag=tag
router.get('/', requireAuth, async (req, res) => {
    try {
        const db = getDB();
        const q = (req.query.q || '').trim();
        const type = req.query.type || 'all';
        const hashtag = (req.query.hashtag || '').trim().toLowerCase();

        // Nothing to search for
        if (!q && !hashtag) {
            return res.json({ users: [], posts: [], albums: [] });
        }

        const result = { users: [], posts: [], albums: [] };
        const rx = q ? new RegExp(escapeRegex(q), 'i') : null;

        // ---------- USERS ----------
        if (type === 'all' || type === 'users') {
            const userFilter = hashtag
                ? { $expr: false }
                : {
                    $or: [
                        { name: rx },
                        { username: rx },
                        { email: rx },
                    ],
                };

            if (!hashtag) {
                result.users = await db
                    .collection('users')
                    .find(userFilter, { projection: { password: 0 } })
                    .limit(20)
                    .toArray();
            }
        }

        // ---------- POSTS ----------
        if (type === 'all' || type === 'posts') {
            let postFilter = {};
            if (hashtag) {
                postFilter.hashtags = { $in: [hashtag] };
            } else if (rx) {
                postFilter = {
                    $or: [{ description: rx }, { hashtags: rx }],
                };
            }

            const posts = await db
                .collection('posts')
                .find(postFilter)
                .sort({ createdAt: -1 })
                .limit(30)
                .toArray();

            // Populate owners + like counts + report counts
            const ownerIds = [...new Set(posts.map((p) => p.owner.toString()))];
            const owners = await db
                .collection('users')
                .find(
                    { _id: { $in: ownerIds.map((id) => new ObjectId(id)) } },
                    { projection: { password: 0 } }
                )
                .toArray();

            const postIds = posts.map((p) => p._id);
            const reportsAgg = await db
                .collection('reports')
                .aggregate([
                    { $match: { post: { $in: postIds } } },
                    { $group: { _id: '$post', count: { $sum: 1 } } },
                ])
                .toArray();
            const reportMap = {};
            reportsAgg.forEach((r) => {
                reportMap[r._id.toString()] = r.count;
            });

            result.posts = posts.map((p) => {
                const owner = owners.find(
                    (u) => u._id.toString() === p.owner.toString()
                );
                const likes = p.likes || [];
                const reportCount = reportMap[p._id.toString()] || 0;
                return {
                    ...p,
                    owner,
                    likes: likes.length,
                    isLiked: likes.some(
                        (id) => id.toString() === req.user._id.toString()
                    ),
                    reportCount,
                    isHidden: reportCount > 2,
                };
            });
        }

        // ---------- ALBUMS ----------
        if (type === 'all' || type === 'albums') {
            let albumFilter = {};
            if (hashtag) {
                albumFilter.hashtags = { $in: [hashtag] };
            } else if (rx) {
                albumFilter = {
                    $or: [{ name: rx }, { description: rx }, { hashtags: rx }],
                };
            }

            const albums = await db
                .collection('albums')
                .find(albumFilter)
                .sort({ createdAt: -1 })
                .limit(20)
                .toArray();

            // Populate owner + cover image + post count
            const albumOwnerIds = [
                ...new Set(albums.map((a) => a.owner.toString())),
            ];
            const albumOwners = await db
                .collection('users')
                .find(
                    { _id: { $in: albumOwnerIds.map((id) => new ObjectId(id)) } },
                    { projection: { password: 0 } }
                )
                .toArray();

            const firstPostIds = albums
                .map((a) => a.posts?.[0])
                .filter(Boolean);
            const firstPosts = await db
                .collection('posts')
                .find({ _id: { $in: firstPostIds } })
                .toArray();

            result.albums = albums.map((a) => {
                const owner = albumOwners.find(
                    (u) => u._id.toString() === a.owner.toString()
                );
                let coverImage = a.coverImage;
                if (!coverImage && a.posts?.length) {
                    const fp = firstPosts.find(
                        (p) => p._id.toString() === a.posts[0].toString()
                    );
                    if (fp) coverImage = fp.image;
                }
                return {
                    ...a,
                    owner,
                    coverImage,
                    postCount: a.posts?.length || 0,
                };
            });
        }

        res.json(result);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ message: err.message });
    }
});

export default router;