import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handleTrackShare(req, res);
      case 'GET':
        return await handleGetShareStats(req, res);
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Share tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleTrackShare(req, res) {
  const { postId, platform, userId = 'anonymous' } = req.body;

  if (!postId || !platform) {
    return res.status(400).json({ error: 'Post ID and platform are required' });
  }

  try {
    // Check if share already exists for this user and platform
    const existingShare = await sql`
      SELECT id FROM post_shares
      WHERE post_id = ${postId}
      AND platform = ${platform}
      AND user_id = ${userId}
    `;

    if (existingShare.length > 0) {
      return res.status(200).json({ message: 'Share already tracked' });
    }

    // Insert new share record
    const result = await sql`
      INSERT INTO post_shares (post_id, platform, user_id, shared_at)
      VALUES (${postId}, ${platform}, ${userId}, CURRENT_TIMESTAMP)
      RETURNING id, post_id, platform, user_id, shared_at
    `;

    // Update post share count
    await sql`
      UPDATE posts
      SET share_count = COALESCE(share_count, 0) + 1
      WHERE id = ${postId}
    `;

    // Update platform-specific share count in post metadata
    const updateResult = await sql`
      UPDATE posts
      SET share_platforms = jsonb_set(
        COALESCE(share_platforms, '{}'::jsonb),
        ARRAY[${platform}],
        COALESCE(share_platforms->>${platform}, '0')::int + 1
      )
      WHERE id = ${postId}
      RETURNING share_count, share_platforms
    `;

    res.status(201).json({
      share: result[0],
      shareCount: updateResult[0].share_count,
      platformShares: updateResult[0].share_platforms
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({ error: 'Failed to track share' });
  }
}

async function handleGetShareStats(req, res) {
  const { postId } = req.query;

  try {
    let query;
    if (postId) {
      // Get stats for specific post
      query = sql`
        SELECT
          platform,
          COUNT(*) as count
        FROM post_shares
        WHERE post_id = ${postId}
        GROUP BY platform
        ORDER BY count DESC
      `;
    } else {
      // Get overall share stats
      query = sql`
        SELECT
          platform,
          COUNT(*) as count,
          COUNT(DISTINCT post_id) as posts_count
        FROM post_shares
        GROUP BY platform
        ORDER BY count DESC
      `;
    }

    const stats = await query;

    res.status(200).json({
      stats,
      totalShares: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
      totalPosts: postId ? 1 : stats.reduce((sum, stat) => sum + parseInt(stat.posts_count), 0)
    });
  } catch (error) {
    console.error('Error getting share stats:', error);
    res.status(500).json({ error: 'Failed to get share statistics' });
  }
}
