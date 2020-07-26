import React, {useRef, useEffect, useCallback} from 'react';

export const Heatmap = ({ data, height, width }) => {

  const minMaxScale255 = (data) : number[] => {
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    if (minValue === maxValue) {
      return Array(data.length).fill(127);
    } else {
      return data.map(c => ((c - minValue)/(maxValue - minValue))*255);
    }
    
  }

  const scaleDim = (x : number, y : number, width : number, height : number) : 
    {xFactor: number, yFactor :number} => {
      return {xFactor: Math.ceil(width/x), yFactor: Math.ceil(height/y)};
  }

  const draw = useCallback(
    (ref, data) => {
      const canvas = ref.current;
      const ctx = canvas.getContext('2d');
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      const scaledData = minMaxScale255(data.c);
      const {xFactor, yFactor} = scaleDim(data.x, data.y, width, height);
      for (let i = 0; i < scaledData.length; i++) {
        const y = Math.floor(i / data.x);
        const x = i - y*data.x
        // console.log({i, x, y, 'dat':scaledData[i]});
        ctx.fillStyle = `rgba(${scaledData[i]}, ${scaledData[i]}, ${scaledData[i]})`;
        ctx.fillRect(x*xFactor, y*yFactor, xFactor, yFactor);
      }

  }, [width, height]);

  const canvasRef = useRef();

  useEffect(() => {
    draw(canvasRef, data,);
  }, [data, draw])

  return (
    <canvas ref={canvasRef} style={{height: `${height}px`, width: `${width}px`, border: '1px solid black'}}>

    </canvas>
  )

}