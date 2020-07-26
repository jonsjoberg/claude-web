import React, { useState, useEffect, useCallback } from 'react';
import Container from '@material-ui/core/Container';
import { TopBar, Input } from './components/TopBar';
import { Chart } from './components/Chart';
import { Model } from './utils/model';
import { Disclaimer } from './components/Disclaimer';
import './App.css';
function App() {

  const initialModelInput = {
    durationOfDay:86400,
    timestepLength:540,
    gridResolution:3,
    nAtmosLayers:1,
    planetRadius:6400000,
    insolation:1370
  }

  const [modelInput, setModelInput] = useState(initialModelInput);

  const initialModel = new Model(
    initialModelInput.durationOfDay, 
    initialModelInput.timestepLength,
    initialModelInput.insolation,
    initialModelInput.planetRadius,
    initialModelInput.gridResolution,
    initialModelInput.nAtmosLayers,
    false)

  const [model, setModel] = useState(initialModel);

  const [running, startRun] = useState(false);

  const [timeSteps, setTimeSteps] = useState(0);

  const handleStartButton = () => {
    //86400, 540, 100, 6400000, 1370
    if (model.started) {
      if (running) {
        startRun(false);
      } else {
        startRun(true);
      }
    } else {
      setModel(new Model(
        modelInput.durationOfDay, 
        modelInput.timestepLength,
        modelInput.insolation,
        modelInput.planetRadius,
        modelInput.gridResolution,
        modelInput.nAtmosLayers,
        true
        ));
      startRun(true);
    }
  }

  useEffect(() => {
    if (running) {
      requestAnimationFrame(() => {
        model.step();
        setTimeSteps(timeSteps + 1)
        //model.groundTemp.print();
        //model.atmosTemp.print();
      });
    } 
  }, [running, model, timeSteps]);

  const atmosPlots = [];
  if (model) {
    for (let i = 0; i < model.nAtmosLayers; i++) {
      atmosPlots.push(<Chart title="Atmosphere" width={1000} height={500} layer={i} data={model.exportData('atmos', i)} key={i}/>)
    }
  } 

  return (
    <Container>
      <TopBar 
        modelInput={modelInput} 
        handleStartButton={handleStartButton} 
        setModelInput={setModelInput}
        running={running}
      />
      <Disclaimer />
      {model && <Chart title="Ground" width={1000} height={500} data={model.exportData('ground')} time={model.currentTime}/>}
      {model && atmosPlots}
      {model && model.sTensor && <Chart title="s" width={1000} height={500} data={model.exportData('solar')} time={model.currentTime}/>}
    </Container>
  );
}

export default App;
