import { AsyncStorage } from "react-native";

let token;

export const getToken = async () => {
  if (token) {
    return Promise.resolve(token);
  }
  token = await AsyncStorage.getItem("AUTH_TOKEN");
  return token;
};

export const signIn = newToken => {
  return AsyncStorage.setItem("AUTH_TOKEN", newToken);
};

export const signOut = () => {
  token = undefined;
  return AsyncStorage.removeItem("AUTH_TOKEN");
};
