import axios from "axios";

export const setAuthToken = (token) => {
  // check if token in local storage
  if (token) {
    // if exist set global header
    axios.defaults.headers.common["x-auth-token"] = token;
    console.log("token set: ", axios.defaults.headers.common["x-auth-token"] );
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
    console.log("token deleted: ", axios.defaults.headers.common["x-auth-token"] );
  }
};

export default setAuthToken;