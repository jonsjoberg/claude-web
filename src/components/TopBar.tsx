import React, {useState} from 'react';
import { useForm } from 'react-hook-form';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { OutlinedInputProps, Toolbar } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';

export type Input = {
  durationOfDay:number,
  timestepLength:number,
  gridResolution:number,
  nAtmosLayers:number,
  planetRadius:number,
  insolation:number
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    appBarStyle : {
      backgroundColor : 'white',
      padding: theme.spacing(1)
    },
    inputStyles : {
      marginLeft : theme.spacing(1)
    },
    formStyle : {
      display:'flex',
      justifyContent:'space-around'
    }
  }));

function TopBarTextField(props: TextFieldProps) {

  const classes = useStyles();

  const adornment = props.inputProps && props.inputProps.adornment;

  return (
    <TextField
      InputProps={{
        size:'small',
        margin:'dense',
        variant:'outlined',
        endAdornment:<InputAdornment position="end">{adornment}</InputAdornment>
      } as Partial<OutlinedInputProps>}
      {...props} 
      className={classes.inputStyles}/>
  );
}

//TODO ADD TYPES
export const TopBar = ( {modelInput, handleStartButton, setModelInput, running}) => {

  const classes = useStyles();
  const { register, handleSubmit, watch, errors } = useForm<Input>();
  const onSubmit = () : void => handleStartButton();
  const onChange = (e:any) : void => {setModelInput({...modelInput, [e.target.name]: +e.target.value,})};
  
  const handleFocus = (e)  => e.target.select();

  return (
    <React.Fragment>
      <AppBar position="fixed" className={classes.appBarStyle}>
        <form onSubmit={handleSubmit(onSubmit)} className={classes.formStyle} autoComplete="off">
          <TopBarTextField 
            label="Duration of day" 
            name="durationOfDay" 
            value={modelInput.durationOfDay} 
            inputRef={register({required:true})} 
            variant="outlined"
            onChange={onChange}
            onFocus={handleFocus}
            inputProps={{adornment:'s'}}
            />
          <TopBarTextField 
            label="Timestep" 
            name="timestepLength" 
            value={modelInput.timestepLength} 
            inputRef={register({required:true})}
            variant="outlined"
            onChange={onChange}
            onFocus={handleFocus}
            inputProps={{adornment:'s'}}
          />
          <TopBarTextField
            label="Grid resolution" 
            name="gridResolution" 
            value={modelInput.gridResolution} 
            inputRef={register({required:true})}
            variant="outlined"
            onChange={onChange}
            onFocus={handleFocus}
            inputProps={{adornment:'deg'}}
            />
          <TopBarTextField 
            label="# Atmospheric layers"
            name="nAtmosLayers"
            value={modelInput.nAtmosLayers}
            inputRef={register({required:true})}
            variant="outlined"
            onChange={onChange}
            onFocus={handleFocus}
            inputProps={{adornment:'n'}}
            />
          <TopBarTextField
            label="Planet radius" 
            name="planetRadius" 
            value={modelInput.planetRadius} 
            inputRef={register({required:true})} 
            variant="outlined"
            onChange={onChange}
            onFocus={handleFocus}
            inputProps={{adornment:'m'}}
            />
          <TopBarTextField 
            label="Insolation" 
            name="insolation" 
            value={modelInput.insolation} 
            inputRef={register({required:true})}
            variant="outlined"
            onChange={onChange}
            onFocus={handleFocus}
            inputProps={{adornment:'Wm⁻²'}}
            />
          <Button type="submit" variant="outlined" name="start" size="small" className={classes.inputStyles}>{running ? 'Stop' : 'Start'}</Button>
      </form>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );

}
