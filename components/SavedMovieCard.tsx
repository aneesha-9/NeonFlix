import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { icons } from "@/constants/icons";
import { unSaveMovies } from "@/services/appwrite";

type SavedMovieCardProps = {
  id: number;
  poster_path: string;
  title: string;
  vote_average: number;
  release_date: string;
  onUnsave?: () => void;
};

const SavedMovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  onUnsave
}: SavedMovieCardProps  & { onUnsave?: () => void }) => {

    const handleUnsave = async () => {
    await unSaveMovies(id);
    onUnsave?.(); 
    Alert.alert("Movie Unsaved", "This movie was removed from your saved list.");
  };

  return (
    <Link href={`/movie/${id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/ffffff.png",
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {title}
        </Text>

        <View className="flex-row">
          <View>
            <View className="flex-row items-center justify-start gap-x-1">
              <Image source={icons.star} className="size-4" />
              <Text className="text-sm text-white font-bold uppercase">
                {Math.round(vote_average / 2)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-light-300 font-medium mt-1">
                {release_date?.split("-")[0]}
              </Text>
            </View>
          </View>

          <View>
            <TouchableOpacity  onPress={handleUnsave}
              className="bottom-0 left-0  ml-8 bg-red-400 rounded-lg p-2 flex flex-row items-center justify-center z-50" 
            >
              <Text className="text-white font-semibold text-sm">
                Unsave
              </Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default SavedMovieCard;


