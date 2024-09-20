"use client"; // This tells Next.js to treat this component as a Client Component
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database"; // Firebase imports
import { database } from "./firebase"; // Adjust path as needed
import { useRouter } from "next/navigation"; // For navigation in Next.js
import { FaStar, FaCalendarAlt, FaArrowUp } from "react-icons/fa"; // Import icons

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [latestMovie, setLatestMovie] = useState(null); // For the banner section
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("All Genres");
  const [country, setCountry] = useState("All Countries");
  const [year, setYear] = useState("All Years");
  const [yearCounts, setYearCounts] = useState({}); // Object to store the count of movies for each year
  const [isVisible, setIsVisible] = useState(false); // Track button visibility

  const router = useRouter();

  // Handle scroll event to show/hide the "Back to Top" button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Function to scroll back to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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

        // Count movies by year
        const yearCountMap = {};
        moviesArray.forEach((movie) => {
          const movieYear = movie.year;
          if (yearCountMap[movieYear]) {
            yearCountMap[movieYear] += 1;
          } else {
            yearCountMap[movieYear] = 1;
          }
        });
        setYearCounts(yearCountMap); // Set the counts in the state
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
          <option>Adventure</option>
          <option>Animation</option>
          <option>Biography</option>
          <option>Comedy</option>
          <option>Crime</option>
          <option>Documentary</option>
          <option>Drama</option>
          <option>Fantasy</option>
          <option>History</option>
          <option>Horror</option>
          <option>Music</option>
          <option>Musical</option>
          <option>Mystery</option>
          <option>Romance</option>
          <option>Sci-Fi</option>
          <option>Short</option>
          <option>Sport</option>
          <option>Thriller</option>
          <option>War</option>
          {/* Add more genres */}
        </select>

        {/* Dynamic Year Filter with Movie Count */}
        <select
          className="p-2 bg-gray-800 text-gray-300 rounded"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="All Years">All Years</option>
          {Object.keys(yearCounts)
            .sort((a, b) => b - a) // Sort years in descending order
            .map((year) => (
              <option key={year} value={year}>
                {year} ({yearCounts[year]})
              </option>
            ))}
        </select>

        <select
          className="p-2 bg-gray-800 text-gray-300 rounded"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option>All Countries</option>
          <option>Afrika</option>
          <option>Cina</option>
          <option>Denmark</option>
          <option>Filipina</option>
          <option>German</option>
          <option>India</option>
          <option>Indonesia</option>
          <option>Inggris</option>
          <option>Irlandia</option>
          <option>Islandia</option>
          <option>Italia</option>
          <option>Japan</option>
          <option>Kazakhstan</option>
          <option>Korea</option>
          <option>Mesir</option>
          <option>Mexico</option>
          <option>Perancis</option>
          <option>Polandia</option>
          <option>Rusia</option>
          <option>Spanyol</option>
          <option>Taiwan</option>
          <option>Thailand</option>
          <option>Tunisia</option>
          <option>Ukraina</option>
          <option>USA</option>
          <option>Vietnam</option>
          {/* Add more countries */}
        </select>
      </div>

      {/* Movie Listings Section */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", // Set smaller min size for mobile
        }}
      >
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg shadow-lg p-2"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Movie Poster */}
              <img
                src={movie.poster}
                alt={movie.title}
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                }}
                className="rounded-t-lg"
              />

              {/* Movie Details */}
              <div className="p-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {movie.year}
                  </span>
                  <span className="text-gray-400 flex items-center">
                    <FaStar className="mr-1" />
                    {movie.rating}
                  </span>
                </div>

                <h3 className="text-lg font-bold truncate" title={movie.title}>
                  {movie.title}
                </h3>

                <p className="text-sm text-gray-400 truncate">
                  {Array.isArray(movie.genres)
                    ? movie.genres.join(" / ")
                    : movie.genres}
                </p>

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

      {/* Back to Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out
                     md:bottom-8 md:right-8 md:p-4"
        >
          <FaArrowUp size={24} />
        </button>
      )}

      {/* Mobile View */}
      <style jsx>{`
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: repeat(
              2,
              1fr
            ); /* Ensure 2 columns on mobile */
            gap: 8px; /* Reduce gap for smaller screens */
          }
        }
      `}</style>
    </div>
  );
}
