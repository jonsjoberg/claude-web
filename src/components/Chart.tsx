import React from 'react';
import {Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
import {Heatmap} from './Heatmap';

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    root: {
      display : 'flex',
      '& > *' : {
        margin: theme.spacing(1),
        padding: theme.spacing(1),
        display : 'flex',
        flexDirection: 'column'
      },
    },
    typo: {
      textAlign:'center'
    }
  })
);

type ChartProps = {
  title: string,
  width: number,
  height: number,
  layer?: number,
  time?: number,
  data : {x:number, y:number, c:number[]}
}

export const Chart = (props : ChartProps) => {

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper elevation={3}>
        <Typography variant="h6" className={classes.typo}>
          {props.title} {props.layer >= 0 ? `- Layer: ${props.layer}` : ` - Time: ${props.time}`} 
        </Typography>
        <Heatmap data={props.data} height={props.height} width={props.width} />
      </Paper>
    </div>
  )

}