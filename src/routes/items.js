const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/items - Fetch all items
router.get("/", async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET /api/items/:itemId - Fetch a specific item
router.get("/:itemId", async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(itemId) },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// GET /api/items/:itemId/reviews - Fetch reviews for a specific item
router.get("/:itemId/reviews", async (req, res) => {
  const { itemId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { itemId: Number(itemId) },
      include: { user: true }, // To include user data with reviews
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// GET /api/items/:itemId/reviews/:reviewId - Fetch a specific review for an item
router.get("/:itemId/reviews/:reviewId", async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await prisma.review.findUnique({
      where: { id: Number(reviewId) },
      include: { user: true },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

// POST /api/items/:itemId/reviews - Add a review to an item (authentication required)
router.post("/:itemId/reviews", authenticate, async (req, res) => {
  const { itemId } = req.params;
  const { content, rating } = req.body; // Expect content and rating in the body

  if (!content || !rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newReview = await prisma.review.create({
      data: {
        content,
        rating,
        userId: req.userId, // Use the authenticated user's ID
        itemId: Number(itemId),
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: "Failed to create review" });
  }
});

// PUT /api/users/:userId/reviews/:reviewId - Update a review (authentication required)
router.put("/:userId/reviews/:reviewId", authenticate, async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating } = req.body;

  try {
    const review = await prisma.review.findUnique({
      where: { id: Number(reviewId) },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to update this review" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: Number(reviewId) },
      data: { content, rating },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: "Failed to update review" });
  }
});

// DELETE /api/users/:userId/reviews/:reviewId - Delete a review (authentication required)
router.delete("/:userId/reviews/:reviewId", authenticate, async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await prisma.review.findUnique({
      where: { id: Number(reviewId) },
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to delete this review" });
    }

    await prisma.review.delete({
      where: { id: Number(reviewId) },
    });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// POST /api/items/:itemId/reviews/:reviewId/comments - Add a comment to a review (authentication required)
router.post("/:itemId/reviews/:reviewId/comments", authenticate, async (req, res) => {
  const { reviewId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        reviewId: Number(reviewId),
        userId: req.userId, // Use the authenticated user's ID
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// PUT /api/users/:userId/comments/:commentId - Update a comment (authentication required)
router.put("/:userId/comments/:commentId", authenticate, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to update this comment" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { content },
    });

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// DELETE /api/users/:userId/comments/:commentId - Delete a comment (authentication required)
router.delete("/:userId/comments/:commentId", authenticate, async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

module.exports = router;