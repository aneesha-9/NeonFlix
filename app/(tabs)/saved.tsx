import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SavedMovieCard from "@/components/SavedMovieCard";
import { fetchSavedMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SavedMovieCardProps = {
  id: number;
  poster_path: string;
  title: string;
  vote_average: number;
  release_date: string;
  onUnsave?: () => void;
};

const Save = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const {
    data: movies,
    loading,
    error,
    refetch,
  } = useFetch(fetchSavedMovies, false);

  // Check if user is logged in
  const checkLogin = async () => {
    const email = await AsyncStorage.getItem("user_email");
    setIsLoggedIn(!!email);
    if (email) {
      refetch(); // fetch movies only if logged in
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkLogin();
    }, [])
  );

  if (isLoggedIn === null) {
    // Still checking login status
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#00f" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      {!isLoggedIn ? (
        <SafeAreaView className="flex-1 px-10 justify-center items-center">
          <View className="justify-center items-center gap-5">
            <Image source={icons.save} className="size-10" tintColor="cyan" />
            <Text className="text-cyan-300 text-base text-center">
              You are not logged in. Please log in to save movies.
            </Text>
          </View>
        </SafeAreaView>
      ) : loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00f" />
        </View>
      ) : movies && movies.length === 0 ? (
        <SafeAreaView className="flex-1 px-10 justify-center items-center">
          <View className="justify-center items-center gap-5">
            <Image source={icons.save} className="size-10" tintColor="cyan" />
            <Text className="text-cyan-300 text-base">
              You can view your saved movies here.
            </Text>
          </View>
        </SafeAreaView>
      ) : (
        <FlatList
          data={movies}
          renderItem={({ item }) => (
            <SavedMovieCard
              id={item.id}
              poster_path={item.poster_path ?? ""}
              title={item.title}
              vote_average={item.vote_average}
              release_date={item.release_date}
              onUnsave={refetch}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          className="px-5"
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 16,
            marginVertical: 16,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <View className="w-full flex-row justify-center mt-20 mb-5 items-center">
              <Image source={images.logo} className="w-20 h-16" />
              <Text className="text-xl text-[cyan] font-bold ml-4">
                Saved Movies
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Save;
