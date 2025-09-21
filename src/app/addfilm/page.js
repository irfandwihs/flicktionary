"use client"; // This tells Next.js to treat this component as a Client Component

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams

function AddMovieComponent() {
  const [movieId, setMovieId] = useState(null); // State to hold movie ID (for editing)
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");
  const [genres, setGenres] = useState("");
  const [country, setCountry] = useState("");
  const [embed, setEmbed] = useState(""); // This will store only the video ID
  const [synopsis, setSynopsis] = useState("");
  const [duration, setDuration] = useState("");
  const [posterFile, setPosterFile] = useState(null); // Store the poster file to be uploaded
  const [posterURL, setPosterURL] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // New states for TMDB integration
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const searchParams = useSearchParams(); // Use Next.js hook to read query params

  // TMDB API configuration
  const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNDA2YTNlNDUxZjc0NjEzM2QzMjk5NmUzMGVlYjk4NSIsIm5iZiI6MTUzMTUwNjc0Mi42ODUsInN1YiI6IjViNDhmMDM2YzNhMzY4NDUyZDAwZTdlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Y79gp5dxM4slMHKuJZZQii7qu6aSHtcDYM53L9r2GD8";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  // Prefill the form with data from query params (if editing)
  useEffect(() => {
    const movieIdParam = searchParams.get("id");
    const titleParam = searchParams.get("title");
    const yearParam = searchParams.get("year");
    const ratingParam = searchParams.get("rating");
    const genresParam = searchParams.get("genres");
    const countryParam = searchParams.get("country");
    const embedParam = searchParams.get("embed");
    const synopsisParam = searchParams.get("synopsis");
    const durationParam = searchParams.get("duration");
    const posterURLParam = searchParams.get("poster");

    // If there's a movie ID, switch to "Update" mode and prefill form
    if (movieIdParam) {
      setMovieId(movieIdParam); // Set the movie ID to enter update mode
      setTitle(titleParam || ""); // Prefill with existing values or default to an empty string
      setYear(yearParam || "");
      setRating(ratingParam || "");
      setGenres(genresParam || "");
      setCountry(countryParam || "");
      setEmbed(embedParam || "");
      setSynopsis(synopsisParam || "");
      setDuration(durationParam || "");
      setPosterURL(posterURLParam || "");
    }
  }, [searchParams]);

  // Search movies from TMDB
  const searchTMDBMovies = async (searchTitle) => {
    if (!searchTitle.trim()) return;

    setIsSearching(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(searchTitle)}`,
        {
          headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search movies');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching TMDB:', error);
      setErrorMessage('Failed to search movies. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Get detailed movie information from TMDB
  const getMovieDetails = async (tmdbId) => {
    try {
      const [movieResponse, creditsResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
          headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${TMDB_BASE_URL}/movie/${tmdbId}/credits`, {
          headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!movieResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to get movie details');
      }

      const movieData = await movieResponse.json();
      const creditsData = await creditsResponse.json();

      return { movieData, creditsData };
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw error;
    }
  };

  // Handle movie selection from search results
  const handleMovieSelect = async (movie) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { movieData, creditsData } = await getMovieDetails(movie.id);

      // Auto-populate form fields
      setTitle(movieData.title);
      setYear(movieData.release_date ? movieData.release_date.split('-')[0] : '');
      setRating(movieData.vote_average ? movieData.vote_average.toFixed(1) : '');
      
      // Format genres
      const genreNames = movieData.genres ? movieData.genres.map(g => g.name).join(', ') : '';
      setGenres(genreNames);
      
      // Get primary production country
      const primaryCountry = movieData.production_countries && movieData.production_countries.length > 0 
        ? movieData.production_countries[0].name 
        : '';
      setCountry(primaryCountry);
      
      setSynopsis(movieData.overview || '');
      
      // Format duration
      const durationMinutes = movieData.runtime;
      if (durationMinutes) {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        setDuration(`${hours}h ${minutes}m`);
      }
      
      // Set poster URL
      if (movieData.poster_path) {
        setPosterURL(`${TMDB_IMAGE_BASE_URL}${movieData.poster_path}`);
      }

      setSelectedMovie(movieData);
      setShowResults(false);
      
    } catch (error) {
      setErrorMessage('Failed to load movie details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle title input change with debounced search
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    
    // Clear previous results when typing
    if (value.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchTMDBMovies(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle poster file selection
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    setPosterFile(file); // Set the selected file
  };

  // Function to handle embed URL change
  const handleEmbedChange = (e) => {
    const value = e.target.value;
    setEmbed(value);
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !year ||
      !rating ||
      !genres ||
      !country ||
      !embed ||
      !synopsis ||
      !duration
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Create FormData for API request
      const formData = new FormData();
      formData.append('title', title);
      formData.append('year', year);
      formData.append('rating', rating);
      formData.append('genres', genres);
      formData.append('country', country);
      formData.append('embed', embed);
      formData.append('synopsis', synopsis);
      formData.append('duration', duration);
      
      // If using TMDB poster URL, we'll pass it as a regular field
      if (posterURL && !posterFile) {
        formData.append('posterURL', posterURL);
      }
      
      if (posterFile) {
        formData.append('poster', posterFile);
      }

      if (movieId) {
        // Update existing movie
        const response = await fetch(`/api/films/${movieId}`, {
          method: 'PUT',
          body: formData,
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update movie');
        }
        
        alert(result.message || "Movie updated successfully!");
      } else {
        // Add new movie
        const response = await fetch('/api/films', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to add movie');
        }
        
        alert(result.message || "Movie added successfully!");
      }

      // Clear the form and state after submission
      setTitle("");
      setYear("");
      setRating("");
      setGenres("");
      setCountry("");
      setEmbed("");
      setSynopsis("");
      setDuration("");
      setPosterFile(null); // Clear the file input
      setPosterURL("");
      setMovieId(null); // Reset movieId after update
      setSelectedMovie(null);
      setSearchResults([]);
      setShowResults(false);

      setErrorMessage("");
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || "Error adding/updating movie. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {movieId ? "Update Movie" : "Add Movie"}{" "}
        {/* Change title based on mode */}
      </h1>

      {/* TMDB Integration Notice */}
      <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">🎬 TMDB Auto-Population Active!</h2>
        <p className="text-blue-700">
          Just enter the movie title below and select from the search results. All other fields will be automatically filled from The Movie Database.
        </p>
      </div>

      {/* Movie Title Input with Search */}
      <div className="relative mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Movie Title *
        </label>
        <input
          type="text"
          placeholder="Enter movie title to search..."
          className={`border mb-2 p-3 w-full rounded-lg ${
            title ? "text-black" : "text-gray-400"
          } ${isSearching ? "border-blue-500" : "border-gray-300"}`}
          value={title}
          onChange={handleTitleChange}
        />
        
        {isSearching && (
          <div className="absolute right-3 top-10 text-blue-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {searchResults.slice(0, 10).map((movie) => (
              <div
                key={movie.id}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 flex items-center space-x-3"
                onClick={() => handleMovieSelect(movie)}
              >
                {movie.poster_path && (
                  <img
                    src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{movie.title}</h3>
                  <p className="text-sm text-gray-600">
                    {movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'} • 
                    Rating: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{movie.overview}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-populated fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
          <input
            type="text"
            placeholder="Year"
            className={`border p-3 w-full rounded-lg ${
              year ? "text-black bg-green-50" : "text-gray-400"
            }`}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            readOnly={selectedMovie}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
          <input
            type="text"
            placeholder="Rating"
            className={`border p-3 w-full rounded-lg ${
              rating ? "text-black bg-green-50" : "text-gray-400"
            }`}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Genres (comma-separated) *</label>
        <input
          type="text"
          placeholder="Genres (comma-separated)"
          className={`border p-3 w-full rounded-lg ${
            genres ? "text-black bg-green-50" : "text-gray-400"
          }`}
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
        <input
          type="text"
          placeholder="Country"
          className={`border p-3 w-full rounded-lg ${
            country ? "text-black bg-green-50" : "text-gray-400"
          }`}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
        <input
          type="text"
          placeholder="Duration (e.g., 2h 30m)"
          className={`border p-3 w-full rounded-lg ${
            duration ? "text-black bg-green-50" : "text-gray-400"
          }`}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Synopsis *</label>
        <textarea
          placeholder="Synopsis"
          rows="4"
          className={`border p-3 w-full rounded-lg ${
            synopsis ? "text-black bg-green-50" : "text-gray-400"
          }`}
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
        />
      </div>

      {/* Embed URL - still manual */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Embed URL *</label>
        <input
          type="text"
          placeholder="YouTube embed URL or video ID"
          className={`border p-3 w-full rounded-lg ${
            embed ? "text-black" : "text-gray-400"
          }`}
          value={embed}
          onChange={handleEmbedChange}
        />
      </div>

      {/* Poster section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Movie Poster</label>
        
        {posterURL && (
          <div className="mb-4">
            <img src={posterURL} alt="Movie Poster" className="w-32 h-48 object-cover rounded-lg shadow-md" />
            <p className="text-sm text-green-600 mt-2">✅ Poster loaded from TMDB</p>
          </div>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          onChange={handlePosterChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">Upload a custom poster or use the one from TMDB</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          isLoading 
            ? "bg-gray-400 cursor-not-allowed" 
            : movieId 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isLoading 
          ? "Processing..." 
          : movieId 
            ? "Update Movie" 
            : "Add Movie"
        }
      </button>
      
      {/* TMDB Integration Status */}
      <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
        <p className="text-green-700 text-sm">
          🎬 TMDB Integration Active - Movie data will be automatically populated from The Movie Database
        </p>
      </div>
    </div>
  );
}

// Wrap the main component in Suspense for Next.js
export default function AddMoviePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddMovieComponent />
    </Suspense>
  );
}