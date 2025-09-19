import { state, action, batch, derived } from 'react-understate';

// ❌ Avoid: Nested relational data
export const badState = state({
  posts: [
    {
      id: 1,
      title: 'Post 1',
      author: { id: 1, name: 'John', email: 'john@example.com' },
      comments: [
        { id: 1, text: 'Great post!', author: { id: 2, name: 'Jane' } },
        { id: 2, text: 'Thanks!', author: { id: 1, name: 'John' } },
      ],
    },
  ],
});

// ✅ Good: Normalized state structure
export const users = state<Record<string, User>>({}, { name: 'users' });
export const posts = state<Record<string, Post>>({}, { name: 'posts' });
export const comments = state<Record<string, Comment>>(
  {},
  { name: 'comments' },
);

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  commentIds: string[];
};

export type Comment = {
  id: string;
  text: string;
  postId: string;
  authorId: string;
};

// Actions for normalized updates
export const addUser = action(
  (user: User) => {
    console.log('action: adding user', user.id);
    users(prev => ({ ...prev, [user.id]: user }));
  },
  { name: 'addUser' },
);

export const addPost = action(
  (post: Omit<Post, 'commentIds'>) => {
    console.log('action: adding post', post.id);
    posts(prev => ({
      ...prev,
      [post.id]: { ...post, commentIds: [] },
    }));
  },
  { name: 'addPost' },
);

export const addComment = action(
  (comment: Comment) => {
    console.log('action: adding comment', comment.id);

    batch(() => {
      // Add comment
      comments(prev => ({ ...prev, [comment.id]: comment }));

      // Update post's comment list
      posts(prev => ({
        ...prev,
        [comment.postId]: {
          ...prev[comment.postId],
          commentIds: [...prev[comment.postId].commentIds, comment.id],
        },
      }));
    });
  },
  { name: 'addComment' },
);

// Selectors for denormalized views
export const getPostWithAuthor = (postId: string) =>
  derived(
    () => {
      const post = posts()[postId];
      const author = post ? users()[post.authorId] : null;

      return post && author ? { ...post, author } : null;
    },
    { name: `postWithAuthor-${postId}` },
  );

export const getPostWithComments = (postId: string) =>
  derived(
    () => {
      const post = posts()[postId];
      if (!post) return null;

      const postComments = post.commentIds
        .map(id => {
          const comment = comments()[id];
          const author = comment ? users()[comment.authorId] : null;
          return comment && author ? { ...comment, author } : null;
        })
        .filter(Boolean) as Array<Comment & { author: User }>;

      return {
        ...post,
        author: users()[post.authorId],
        comments: postComments,
      };
    },
    { name: `postWithComments-${postId}` },
  );
