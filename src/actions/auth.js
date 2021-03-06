import auth from "@react-native-firebase/auth";
import { Toast } from "native-base";
import { APP_NAME } from "../config";
import { sendRequest } from "../utils/api";
import { HIDE_PROGRESS, SHOW_PROGRESS, SET_USERDATA, AUTH_SIGNOUT } from "./types";

export function signUp(params) {
  return async (dispatch) => {
    try {
      const { email, password } = params;
      dispatch({ type: SHOW_PROGRESS });
      auth().createUserWithEmailAndPassword(email, password).then(async credential => {
        Toast.show({ text: 'You account is created successfully', type: 'success', duration: 2000, position: 'top' });

        const { uid } = credential.user;
        const { result, data: userData } = await sendRequest('/auth/signUpWithEmail', { email, uid });
        dispatch({ type: SET_USERDATA, payload: userData });
      }).catch((error) => {
        console.log('Sign Up error', error);
        Toast.show({ text: error.message, type: 'warning', duration: 3000 });
      }).finally(() => {
        return dispatch({ type: HIDE_PROGRESS });
      });
    } catch (error) {
      // return dispatch(onApplicationError(error));
      return dispatch({ type: HIDE_PROGRESS });
    }
  };
}

export function signOut() {
  return async (dispatch) => {
    if (auth().currentUser) await auth().signOut();
    return dispatch({type: AUTH_SIGNOUT});
  };
}

export function signInWithEmail(params) {
  return async (dispatch) => {
    if (auth().currentUser) await auth().signOut();

    dispatch({ type: SHOW_PROGRESS });
    const { email, password } = params;
    auth().signInWithEmailAndPassword(email, password)
    .then(async credential => {
      console.log('credential', credential);
      const { uid } = credential.user;
      const { result, data: userData } = await sendRequest('/auth/signInWithEmail', { email, uid });
      console.log(result, userData);

      Toast.show({ text: `Welcome to ${APP_NAME}`, type: 'success', duration: 2000, position: 'top' });
      dispatch({ type: SET_USERDATA, payload: userData });
    }).catch((error) => {
      console.log('Sign Up error', error);
      Toast.show({ text: error.message, type: 'warning', duration: 3000 });
    }).finally(() => {
      return dispatch({ type: HIDE_PROGRESS });
    });
  };
}