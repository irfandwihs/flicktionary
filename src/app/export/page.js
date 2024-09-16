"use client"; // Mark this as a Client Component
import { useState, useEffect } from "react";
import { ref, get, remove } from "firebase/database"; // Add "remove" to delete the data
import { database } from "../firebase"; // Adjust the path to your Firebase config
import { saveAs } from "file-saver";
import { parse } from "json2csv"; // CSV generator
import Link from "next/link"; // Import Link for navigation

export default function ExportMovies() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [films, setFilms] = useState([]);

  useEffect(() => {
    // Fetch the data from Firebase
    const fetchMovies = async () => {
      try {
        const snapshot = await get(ref(database, "films"));
        if (snapshot.exists()) {
          const moviesArray = [];
          snapshot.forEach((childSnapshot) => {
            const movieData = childSnapshot.val();
            moviesArray.push({
              id: childSnapshot.key, // The unique ID of each movie entry
              title: movieData.title,
              year: movieData.year,
              poster: movieData.poster,
              country: movieData.country,
              duration: movieData.duration,
              embed: movieData.embed,
              genres: Array.isArray(movieData.genres) ? movieData.genres : [], // Ensure genres is always an array
              rating: movieData.rating,
              synopsis: movieData.synopsis,
              uploadedAt: movieData.uploadedAt, // Fetch uploadedAt timestamp
            });
          });

          // Sort the movies by year (newest to oldest), then alphabetically by title (A to Z)
          moviesArray.sort((a, b) => {
            if (b.year === a.year) {
              // If years are the same, sort alphabetically by title
              return a.title.localeCompare(b.title);
            }
            // Otherwise, sort by year in descending order (newest to oldest)
            return b.year - a.year;
          });

          setFilms(moviesArray);
          setLoading(false);
        } else {
          setFilms([]);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const downloadCSV = () => {
    const csvData = films.map((film) => ({
      id: film.id,
      title: film.title,
      year: film.year,
      poster: film.poster,
      country: film.country,
      duration: film.duration,
      embed: film.embed,
      genres: Array.isArray(film.genres) ? film.genres.join(", ") : "N/A", // Handle genres safely
      rating: film.rating,
      synopsis: film.synopsis,
      uploadedAt: film.uploadedAt, // Include the uploadedAt timestamp in CSV
    }));

    try {
      const csv = parse(csvData); // Convert JSON to CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "movies.csv"); // Trigger download with FileSaver
    } catch (err) {
      console.error("Error generating CSV: ", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      try {
        const movieRef = ref(database, `films/${id}`);
        await remove(movieRef);
        alert("Movie deleted successfully!");
        // Update the state to remove the deleted movie
        setFilms((prevFilms) => prevFilms.filter((film) => film.id !== id));
      } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Download Movie Data</h1>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        onClick={downloadCSV}
      >
        Download CSV
      </button>
      <table className="table-auto w-full mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Year</th>
            <th className="px-4 py-2">Country</th>
            <th className="px-4 py-2">Duration</th>
            <th className="px-4 py-2">Embed</th>
            <th className="px-4 py-2">Genres</th>
            <th className="px-4 py-2">Rating</th>
            <th className="px-4 py-2">Synopsis</th>
            <th className="px-4 py-2">Uploaded At</th>{" "}
            {/* Change to Uploaded At */}
            <th className="px-4 py-2">Poster</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {films.map((film, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{film.id}</td>
              <td className="border px-4 py-2">{film.title}</td>
              <td className="border px-4 py-2">{film.year}</td>
              <td className="border px-4 py-2">{film.country}</td>
              <td className="border px-4 py-2">{film.duration}</td>
              <td className="border px-4 py-2">
                <a href={film.embed} target="_blank" rel="noopener noreferrer">
                  Link
                </a>
              </td>
              <td className="border px-4 py-2">
                {Array.isArray(film.genres) ? film.genres.join(", ") : "N/A"}
              </td>
              <td className="border px-4 py-2">{film.rating}</td>
              <td className="border px-4 py-2">{film.synopsis}</td>
              <td className="border px-4 py-2">{film.uploadedAt}</td>{" "}
              {/* Display uploadedAt timestamp */}
              <td className="border px-4 py-2">
                <img
                  src={film.poster}
                  alt={film.title}
                  className="w-20 h-20 object-cover"
                />
              </td>
              <td className="border px-4 py-2">
                <Link
                  href={`/addfilm?title=${encodeURIComponent(
                    film.title
                  )}&year=${film.year}`}
                >
                  <button className="bg-green-500 text-white py-1 px-2 rounded mr-2">
                    Edit
                  </button>
                </Link>
                <button
                  className="bg-red-500 text-white py-1 px-2 rounded"
                  onClick={() => handleDelete(film.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
