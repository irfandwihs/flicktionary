"use client";
import { useState, useEffect } from "react";
import { ref, get, query, limitToLast, onValue } from "firebase/database";
import { database } from "./firebase"; // Adjust the path to your Firebase config
import { useRouter } from "next/navigation";
import {
  FaStar,
  FaCalendarAlt,
  FaArrowUp,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import "swiper/css"; // Import Swiper base styles
import "swiper/css/navigation"; // Import navigation module styles
import "swiper/css/pagination"; // Import pagination module styles
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper React components
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // Import Swiper modules including Autoplay

function CarouselBanner() {
  const [movies, setMovies] = useState([]);
  const router = useRouter();

  // Fetch movies from Firebase in real time
  useEffect(() => {
    const moviesRef = ref(database, "films");

    const unsubscribe = onValue(moviesRef, (snapshot) => {
      if (snapshot.exists()) {
        const moviesArray = [];
        snapshot.forEach((childSnapshot) => {
          const movieData = childSnapshot.val();
          moviesArray.unshift({
            id: childSnapshot.key,
            title: movieData.title,
            rating: movieData.rating,
            year: movieData.year,
            poster: movieData.poster,
          });
        });
        // Limit to the latest 12 movies
        setMovies(moviesArray.slice(0, 12));
      }
    });

    return () => unsubscribe();
  }, []);

  // Unlock autoplay on mobile after user interaction
  useEffect(() => {
    const enableAutoplay = () => {
      const swiperInstance = document.querySelector(".swiper")?.swiper;
      if (swiperInstance && swiperInstance.autoplay) {
        swiperInstance.autoplay.start();
      }
    };

    enableAutoplay();

    return () => {};
  }, []);

  const handleDetailsClick = (title) => {
    router.push(`/movies/${encodeURIComponent(title)}`);
  };

  return (
    <div className="relative w-full h-auto">
      <p className="text-white text-center font-semibold truncate mb-4">
        Last Added Movie Title
      </p>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={10}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: {
            slidesPerView: 2, // Show 2 slides on small screens (e.g., smartphones)
            spaceBetween: 8,
          },
          480: {
            slidesPerView: 3, // Show 3 slides on slightly larger screens
            spaceBetween: 8,
          },
          640: {
            slidesPerView: 4, // Show 4 slides on medium screens
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 5, // Show 5 slides on tablets
            spaceBetween: 12,
          },
          1024: {
            slidesPerView: 6, // Show 6 slides on larger screens
            spaceBetween: 15,
          },
        }}
        className="relative z-0"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="relative group h-[220px] w-[140px] sm:h-[280px] sm:w-[180px]">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 rounded-b-lg z-10">
                <p className="text-white text-center font-semibold truncate">
                  {movie.title} ({movie.year})
                </p>
                <button
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded text-xs z-20 relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDetailsClick(movie.title);
                  }}
                >
                  Details
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded z-20">
                <span className="flex items-center">
                  <FaStar className="mr-1" /> {movie.rating}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
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
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header and Search Bar */}
      <nav className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4">
        <div className="flex items-center justify-center sm:justify-start">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/movie-fa458.appspot.com/o/posters%2Flogo1_11zon-removebg-preview-ezgif.com-jpg-to-webp-converter.webp?alt=media&token=baee99db-c025-4dcf-92ae-3e0378ef37be"
            alt="Logo"
            className="h-10 w-10"
          />
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg shadow-sm px-4 py-2 mx-2 mt-2">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by title..."
            className={`bg-transparent outline-none ml-2 flex-grow ${
              searchTerm ? "text-black" : "text-gray-700"
            }`} // Change text color based on searchTerm
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </nav>

      {/* Carousel Banner */}
      <CarouselBanner />

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 my-6">
        <select
          className="p-2 bg-gray-800 text-gray-300 rounded w-full sm:w-auto mb-4 sm:mb-0"
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
          <option>Doraemon</option>
          <option>Drama</option>
          <option>Fantasy</option>
          <option>Ghibli</option>
          <option>History</option>
          <option>Horror</option>
          <option>Marvel</option>
          <option>Music</option>
          <option>Musical</option>
          <option>Mystery</option>
          <option>Romance</option>
          <option>Sci-Fi</option>
          <option>Short</option>
          <option>Sport</option>
          <option>Thriller</option>
          <option>War</option>
          {/* Add more genres as needed */}
        </select>

        <select
          className="p-2 bg-gray-800 text-gray-300 rounded w-full sm:w-auto mb-4 sm:mb-0"
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
          className="p-2 bg-gray-800 text-gray-300 rounded w-full sm:w-auto"
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
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", // Responsive grid
        }}
      >
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie, index) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-2">
              {/* Movie Poster */}
              <img
                src={movie.poster}
                alt={movie.title}
                className="rounded-t-lg"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
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
          <p className="text-white text-center">No movies available</p>
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
