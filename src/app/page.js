"use client"; // This tells Next.js to treat this component as a Client Component
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database"; // Firebase imports
import { database } from "./firebase"; // Adjust path as needed
import { useRouter } from "next/navigation"; // For navigation in Next.js

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [latestMovie, setLatestMovie] = useState(null); // For the banner section
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("All Genres");
  const [country, setCountry] = useState("All Countries");
  const [year, setYear] = useState("All Years");

  const router = useRouter();

  // Fetching data from Firebase
  useEffect(() => {
    const moviesRef = ref(database, "films");
    onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const moviesArray = Object.values(data);
        setMovies(moviesArray);

        // Sort movies by UploadedAt and get the latest one for the banner section
        const sortedMovies = moviesArray.sort(
          (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
        );
        setLatestMovie(sortedMovies[0]); // Set the latest movie for the banner
      }
    });
  }, []);

  // Filter movies based on user input
  const filteredMovies = movies
    .filter(
      (movie) =>
        (genre === "All Genres" || movie.genres.includes(genre)) &&
        (country === "All Countries" || movie.country === country) &&
        (year === "All Years" || movie.year === year) &&
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const yearDiff = b.year - a.year; // Sort by year (descending)
      if (yearDiff !== 0) return yearDiff;
      return a.title.localeCompare(b.title); // If years are the same, sort by title (ascending)
    });

  // Handle navigation to the movie detail page
  const handleDetails = (title) => {
    router.push(`/movies/${encodeURIComponent(title)}`); // Navigate to dynamic route
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center py-4">
        <div className="flex items-center">
          <img
            src="https://placehold.co/40x40"
            alt="Logo"
            className="h-10 w-10"
          />
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-300 hover:text-white">
            Special
          </a>
          <a href="#" className="text-gray-300 hover:text-white">
            Other
          </a>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search by title..."
            className="p-2 rounded bg-gray-800 text-gray-300 w-60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Search
          </button>
        </div>
      </nav>

      {/* Filters Section */}
      <div className="flex justify-center space-x-4 my-6">
        <select
          className="p-2 bg-gray-800 text-gray-300 rounded"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option>All Genres</option>
          <option>Action</option>
          <option>Comedy</option>
          <option>Drama</option>
        </select>
        <select
          className="p-2 bg-gray-800 text-gray-300 rounded"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option>All Countries</option>
          <option>USA</option>
          <option>Canada</option>
          <option>UK</option>
        </select>
        <select
          className="p-2 bg-gray-800 text-gray-300 rounded"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option>All Years</option>
          <option>2024</option>
          <option>2023</option>
        </select>
      </div>

      {/* Main Banner Section */}
      {/* {latestMovie && (
        <div className="relative mb-10">
          <img src={latestMovie.banner} alt="Banner" className="w-full rounded-lg" />
          <div className="absolute inset-0 bg-black bg-opacity-40 p-6 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">{`"${latestMovie.title}"`}</h2>
            <p className="text-gray-300 mb-4">{latestMovie.description}</p>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded"
              onClick={() => handleDetails(latestMovie.title)}
            >
              Details
            </button>
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-4">
            {filteredMovies.slice(0, 3).map((movie, index) => (
              <img
                key={index}
                src={movie.poster}
                alt={`Movie ${index}`}
                className="rounded-lg shadow-lg"
              />
            ))}
          </div>
        </div>
      )} */}

      {/* Movie Listings Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-lg">
              <img
                src={movie.poster}
                alt={movie.title}
                className="rounded-t-lg"
              />
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{movie.year}</span>
                  <span className="text-gray-400">{movie.rating}</span>
                </div>
                <h3 className="text-lg font-bold">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.genres}</p>
                <button
                  className="bg-blue-600 text-white mt-4 px-4 py-2 rounded w-full"
                  onClick={() => handleDetails(movie.title)}
                >
                  Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white">No movies available</p>
        )}
      </div>
    </div>
  );
}
