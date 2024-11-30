"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // useParams from App Router
import { ref, get } from "firebase/database";
import { database } from "../../firebase";

export default function MovieDetail() {
  const params = useParams(); // Get dynamic route params using App Router hook
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const title = decodeURIComponent(params.title); // Decode URL-encoded title

    if (!title) {
      setMovie(null);
      setLoading(false);
      return;
    }

    // Normalize the title to be searched (trim whitespace and lowercase)
    const normalizedTitle = title.trim().replace(/\s+/g, " ").toLowerCase();

    // Timeout to avoid infinite loading
    const timeoutId = setTimeout(() => {
      setError("Request timed out. Could not fetch the movie.");
      setLoading(false);
    }, 10000); // 10-second timeout

    const fetchMovie = async () => {
      try {
        const movieRef = ref(database, "films"); // Adjust the path to match your Firebase structure
        const snapshot = await get(movieRef);

        if (snapshot.exists()) {
          let foundMovie = null;
          snapshot.forEach((childSnapshot) => {
            const movieData = childSnapshot.val();
            const movieTitle = movieData.title
              .trim()
              .replace(/\s+/g, " ")
              .toLowerCase(); // Normalize movie title

            // Check if the movie title matches
            if (movieTitle === normalizedTitle) {
              foundMovie = movieData;
            }
          });

          if (foundMovie) {
            setMovie(foundMovie);
          } else {
            setError("Movie not found");
          }
        } else {
          setError("No movies available in the database");
        }
      } catch (fetchError) {
        setError("Error fetching data from Firebase.");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchMovie();

    // Cleanup the timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [params.title]); // Depend on params.title

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return (
    <div className="bg-[#0b1120] text-white min-h-screen">
      <div className="max-w-screen-lg mx-auto p-6">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <img
              src="https://placehold.co/40x40"
              alt="Logo"
              className="h-10 w-10"
            />
            <h1 className="ml-3 text-xl font-bold">Flicktionary</h1>
          </div>
          <div>
            <a href="/" className="text-gray-300 hover:text-white">
              Home
            </a>
          </div>
        </nav>

        {/* Trailer Section */}
        <div className="mb-10 relative">
          <div className="relative rounded-lg overflow-hidden">
            {/* Embed YouTube Trailer */}
            <iframe
              width="100%"
              height="400"
              src={movie.embed}
              title={movie.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full rounded-lg"
            ></iframe>
          </div>
          <div className="absolute bottom-[-40px] left-6 bg-[#15203b] p-4 rounded-lg shadow-lg">
            <h2 className="text-lg text-white font-semibold">Detail Page</h2>
            <h1 className="text-3xl font-bold">{movie.title}</h1>
          </div>
        </div>

        {/* Movie Poster & Synopsis */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Movie Poster */}
          <div className="flex-shrink-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full max-w-xs rounded-lg"
              onError={(e) => (e.target.src = "/path/to/default/image.jpg")} // Fallback image
            />
          </div>

          {/* Movie Info */}
          <div className="flex-grow">
            <h2 className="text-2xl font-semibold mb-4">Synopsis</h2>
            <p className="text-gray-400 mb-6">{movie.synopsis}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-400 uppercase text-sm">Genres</h3>
                <p className="text-lg font-medium">
                  {movie.genres?.join(", ") || "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 uppercase text-sm">Year</h3>
                <p className="text-lg font-medium">{movie.year}</p>
              </div>
              <div>
                <h3 className="text-gray-400 uppercase text-sm">Rating</h3>
                <p className="text-lg font-medium">{movie.rating}</p>
              </div>
              <div>
                <h3 className="text-gray-400 uppercase text-sm">Duration</h3>
                <p className="text-lg font-medium">{movie.duration}</p>
              </div>
              <div>
                <h3 className="text-gray-400 uppercase text-sm">Country</h3>
                <p className="text-lg font-medium">{movie.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
