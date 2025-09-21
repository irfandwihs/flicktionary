import { NextResponse } from 'next/server';
import { ref, get } from 'firebase/database';
import { database } from '../../../firebase';

// GET - Search films by title
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const filmsRef = ref(database, 'films');
    const snapshot = await get(filmsRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ films: [], total: 0 });
    }

    let films = [];
    snapshot.forEach((childSnapshot) => {
      const filmData = childSnapshot.val();
      const film = {
        id: childSnapshot.key,
        ...filmData
      };

      // Search in title, genres, and country
      const searchText = query.toLowerCase();
      const titleMatch = film.title.toLowerCase().includes(searchText);
      const genreMatch = Array.isArray(film.genres) && 
        film.genres.some(genre => genre.toLowerCase().includes(searchText));
      const countryMatch = film.country.toLowerCase().includes(searchText);

      if (titleMatch || genreMatch || countryMatch) {
        // Add relevance score
        let relevance = 0;
        if (titleMatch) relevance += 3;
        if (genreMatch) relevance += 2;
        if (countryMatch) relevance += 1;
        
        films.push({ ...film, relevance });
      }
    });

    // Sort by relevance and then by year
    films.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return b.year - a.year;
    });

    // Apply limit
    films = films.slice(0, limit);

    return NextResponse.json({
      films: films.map(({ relevance, ...film }) => film),
      total: films.length,
      query,
      message: 'Search completed successfully'
    });

  } catch (error) {
    console.error('Error searching films:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}