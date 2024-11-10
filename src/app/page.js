"use client";
import { useState, useEffect } from "react";
import { ref, get, query, limitToLast, onValue } from "firebase/database";
import { database } from "./firebase"; // Adjust the path to your Firebase config
import { useRouter } from "next/navigation";
import { FaStar, FaCalendarAlt, FaArrowUp } from "react-icons/fa";
import "swiper/css"; // Import Swiper base styles
import "swiper/css/navigation"; // Import navigation module styles
import "swiper/css/pagination"; // Import pagination module styles
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper React components
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // Import Swiper modules including Autoplay

function CarouselBanner() {
  const [movies, setMovies] = useState([]);
  const router = useRouter();

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
        setMovies(moviesArray);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Update Swiper on window resize
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        document.querySelector(".swiper").swiper.update();
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDetailsClick = (title) => {
    router.push(`/movies/${encodeURIComponent(title)}`);
  };

  return (
    <div className="relative w-full h-auto">
      <p className="text-white text-center font-semibold truncate">
        Last Added Movie Title
      </p>
      <br />
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={10}
        slidesPerView={2}
        loop={true}
        loopAdditionalSlides={5} // Add extra slides for looping
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 15,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 15,
          },
        }}
        className="relative z-0"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="relative group h-[280px] w-[180px]">
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
