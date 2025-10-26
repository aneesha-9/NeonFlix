import { deleteUserByEmail, saveUser } from "@/services/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedName = await AsyncStorage.getItem("user_name");
        const storedEmail = await AsyncStorage.getItem("user_email");

        if (storedName && storedEmail) {
          setName(storedName);
          setEmail(storedEmail);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log("Error loading user info:", error);
      }
    };

    loadUserInfo();
  }, []);

  const handleSaveUser = async () => {
    const result = await saveUser(name, email);

    if (result?.error) {
      Alert.alert("Email already exists", result.error);
    } else {
      await AsyncStorage.setItem("user_name", name);
      await AsyncStorage.setItem("user_email", email);
      setIsLoggedIn(true);
      Alert.alert("Success", "User has been saved.");
    }
  };

  const handleLogout = async () => {
    const res = await deleteUserByEmail(email);
    if (res.error) {
      Alert.alert("Warning", res.error);
    }
    await AsyncStorage.removeItem("user_name");
    await AsyncStorage.removeItem("user_email");
    setName("");
    setEmail("");
    setIsLoggedIn(false);
    Alert.alert("Logged out", "User info has been cleared.");
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="px-10 flex-1 justify-center">
        <View>
          <Text className="text-[cyan] font-bold text-2xl mx-3 my-5">Name</Text>
          <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
            <TextInput
              editable={!isLoggedIn}
              placeholder="Enter your name"
              value={name}
              onChangeText={(value) => setName(value)}
              placeholderTextColor="#b3ffff"
              className="flex-1 ml-2 text-white"
            />
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-[cyan] font-bold text-2xl mx-3 my-5">
            Email
          </Text>
          <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
            <TextInput
              editable={!isLoggedIn}
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => setEmail(value)}
              placeholderTextColor="#b3ffff"
              className="flex-1 ml-2 text-white"
            />
          </View>
        </View>

        <View className="flex justify-center items-center">
          {isLoggedIn ? (
            <TouchableOpacity
              className="w-36 h-16 mx-5 bg-red-500 rounded-full py-3.5 flex flex-row items-center justify-center mt-10"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold text-base">Logout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="w-36 h-16 mx-5 bg-cyan-400 rounded-full py-3.5 flex flex-row items-center justify-center mt-10"
              onPress={handleSaveUser}
            >
              <Text className="text-white font-semibold text-base">Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Profile;
