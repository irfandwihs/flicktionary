"use client";
import { useState, useEffect } from "react";
import { ref, get, query, limitToLast, onValue } from "firebase/database";
import { database } from "../firebase"; // Adjust the path to your Firebase config
import { useRouter } from "next/navigation";
import { FaStar, FaCalendarAlt, FaArrowUp } from "react-icons/fa";

// Carousel Banner Component
function CarouselBanner() {
  const [movies, setMovies] = useState([]);
  const [currentDisplay, setCurrentDisplay] = useState({
    currentSetIndex: 0,
    currentPosterIndex: 0,
  }); // Track both set and poster index in a single state object

  // Fetch movies from Firebase
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesRef = query(ref(database, "films"), limitToLast(6)); // Fetch the last 6 movies
        const snapshot = await get(moviesRef);
        if (snapshot.exists()) {
          const moviesArray = [];
          snapshot.forEach((childSnapshot) => {
            const movieData = childSnapshot.val();
            moviesArray.unshift({
              id: childSnapshot.key,
              title: movieData.title,
              description: movieData.description,
              poster: movieData.poster,
              uploadedAt: movieData.uploadedAt,
            });
          });
          setMovies(moviesArray);
          /* console.log("Movies fetched:", moviesArray); */ // Debug: Log fetched movies
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  // Rotate posters every 10 seconds and switch sets after 3 posters
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDisplay((prevState) => {
        const { currentPosterIndex, currentSetIndex } = prevState;
        const nextPosterIndex = currentPosterIndex + 1;

        if (nextPosterIndex < 3) {
          // Still within the same set, just increment poster index
          return { ...prevState, currentPosterIndex: nextPosterIndex };
        } else {
          // After showing all 3 posters, reset poster index and switch to the next set
          const nextSetIndex = (currentSetIndex + 1) % 2; // Toggle between 0 (Set 1) and 1 (Set 2)
          /* console.log(`Switching to Set: ${nextSetIndex}`); */ // Debug: Log set switching
          return { currentSetIndex: nextSetIndex, currentPosterIndex: 0 }; // Reset poster index and switch set
        }
      });
    }, 10000); // Change poster every 10 seconds

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [movies]);

  // Show loading state if no movies are available
  if (movies.length === 0) {
    return <div className="text-white text-center">Loading...</div>;
  }

  // Split movies into two sets of 3
  const firstSet = movies.slice(0, 3); // First 3 movies (Set 1)
  const secondSet = movies.slice(3, 6); // Next 3 movies (Set 2)

  // Debug: Log to check grouping of movies
  /* console.log("First set:", firstSet);
  console.log("Second set:", secondSet); */

  // Defensive: Ensure enough movies for both sets
  if (secondSet.length < 3) {
    console.error("Not enough movies in the database for the second set.");
  }

  // Get the current set of movies to display
  const { currentSetIndex, currentPosterIndex } = currentDisplay;
  const currentSet = currentSetIndex === 0 ? firstSet : secondSet;
  const displayedMovie = currentSet[currentPosterIndex];

  // Debug: Log current set and poster being displayed
  /* console.log(`Displaying Set: ${currentSetIndex}, Poster Index: ${currentPosterIndex}`);
    console.log("Current movie:", displayedMovie); */

  // Defensive: Ensure a valid movie is available
  if (!displayedMovie || !displayedMovie.poster) {
    return (
      <div className="text-white text-center">
        No valid movie poster available.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[50vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${displayedMovie.poster})` }}
      ></div>

      {/* Poster Image Overlays */}
      <div className="absolute top-36 right-8 flex space-x-8">
        {currentSet.map((movie, index) => (
          <div key={movie.id} className="w-40 h-60 relative">
            {/* Poster Image */}
            <img
              src={movie.poster}
              alt={movie.title}
              className={`w-full h-full object-cover shadow-lg rounded-lg transition-transform duration-1000 ${
                index === currentPosterIndex ? "scale-110" : "opacity-50"
              }`}
            />

            {/* Movie Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 rounded-b-lg">
              <p className="text-white text-center text-sm font-bold truncate">
                {movie.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Movie Details and Synopsis Overlay */}
      {displayedMovie && (
        <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 p-4">
          <h1 className="text-white text-4xl font-bold mb-2">
            {displayedMovie.title}
          </h1>
          <p className="text-gray-300 text-lg">{displayedMovie.description}</p>
        </div>
      )}
    </div>
  );
}

// Movie List Component
export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("All Genres");
  const [country, setCountry] = useState("All Countries");
  const [year, setYear] = useState("All Years");
  const [yearCounts, setYearCounts] = useState({});
  const [countryCounts, setCountryCounts] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const router = useRouter();

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const moviesRef = ref(database, "films");
    onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const moviesArray = Object.values(data);
        setMovies(moviesArray);

        const yearCountMap = {};
        const countryCountMap = {};
        moviesArray.forEach((movie) => {
          const movieYear = movie.year;
          const movieCountry = movie.country;

          // Count by year
          if (yearCountMap[movieYear]) {
            yearCountMap[movieYear] += 1;
          } else {
            yearCountMap[movieYear] = 1;
          }

          // Count by country
          if (countryCountMap[movieCountry]) {
            countryCountMap[movieCountry] += 1;
          } else {
            countryCountMap[movieCountry] = 1;
          }
        });
        setYearCounts(yearCountMap);
        setCountryCounts(countryCountMap);
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

  const handleDetails = (title) => {
    router.push(`/movies/${encodeURIComponent(title)}`);
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      {/* Header and Banner */}
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

      {/* Carousel Banner */}
      <CarouselBanner />

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
          <option>Ghibli</option>
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

        {/* Dynamic Country Filter with Movie Count */}
        <select
          className="p-2 bg-gray-800 text-gray-300 rounded"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="All Countries">All Countries</option>
          {Object.keys(countryCounts)
            .sort()
            .map((country) => (
              <option key={country} value={country}>
                {country} ({countryCounts[country]})
              </option>
            ))}
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

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}
