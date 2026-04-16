import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

export const createPost = async (req: Request, res: Response) => {
  const { title, postContent } = req.body;
  const userId = req.user?.userId;

  if (!postContent) {
    return sendResponse(res, 400, false, 'Post content is required');
  }

  try {
    const post = await prisma.communityPost.create({
      data: {
        userId: userId!,
        title,
        postContent,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return sendResponse(res, 201, true, 'Community post created successfully', post);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while creating post');
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              name: true,
              role: true,
            },
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { postDate: 'desc' },
      }),
      prisma.communityPost.count(),
    ]);

    return sendResponse(res, 200, true, 'Community posts fetched successfully', {
      posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while fetching posts');
  }
};

export const addComment = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content, parentId } = req.body;
  const userId = req.user?.userId;

  if (!content) {
    return sendResponse(res, 400, false, 'Comment content is required');
  }

  try {
    // Check if post exists
    const post = await prisma.communityPost.findUnique({
      where: { id: postId as string },
    });

    if (!post) {
      return sendResponse(res, 404, false, 'Post not found');
    }

    const comment = await (prisma as any).comment.create({
      data: {
        content,
        userId: userId!,
        postId: postId as string,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return sendResponse(res, 201, true, 'Comment added successfully', comment);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while adding comment');
  }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const comments = await (prisma as any).comment.findMany({
      where: { 
        postId: postId as string,
        parentId: null // Get top-level comments
      },
      include: {
        user: {
          select: { name: true }
        },
        replies: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    return sendResponse(res, 200, true, 'Comments fetched successfully', comments);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, 'Server error while fetching comments');
  }
};
