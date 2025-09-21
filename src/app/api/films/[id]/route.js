import { NextResponse } from 'next/server';
import { ref, get, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../../../firebase';

// GET - Fetch single film by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const filmRef = ref(database, `films/${id}`);
    const snapshot = await get(filmRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Film not found' },
        { status: 404 }
      );
    }

    const filmData = snapshot.val();
    return NextResponse.json({
      film: { id, ...filmData },
      message: 'Film retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching film:', error);
    return NextResponse.json(
      { error: 'Failed to fetch film', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update film
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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
      updatedAt: new Date().toISOString()
    };

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

    // Update in Firebase
    const filmRef = ref(database, `films/${id}`);
    await update(filmRef, filmData);

    return NextResponse.json({
      message: 'Film updated successfully',
      film: { id, ...filmData }
    });

  } catch (error) {
    console.error('Error updating film:', error);
    return NextResponse.json(
      { error: 'Failed to update film', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove film
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const filmRef = ref(database, `films/${id}`);
    
    // Check if film exists
    const snapshot = await get(filmRef);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Film not found' },
        { status: 404 }
      );
    }

    // Delete from Firebase
    await remove(filmRef);

    return NextResponse.json({
      message: 'Film deleted successfully',
      filmId: id
    });

  } catch (error) {
    console.error('Error deleting film:', error);
    return NextResponse.json(
      { error: 'Failed to delete film', details: error.message },
      { status: 500 }
    );
  }
}