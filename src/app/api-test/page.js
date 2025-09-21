"use client";

import { useState, useEffect } from 'react';

export default function APITestPage() {
  const [films, setFilms] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Test GET /api/films
  const testGetFilms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/films');
      const data = await response.json();
      
      if (response.ok) {
        setFilms(data.films);
        console.log('Films API Response:', data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch films: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test GET /api/stats
  const testGetStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
        console.log('Stats API Response:', data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch stats: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Test GET /api/films/search
  const testSearchFilms = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/films/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.films);
        console.log('Search API Response:', data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to search films: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    testGetFilms();
    testGetStats();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center">🚀 Flicktionary API Test Dashboard</h1>
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">✅ API Integration Complete!</h2>
          <p className="text-blue-700">
            Your Flicktionary website now has a powerful API layer with the following endpoints:
          </p>
          <ul className="list-disc list-inside mt-2 text-blue-700">
            <li><code>/api/films</code> - Get all films with filtering</li>
            <li><code>/api/films/[id]</code> - Get, update, or delete specific films</li>
            <li><code>/api/films/search</code> - Search films by title, genre, or country</li>
            <li><code>/api/stats</code> - Get database statistics</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}

      {/* API Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Total Films</h3>
            <p className="text-3xl font-bold">{stats.totalFilms}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Genres</h3>
            <p className="text-3xl font-bold">{Object.keys(stats.genres).length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Countries</h3>
            <p className="text-3xl font-bold">{Object.keys(stats.countries).length}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Years</h3>
            <p className="text-3xl font-bold">{Object.keys(stats.years).length}</p>
          </div>
        </div>
      )}

      {/* Search Test */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">🔍 Search API Test</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search for films..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && testSearchFilms()}
          />
          <button
            onClick={testSearchFilms}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((film) => (
              <div key={film.id} className="border border-gray-200 rounded-lg p-4">
                <img 
                  src={film.poster} 
                  alt={film.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h3 className="font-semibold text-lg">{film.title}</h3>
                <p className="text-gray-600">{film.year} • {film.rating}⭐</p>
                <p className="text-sm text-gray-500">{film.country}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Films */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📽️ Recent Films (API Data)</h2>
          <button
            onClick={testGetFilms}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {films.slice(0, 8).map((film) => (
            <div key={film.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <img 
                src={film.poster} 
                alt={film.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h3 className="font-semibold text-lg truncate">{film.title}</h3>
              <p className="text-gray-600">{film.year} • {film.rating}⭐</p>
              <p className="text-sm text-gray-500">{film.country}</p>
              <div className="mt-2">
                {Array.isArray(film.genres) && film.genres.slice(0, 2).map((genre, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints Documentation */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">📚 API Endpoints</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border-l-4 border-blue-500">
            <h3 className="font-semibold text-lg">GET /api/films</h3>
            <p className="text-gray-600">Fetch all films with optional filtering by genre, year, country, or search term</p>
            <code className="text-sm bg-gray-100 p-1 rounded">?genre=Action&year=2023&search=batman</code>
          </div>
          <div className="bg-white p-4 rounded border-l-4 border-green-500">
            <h3 className="font-semibold text-lg">POST /api/films</h3>
            <p className="text-gray-600">Add a new film (supports file upload for posters)</p>
          </div>
          <div className="bg-white p-4 rounded border-l-4 border-yellow-500">
            <h3 className="font-semibold text-lg">PUT /api/films/[id]</h3>
            <p className="text-gray-600">Update an existing film by ID</p>
          </div>
          <div className="bg-white p-4 rounded border-l-4 border-red-500">
            <h3 className="font-semibold text-lg">DELETE /api/films/[id]</h3>
            <p className="text-gray-600">Delete a film by ID</p>
          </div>
          <div className="bg-white p-4 rounded border-l-4 border-purple-500">
            <h3 className="font-semibold text-lg">GET /api/films/search</h3>
            <p className="text-gray-600">Search films by title, genre, or country</p>
            <code className="text-sm bg-gray-100 p-1 rounded">?q=action&limit=10</code>
          </div>
          <div className="bg-white p-4 rounded border-l-4 border-indigo-500">
            <h3 className="font-semibold text-lg">GET /api/stats</h3>
            <p className="text-gray-600">Get database statistics including counts by genre, country, year, and rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}