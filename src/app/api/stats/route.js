import { NextResponse } from 'next/server';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase';

// GET - Get database statistics
export async function GET() {
  try {
    const filmsRef = ref(database, 'films');
    const snapshot = await get(filmsRef);

    if (!snapshot.exists()) {
      return NextResponse.json({
        totalFilms: 0,
        genres: {},
        countries: {},
        years: {},
        ratings: {}
      });
    }

    let totalFilms = 0;
    const genreCount = {};
    const countryCount = {};
    const yearCount = {};
    const ratingCount = {};

    snapshot.forEach((childSnapshot) => {
      const filmData = childSnapshot.val();
      totalFilms++;

      // Count genres
      if (Array.isArray(filmData.genres)) {
        filmData.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }

      // Count countries
      if (filmData.country) {
        countryCount[filmData.country] = (countryCount[filmData.country] || 0) + 1;
      }

      // Count years
      if (filmData.year) {
        yearCount[filmData.year] = (yearCount[filmData.year] || 0) + 1;
      }

      // Count ratings
      if (filmData.rating) {
        const ratingRange = Math.floor(parseFloat(filmData.rating));
        ratingCount[ratingRange] = (ratingCount[ratingRange] || 0) + 1;
      }
    });

    return NextResponse.json({
      totalFilms,
      genres: genreCount,
      countries: countryCount,
      years: yearCount,
      ratings: ratingCount,
      message: 'Statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}