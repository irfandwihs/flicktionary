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

  const searchParams = useSearchParams(); // Use Next.js hook to read query params

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

      setErrorMessage("");
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || "Error adding/updating movie. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        {movieId ? "Update Movie" : "Add Movie"}{" "}
        {/* Change title based on mode */}
      </h1>

      <input
        type="text"
        placeholder="Movie Title"
        className={`border mb-2 p-2 w-full ${
          title ? "text-black" : "text-gray-400"
        }`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Year"
        className={`border mb-2 p-2 w-full ${
          year ? "text-black" : "text-gray-400"
        }`}
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      <input
        type="text"
        placeholder="Rating"
        className={`border mb-2 p-2 w-full ${
          rating ? "text-black" : "text-gray-400"
        }`}
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />

      <input
        type="text"
        placeholder="Genres (comma-separated)"
        className={`border mb-2 p-2 w-full ${
          genres ? "text-black" : "text-gray-400"
        }`}
        value={genres}
        onChange={(e) => setGenres(e.target.value)}
      />

      <input
        type="text"
        placeholder="Country"
        className={`border mb-2 p-2 w-full ${
          country ? "text-black" : "text-gray-400"
        }`}
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

      {/* Embed URL with dynamic input */}
      <div className="flex">
        <input
          type="text"
          placeholder="Embed"
          className={`border mb-2 p-2 w-full ${
            embed ? "text-black" : "text-gray-400"
          }`}
          value={embed}
          onChange={handleEmbedChange}
        />
      </div>

      <textarea
        placeholder="Synopsis"
        className={`border mb-2 p-2 w-full ${
          synopsis ? "text-black" : "text-gray-400"
        }`}
        value={synopsis}
        onChange={(e) => setSynopsis(e.target.value)}
      />

      <input
        type="text"
        placeholder="Duration"
        className={`border mb-2 p-2 w-full ${
          duration ? "text-black" : "text-gray-400"
        }`}
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      {/* Poster Upload */}
      <input type="file" accept="image/*" onChange={handlePosterChange} />
      {posterURL && <img src={posterURL} alt="Movie Poster" className="my-4" />}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`${
          isLoading 
            ? "bg-gray-400 cursor-not-allowed" 
            : movieId 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-blue-500 hover:bg-blue-600"
        } text-white py-2 px-4 rounded transition-colors`}
      >
        {isLoading 
          ? "Processing..." 
          : movieId 
            ? "Update Movie" 
            : "Add Movie"
        }
      </button>
      
      {/* API Status Indicator */}
      <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700 text-sm">
          ✅ API Integration Active - Using Next.js API Routes for enhanced performance and security
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