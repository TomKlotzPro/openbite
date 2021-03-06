const Blog = require("../models/blog");
const Upvote = require("../models/upvote");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const AsyncLock = require("async-lock");
const lock = new AsyncLock();

exports.getBlogs = (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 0;
  const pageNum = parseInt(req.query.pageNum) || 1;
  const skips = pageSize * (pageNum - 1);
  const filters = req.query.filter || {};

  Blog.find({ status: "published", ...filters })
    .sort({ upvotes: -1 })
    .populate("author -_id -password -products -email -role")
    .skip(skips)
    .limit(pageSize)
    .exec(function(errors, publishedBlogs) {
      if (errors) {
        return res.status(422).send(errors);
      }
      Blog.countDocuments({ status: "published" }).then(count => {
        return res.json({
          blogs: publishedBlogs,
          count,
          pageCount: Math.ceil(count / pageSize)
        });
      });
    });
};

exports.getBlogBySlug = (req, res) => {
  const slug = req.params.slug;

  Blog.findOne({ slug: slug })
    .populate("author -_id -password -products -email -role")
    .exec(function(errors, foundBlog) {
      if (errors || foundBlog === null) {
        return res.status(422).send(errors);
      }

      return res.json(foundBlog);
    });
};

exports.getBlogById = (req, res) => {
  const blogId = req.params.id;

  Blog.findById(blogId, (errors, foundBlog) => {
    if (errors) {
      return res.status(422).send(errors);
    }

    return res.json(foundBlog);
  });
};

exports.getUserBlogs = (req, res) => {
  const user = req.user;

  Blog.find({ author: user.id }, function(errors, userBlogs) {
    if (errors) {
      return res.status(422).send(errors);
    }

    return res.json(userBlogs);
  });
};

exports.updateBlog = (req, res) => {
  const blogId = req.params.id;
  const blogData = req.body;

  Blog.findById(blogId, function(errors, foundBlog) {
    if (errors) {
      return res.status(422).send(errors);
    }

    if (blogData.status && blogData.status === "published" && !foundBlog.slug) {
      foundBlog.slug = slugify(foundBlog.title, {
        replacement: "-", // replace spaces with replacement
        remove: null, // regex to remove characters
        lower: true // result in lower case
      });
    }

    foundBlog.set(blogData);
    foundBlog.updatedAt = new Date();
    foundBlog.save(function(errors, foundBlog) {
      if (errors) {
        return res.status(422).send(errors);
      }

      return res.status(200).json(foundBlog);
    });
  });
};

exports.createBlog = (req, res) => {
  const lockId = req.query.lockId;

  if (!lock.isBusy(lockId)) {
    lock.acquire(
      lockId,
      function(done) {
        const blogData = req.body;
        const blog = new Blog(blogData);
        blog.author = req.user;

        blog.save((errors, createdBlog) => {
          setTimeout(() => done(), 5000);

          if (errors) {
            return res.status(422).send(errors);
          }
          return res.status(201).json(createdBlog);
        });
      },
      function(errors, ret) {
        errors && console.error(errors);
      }
    );
  } else {
    return res.status(422).send({ message: "Blog is getting saved!" });
  }
};

exports.createBlogComment = asyncHandler(async (req, res) => {
  const { blogID, comment } = req.body;
  const blog = await Blog.findById(blogID);
  if (blog) {
    const review = {
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      comment: comment,
      user: req.user._id
    };
    blog.comments.push(review);
    await blog.save((errors, savedBlog) => {
      if (errors) {
        return res.status(432).send(errors);
      }

      return res.status(201).json(savedBlog);
    });
  } else {
    res.status(404);
    throw new Error("The blog/article does not exist");
  }
});
exports.createBlogCommentReply = asyncHandler(async (req, res) => {
  const { blogID, comments } = req.body;
  const blog = await Blog.findById(blogID);
  if (blog) {
    blog.comments = comments;
    await blog.save((errors, savedBlog) => {
      if (errors) {
        return res.status(422).send(errors);
      }

      return res.status(201).json(savedBlog);
    });
  } else {
    res.status(404);
    throw new Error("The blog/article does not exist");
  }
});

exports.deleteBlog = (req, res) => {
  const blogId = req.params.id;

  Blog.deleteOne({ _id: blogId }, function(errors) {
    if (errors) {
      return res.status(422).send(errors);
    }

    res.json({ status: "deleted" });
  });
};

exports.updateBlogUpvotes = async function(req, res) {
  const blogId = req.params.id;
  const upvote = req.body;

  Blog.findById(blogId)
    .populate("category")
    .exec(async (errors, blog) => {
      if (errors) {
        return res.status(422).send(errors);
      }

      const blogUpvotes = await Promise.all(
        blog.upvotes.map(blogUpvote =>
          Upvote.findById(blogUpvote).then(data => data)
        )
      );

      let foundUpvoteIndex = blogUpvotes.findIndex(
        upvoteDB => upvoteDB?.author.toString() == upvote.author
      );

      if (foundUpvoteIndex !== -1) {
        Upvote.deleteOne({ _id: blog.upvotes[foundUpvoteIndex]._id }, function(
          errorsDeleteUpvote
        ) {
          if (errorsDeleteUpvote) {
            throw errorsDeleteUpvote;
          }
        });
        Upvote.deleteOne({ _id: upvote._id }, function(
          errorsDeleteSecondUpvote
        ) {
          if (errorsDeleteSecondUpvote) {
            throw errorsDeleteSecondUpvote;
          }
        });
        blog.upvotes.splice(foundUpvoteIndex, 1);
      } else {
        blog.upvotes.push(upvote);
      }

      blog.save((errorsSavingBlog, savedBlog) => {
        if (errorsSavingBlog) {
          return res.status(422).send(errorsSavingBlog);
        }

        return res.json(savedBlog);
      });
    });
};
