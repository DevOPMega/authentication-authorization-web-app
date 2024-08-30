function setTokenCookies(
  res,
  accessToken,
  refreshToken,
  accessTokenExp,
  refreshTokenExp
) {
  const accessTokenMaxAge = (accessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenMaxAge = (refreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  try {
    // Set cookies for access token
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      // secure: true,
      maxAge: accessTokenMaxAge,
    });

    // Set cookies for refresh token
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      // secure: true,
      maxAge: refreshTokenMaxAge,
    });

    // Set cookies for is auth
    res.cookie("is_auth", true, refreshToken, {
      httpOnly: false,
      // secure: false,
      maxAge: refreshTokenMaxAge,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = setTokenCookies;