import axios from "axios";

const {
  IRIS_CLIENT_ID,
  IRIS_CLIENT_SECRET,
  IRIS_REDIRECT_URI,
  IRIS_TOKEN_URL,
  IRIS_PROFILE_URL,
} = process.env;

export const getIrisAuthorizationUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.IRIS_CLIENT_ID,
    redirect_uri: process.env.IRIS_REDIRECT_URI,
    response_type: "code",
    scope: "profile",
    state,
  });

  return `${process.env.IRIS_AUTHORIZE_URL || "https://iris.nitk.ac.in/oauth/authorize"}?${params.toString()}`;
};

export const getIrisProfile = async (code) => {
  const tokenResponse = await axios.post(
    process.env.IRIS_TOKEN_URL || "https://iris.nitk.ac.in/oauth/token",
    new URLSearchParams({
      client_id: process.env.IRIS_CLIENT_ID,
      client_secret: process.env.IRIS_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.IRIS_REDIRECT_URI,
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token } = tokenResponse.data;

  const profileResponse = await axios.get(
    process.env.IRIS_PROFILE_URL || "https://iris.nitk.ac.in/oauth/userinfo",
    {
      params: {
        access_token,
      },
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  return profileResponse.data;
};