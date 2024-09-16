"use client"; // This tells Next.js to treat this component as a Client Component

import { useState, useEffect } from "react";
import {
  ref,
  push,
  query,
  orderByChild,
  equalTo,
  get,
  update,
} from "firebase/database"; // Firebase RTDB imports
import { database } from "../firebase"; // Firebase config path

export default function AddMovie() {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");
  const [genres, setGenres] = useState("");
  const [country, setCountry] = useState("");
  const [embed, setEmbed] = useState(""); // This will store only the video ID
  const [synopsis, setSynopsis] = useState("");
  const [duration, setDuration] = useState("");
  const [posterURL, setPosterURL] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Function to handle embed URL change
  const handleEmbedChange = (e) => {
    const value = e.target.value;
    setEmbed(value);
  };

  useEffect(() => {
    if (title && year) {
      const posterQuery = query(
        ref(database, "films"),
        orderByChild("title"),
        equalTo(title)
      );
      get(posterQuery).then((snapshot) => {
        snapshot.forEach((child) => {
          if (child.val().year === year) {
            setPosterURL(child.val().poster);
          }
        });
      });
    }
  }, [title, year]);

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
      // Prepare movie data
      const movieData = {
        title,
        year,
        rating,
        genres: genres.split(",").map((genre) => genre.trim()), // Convert comma-separated genres into an array
        country,
        embed: `https://www.youtube.com/embed/${embed}`, // Prepend the YouTube embed base URL
        synopsis,
        duration,
        poster: posterURL,
      };

      // Check if a movie with the same title and year already exists
      const movieQuery = query(
        ref(database, "films"),
        orderByChild("title"),
        equalTo(title)
      );
      const snapshot = await get(movieQuery);
      let movieExists = false;
      let movieId = null;

      snapshot.forEach((child) => {
        if (child.val().year === year) {
          movieExists = true;
          movieId = child.key; // Get the key of the existing movie
        }
      });

      const moviesRef = ref(database, "films");

      if (movieExists && movieId) {
        // Update existing movie data
        const movieRef = ref(database, `films/${movieId}`);
        await update(movieRef, movieData);
        alert("Movie updated successfully!");
      } else {
        // Add a new movie
        await push(moviesRef, movieData);
        alert("Movie added successfully!");
      }

      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Error adding/updating movie. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Add Movie</h1>

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

      {posterURL && <img src={posterURL} alt="Movie Poster" className="my-4" />}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Add Movie
      </button>
    </div>
  );
}
