"use client"; // This tells Next.js to treat this component as a Client Component

import { useState, useEffect, Suspense } from "react";
import { ref as dbRef, push, update } from "firebase/database"; // Firebase RTDB imports
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // Firebase Storage imports
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { database, storage } from "../firebase"; // Firebase config paths

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

    try {
      // Prepare movie data without the poster URL first
      const movieData = {
        title,
        year,
        rating,
        genres: genres.split(",").map((genre) => genre.trim()), // Convert comma-separated genres into an array
        country,
        embed: `https://www.youtube.com/embed/${embed}`, // Prepend the YouTube embed base URL
        synopsis,
        duration,
        // We'll set the poster later if we upload one
      };

      const moviesRef = dbRef(database, "films");

      if (posterFile) {
        // If a new poster is selected, upload it to Firebase Storage
        const posterStorageRef = storageRef(
          storage,
          `posters/${posterFile.name}`
        );
        await uploadBytes(posterStorageRef, posterFile);
        const downloadURL = await getDownloadURL(posterStorageRef);

        // Add the poster URL to movie data
        movieData.poster = downloadURL;
      } else if (posterURL) {
        // If no new poster is uploaded, retain the existing poster
        movieData.poster = posterURL;
      }

      if (movieId) {
        // If movieId exists, update the movie
        const movieRef = dbRef(database, `films/${movieId}`);
        await update(movieRef, movieData);
        alert("Movie updated successfully!");
      } else {
        // Add a new movie if no movieId
        await push(moviesRef, movieData);
        alert("Movie added successfully!");
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
      setErrorMessage("Error adding/updating movie. Please try again.");
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
        className="border mb-2 p-2 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Year"
        className="border mb-2 p-2 w-full"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      <input
        type="text"
        placeholder="Rating"
        className="border mb-2 p-2 w-full"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />

      <input
        type="text"
        placeholder="Genres (comma-separated)"
        className="border mb-2 p-2 w-full"
        value={genres}
        onChange={(e) => setGenres(e.target.value)}
      />

      <input
        type="text"
        placeholder="Country"
        className="border mb-2 p-2 w-full"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

      {/* Embed URL with dynamic input */}
      <div className="flex">
        <input
          type="text"
          placeholder="Embed"
          className="border mb-2 p-2 w-full"
          value={embed}
          onChange={handleEmbedChange}
        />
      </div>

      <textarea
        placeholder="Synopsis"
        className="border mb-2 p-2 w-full"
        value={synopsis}
        onChange={(e) => setSynopsis(e.target.value)}
      />

      <input
        type="text"
        placeholder="Duration"
        className="border mb-2 p-2 w-full"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />

      {/* Poster Upload */}
      <input type="file" accept="image/*" onChange={handlePosterChange} />
      {posterURL && <img src={posterURL} alt="Movie Poster" className="my-4" />}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <button
        onClick={handleSubmit}
        className={`${
          movieId ? "bg-green-500" : "bg-blue-500"
        } text-white py-2 px-4 rounded hover:${
          movieId ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        {movieId ? "Update Movie" : "Add Movie"} {/* Change button text */}
      </button>
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
