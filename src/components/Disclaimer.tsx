import React from 'react';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';

export const Disclaimer = () => {
  return (
    <Paper elevation={3}>
      <Typography variant="body1" align="center">
        This is an implementation of <a href="https://github.com/Planet-Factory/claude">Claude</a>, it is in no way affiliated, just inspired by. If you want to know more join Simon Clark's <a href="https://www.twitch.tv/drsimonclark">Twitch streams</a>. <br />
        This is under development expect things to break
      </Typography>
    </Paper>
  )
}
