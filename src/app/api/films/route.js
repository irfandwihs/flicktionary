import { NextResponse } from 'next/server';
import { ref, get, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../firebase';

// GET - Fetch all films
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const year = searchParams.get('year');
    const country = searchParams.get('country');
    const search = searchParams.get('search');

    const filmsRef = ref(database, 'films');
    const snapshot = await get(filmsRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ films: [] });
    }

    let films = [];
    snapshot.forEach((childSnapshot) => {
      const filmData = childSnapshot.val();
      films.push({
        id: childSnapshot.key,
        ...filmData
      });
    });

    // Apply filters
    if (genre && genre !== 'All Genres') {
      films = films.filter(film => 
        Array.isArray(film.genres) ? film.genres.includes(genre) : false
      );
    }

    if (year && year !== 'All Years') {
      films = films.filter(film => film.year === year);
    }

    if (country && country !== 'All Countries') {
      films = films.filter(film => film.country === country);
    }

    if (search) {
      films = films.filter(film => 
        film.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by year (newest first), then by title
    films.sort((a, b) => {
      if (b.year === a.year) {
        return a.title.localeCompare(b.title);
      }
      return b.year - a.year;
    });

    return NextResponse.json({ 
      films,
      total: films.length,
      message: 'Films retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching films:', error);
    return NextResponse.json(
      { error: 'Failed to fetch films', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new film
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const filmData = {
      title: formData.get('title'),
      year: formData.get('year'),
      rating: formData.get('rating'),
      genres: formData.get('genres')?.split(',').map(g => g.trim()) || [],
      country: formData.get('country'),
      embed: formData.get('embed'),
      synopsis: formData.get('synopsis'),
      duration: formData.get('duration'),
      uploadedAt: new Date().toISOString()
    };

    // Validate required fields
    const requiredFields = ['title', 'year', 'rating', 'country', 'embed', 'synopsis', 'duration'];
    for (const field of requiredFields) {
      if (!filmData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Handle poster upload if provided
    const posterFile = formData.get('poster');
    if (posterFile && posterFile.size > 0) {
      const fileExtension = posterFile.type.split('/')[1];
      const fileName = `${filmData.title}-${filmData.year}.${fileExtension}`;
      const posterStorageRef = storageRef(storage, `posters/${fileName}`);
      
      const buffer = await posterFile.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      await uploadBytes(posterStorageRef, uint8Array);
      const downloadURL = await getDownloadURL(posterStorageRef);
      filmData.poster = downloadURL;
    }

    // Format embed URL
    if (filmData.embed && !filmData.embed.startsWith('https://')) {
      filmData.embed = `https://www.youtube.com/embed/${filmData.embed}`;
    }

    // Save to Firebase
    const filmsRef = ref(database, 'films');
    const newFilmRef = await push(filmsRef, filmData);

    return NextResponse.json({
      message: 'Film added successfully',
      filmId: newFilmRef.key,
      film: { id: newFilmRef.key, ...filmData }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding film:', error);
    return NextResponse.json(
      { error: 'Failed to add film', details: error.message },
      { status: 500 }
    );
  }
}