const Movie = require("../models/Movie");

// ─── @desc    Get all movies (with filters)
// ─── @route   GET /api/movies
// ─── @access  Public
const getAllMovies = async (req, res) => {
  try {
    const {
      category,
      genre,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // ── Build filter object dynamically ───────────────────────
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (genre)    filter.genre    = { $in: [genre] };

    // ── Text search on title and description ──────────────────
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // ── Pagination ────────────────────────────────────────────
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(filter);

    const movies = await Movie.find(filter)
      .sort({ createdAt: -1 })       // newest first
      .skip(skip)
      .limit(Number(limit))
      .populate("addedBy", "username email"); // show who added it

    res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count:      movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get All Movies Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching movies",
      error: error.message,
    });
  }
};

// ─── @desc    Get single movie by ID
// ─── @route   GET /api/movies/:id
// ─── @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate(
      "addedBy",
      "username email"
    );

    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error("Get Movie Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching movie",
      error: error.message,
    });
  }
};

// ─── @desc    Create / Add a new movie
// ─── @route   POST /api/movies
// ─── @access  Private (Admin only)
const createMovie = async (req, res) => {
  try {
    const {
      title,
      movieId,
      description,
      poster,
      trailer,
      releaseDate,
      genre,
      category,
      rating,
      language,
    } = req.body;

    // ── Validate required fields ───────────────────────────────
    if (!title || !movieId) {
      return res.status(400).json({
        success: false,
        message: "Title and movieId are required",
      });
    }

    // ── Check if movieId already exists ───────────────────────
    const exists = await Movie.findOne({ movieId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "A movie with this movieId already exists",
      });
    }

    // ── Create movie ───────────────────────────────────────────
    const movie = await Movie.create({
      title,
      movieId,
      description:  description  || "Description not available",
      poster:       poster        || "https://via.placeholder.com/300x450?text=No+Poster",
      trailer:      trailer       || null,
      releaseDate:  releaseDate   || null,
      genre:        genre         || [],
      category:     category      || "movie",
      rating:       rating        || 0,
      language:     language      || "en",
      source:       "admin",
      addedBy:      req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `"${title}" added successfully`,
      movie,
    });
  } catch (error) {
    console.error("Create Movie Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error creating movie",
      error: error.message,
    });
  }
};

// ─── @desc    Update a movie
// ─── @route   PUT /api/movies/:id
// ─── @access  Private (Admin only)
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // ── Update only fields that were sent ─────────────────────
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("Update Movie Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error updating movie",
      error: error.message,
    });
  }
};

// ─── @desc    Delete a movie (hard delete)
// ─── @route   DELETE /api/movies/:id
// ─── @access  Private (Admin only)
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `"${movie.title}" deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Movie Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error deleting movie",
      error: error.message,
    });
  }
};

// ─── @desc    Toggle movie active/inactive (soft delete)
// ─── @route   PATCH /api/movies/:id/toggle
// ─── @access  Private (Admin only)
const toggleMovieStatus = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    movie.isActive = !movie.isActive;
    await movie.save();

    res.status(200).json({
      success: true,
      message: `"${movie.title}" is now ${movie.isActive ? "active" : "inactive"}`,
      isActive: movie.isActive,
    });
  } catch (error) {
    console.error("Toggle Movie Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error toggling movie status",
      error: error.message,
    });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleMovieStatus,
};