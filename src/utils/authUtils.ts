import auth from "@react-native-firebase/auth";

export const isGuestUser = () => {
  const user = auth().currentUser;
  return user?.isAnonymous === true;
};
