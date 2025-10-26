import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";
import { Client, Databases, ID, Query } from "react-native-appwrite";
import { fetchMovieDetails } from "./api";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_MOVIES_ID =
  process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_MOVIES_ID!;
const COLLECTION_USERS_ID =
  process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_USERS_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_MOVIES_ID,
      [Query.equal("searchTerm", query)]
    );

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_MOVIES_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(
        DATABASE_ID,
        COLLECTION_MOVIES_ID,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movie.id,
          title: movie.title,
          count: 1,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_MOVIES_ID,
      [Query.limit(5), Query.orderDesc("count")]
    );

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const saveUser = async (name: string, email: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_USERS_ID,
      [Query.equal("email", email)]
    );

    if (result.documents.length > 0) {
      return { error: "Email already exists" };
    }

    const newUser = await database.createDocument(
      DATABASE_ID,
      COLLECTION_USERS_ID,
      ID.unique(),
      {
        name,
        email,
        saved: [],
      }
    );

    return newUser;
  } catch (error) {
    console.log("Failed to save user:", error);
    throw error;
  }
};

export const deleteUserByEmail = async (email: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_USERS_ID,
      [Query.equal("email", email)]
    );

    if (result.documents.length > 0) {
      const userDoc = result.documents[0];

      await database.deleteDocument(
        DATABASE_ID,
        COLLECTION_USERS_ID,
        userDoc.$id
      );

      return { success: true };
    } else {
      return { error: "User not found" };
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
};

export const saveMovie = async (movieId: number) => {
  try {
    const email = await AsyncStorage.getItem("user_email");

    // 1. Check login status
    if (!email) {
      Alert.alert("Login Required", "Please login to save movies.");
      router.push("/profile"); // navigate to profile
      return;
    }

    // 2. Find the user document in DB by email
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_USERS_ID,
      [Query.equal("email", email)]
    );

    if (result.documents.length === 0) {
      Alert.alert("Error", "User not found.");
      return { error: "Invalid User" };
    }

    const userDoc = result.documents[0];

    // 3. Get current saved movies and add new movieId if not already present
    const currentSaved: number[] = userDoc.saved || [];

    if (currentSaved.includes(movieId)) {
      Alert.alert("Already Saved", "This movie is already in your saved list.");
      return;
    }

    const updatedSaved = [...currentSaved, movieId];

    // 4. Update the user document
    await database.updateDocument(
      DATABASE_ID,
      COLLECTION_USERS_ID,
      userDoc.$id,
      {
        saved: updatedSaved,
      }
    );

    Alert.alert("Success", "Movie saved successfully!");
  } catch (error) {
    console.error("Failed to save movie:", error);
    Alert.alert("Error", "Failed to save movie. Try again.");
  }
};

export const fetchSavedMovies = async (): Promise<MovieDetails[]> => {
  try {
    const email = await AsyncStorage.getItem("user_email");


    const result = await database.listDocuments(DATABASE_ID, COLLECTION_USERS_ID, [
      Query.equal("email", email!),
    ]);


    const userDoc = result.documents[0];
    const savedIds: number[] = userDoc.saved || [];

    if (savedIds.length === 0) {
      return []; // No saved movies
    }

    // Fetch all movie details in parallel
    const movieDetails = await Promise.all(
      savedIds.map((id) => fetchMovieDetails(id.toString()))
    );

    return movieDetails;

  } catch (error) {
    console.error("Failed to fetch saved movies:", error);
    throw error;
  }
};

export const unSaveMovies = async (id: number) => {
  try {
    const email = await AsyncStorage.getItem("user_email");

    if (!email) {
      console.warn("User not logged in.");
      return;
    }

    // Get the user document by email
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_USERS_ID, [
      Query.equal("email", email),
    ]);

    if (result.documents.length === 0) {
      console.warn("User document not found.");
      return;
    }

    const userDoc = result.documents[0];
    const savedMovies: number[] = userDoc.saved || [];

    // Remove the movie ID
    const updatedSavedMovies = savedMovies.filter(movieId => movieId !== id);

    // Update the document with the new saved list
    await database.updateDocument(
      DATABASE_ID,
      COLLECTION_USERS_ID,
      userDoc.$id,
      { saved: updatedSavedMovies }
    );

  } catch (error) {
    console.error("Failed to unsave movie:", error);
  }
};