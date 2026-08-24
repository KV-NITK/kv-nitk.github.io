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
    client_id: IRIS_CLIENT_ID,
    redirect_uri: IRIS_REDIRECT_URI,
    response_type: "code",
    scope: "profile",
    state,
  });

  return `https://iris.nitk.ac.in/oauth/authorize?${params.toString()}`;
};

export const getIrisProfile = async (code) => {
  const tokenResponse = await axios.post(
    IRIS_TOKEN_URL,
    new URLSearchParams({
      client_id: IRIS_CLIENT_ID,
      client_secret: IRIS_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: IRIS_REDIRECT_URI,
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token } = tokenResponse.data;

  const profileResponse = await axios.get(IRIS_PROFILE_URL, {
    params: {
      access_token,
    },
  });

  return profileResponse.data;
};