import pool from '../config/db';

interface Post {
  post_id: string;
  userId: string;
  content: string;
  postKey?: string;
  created_at: Date;
  updated_at: Date;
}

export const postService = {
  async createPost(userId: string, content: string, postKey?: string): Promise<Post> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO posts (user_id, content, postKey) VALUES ($1, $2, $3) RETURNING *'
        , [userId, content, postKey]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
};