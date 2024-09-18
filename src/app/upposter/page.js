/* "use client"; // This tells Next.js to treat this component as a Client Component

import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase imports
import { database } from "../firebase"; // Adjust Firebase config path if necessary
import { push, ref as dbRef } from "firebase/database"; // Firebase RTDB imports

export default function Upposter() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [posterURL, setPosterURL] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !title || !year) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage(
        "Invalid file type. Please upload a .jpg, .png, or .webp file."
      );
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `posters/${title}-${year}.${file.type.split("/")[1]}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setPosterURL(downloadURL); // Save the poster URL for next steps

      // Automatically generate a timestamp
      const timestamp = new Date().toISOString();

      // Save poster data to Firebase Database, including the timestamp
      const movieData = {
        title,
        year,
        poster: downloadURL,
        uploadedAt: timestamp, // Add the timestamp here
      };

      const moviesRef = dbRef(database, "films");
      await push(moviesRef, movieData); // Store the title, year, and poster link to RTDB along with the timestamp

      setErrorMessage("");
      alert("Poster uploaded successfully!");
    } catch (error) {
      setErrorMessage("Error uploading poster. Try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Upload Movie Poster</h1>
      <input
        type="text"
        placeholder="Movie Title"
        className="border mb-2 p-2 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Year"
        className="border mb-2 p-2 w-full"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      <input
        type="file"
        onChange={handleFileChange}
        className="border mb-4 p-2 w-full"
      />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Upload Poster
      </button>
      {posterURL && <p className="mt-4">Poster URL: {posterURL}</p>}
    </div>
  );
}
 */
