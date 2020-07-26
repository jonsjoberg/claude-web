import * as tf from '@tensorflow/tfjs';

export interface ChartData {
    x : number, 
    y : number,
    c : number
};

class Model{
  
  lat : tf.Tensor1D;
  lon : tf.Tensor1D;
  latArray : number[];
  lonArray : number[];
  groundTemp : tf.Tensor2D;
  atmosTemp : tf.Tensor3D;
  airPressure : tf.Tensor3D;
  airDensity : tf.Tensor2D;
  u : tf.Tensor2D;
  v : tf.Tensor2D;
  albedo : tf.Tensor2D;
  heatCapacityGround : tf.Tensor2D;
  sTensor : tf.Tensor2D;

  durationOfDay : tf.Scalar;
  timestepLength : tf.Scalar;
  insolation : tf.Scalar;

  // Physical constants
  EPSILON = tf.scalar(0.75);
  HEAT_CAPACITY_ATMOS = tf.scalar(1e7);
  SPECIFIC_GAS = tf.scalar(287);
  THERMAL_DIFFUSIVITY_AIR = tf.scalar(20e-6);
  THERMAL_DIFFUSIVITY_ROC = tf.scalar(1.5e-6);
  SIGMA = tf.scalar(5.67e-8);
  
  currentTime : number = 0;

  circumreference : number;
  circle : number;
  sphere : number;

  dy : number;
  dx : tf.Tensor1D;
  coriolis : tf.Tensor1D;
  angularSpeed : number;

  constructor(
      durationOfDay : number,
      timestepLength : number, 
      insolation : number,
      public planetRadius : number,
      public resolution : number,
      public nAtmosLayers : number,
      public started : boolean
    ) {
    
    this.durationOfDay = tf.scalar(durationOfDay);
    this.timestepLength = tf.scalar(timestepLength);
    this.insolation = tf.scalar(insolation);
    
    this.lat = tf.range(-90, 90, this.resolution);
    this.lon = tf.range(0, 360, this.resolution);
    this.latArray = this.lat.arraySync();
    this.lonArray = this.lon.arraySync();
    
    this.groundTemp = tf.zeros([this.lat.shape[0], this.lon.shape[0]]).add(270);
    this.atmosTemp = tf.zeros([this.nAtmosLayers, this.lat.shape[0], this.lon.shape[0]]).add(270);
    this.airPressure = tf.zerosLike(this.atmosTemp);
    this.airDensity = tf.zerosLike(this.atmosTemp).add(1.3);
    this.u = tf.zerosLike(this.groundTemp);
    this.v = tf.zerosLike(this.groundTemp);
    // TODO ADD ALBEDO VARIANCE
    this.albedo = tf.zerosLike(this.groundTemp);
    
    this.heatCapacityGround = tf.zerosLike(this.groundTemp).add(1e7);

    // Planet Size
    this.circumreference = 2*Math.PI*this.planetRadius;
    this.circle = Math.PI*this.planetRadius^2;
    this.sphere = Math.PI*this.planetRadius^2;
    
    // Define how far apart the gridpoints are: note that we use central difference derivatives, 
    // and so these distances are actually twice the distance between gridboxes
    this.dy = this.circumreference/this.lat.shape[0];
    this.dx = tf.zerosLike(this.lat);
    this.coriolis = tf.zerosLike(this.lat);
    // this.angularSpeed = 2*Math.PI/this.durationOfDay;
    
    // for i in range(nlat):
	  //   dx[i] = dy*np.cos(lat[i]*np.pi/180)
    //   coriolis[i] = angular_speed*np.sin(lat[i]*np.pi/180)
  }

  solar(insolation : tf.Scalar, lat : number, lon : number, t : number) : number {
    const d = this.durationOfDay.dataSync()[0];
    const sunLongitude = 360 * (-t % d) / d;
    
    const s = insolation.dataSync()[0] * Math.cos(lat*Math.PI/180) * Math.cos((lon - sunLongitude)* Math.PI/180);

    if (s < 0) {
      return 0;
    } else {
      return s;
    }
  }

  step() {
    const sArray : number[][] = [];
    for (let latIdx = 0; latIdx < this.latArray.length; latIdx++) {
      sArray[latIdx] = [];
      for (let lonIdx = 0; lonIdx < this.lonArray.length; lonIdx++) {
        sArray[latIdx][lonIdx] = this.solar(this.insolation, this.latArray[latIdx], this.lonArray[lonIdx], this.currentTime);
      }
    }
    this.sTensor = tf.tensor2d(sArray);

    const [newGroundTemp, newAtmosTemp] = tf.tidy(() => {
      // Ground
      // 4*epsilon*sigma*Ta⁴
      const pg1 = this.EPSILON.mul(4).mul(this.SIGMA).mul(this.atmosTemp.slice(0, 1).squeeze());
      // 4*sigma*Tp⁴ 
      const pg2 = this.SIGMA.mul(4).mul(this.groundTemp.pow(4));
      // this.timestepLength * ( this.insolation + 4 * this.EPSILON * this.SIGMA * this.atmosTemp⁴ - 4 * this.SIGMA * this.groundTemp⁴) / 4 * this.heatCapacityGround
      const dGroundTemp = this.timestepLength.mul(this.sTensor.add(pg1).sub(pg2)).div(this.heatCapacityGround.mul(4));

      // Atmos
      // sigma*Tp⁴
      const pa1 = this.SIGMA.mul(this.groundTemp.pow(4));
      // 2*epsilon*sigma*Ta⁴
      const pa2 = this.EPSILON.mul(2).mul(this.SIGMA).mul(this.atmosTemp.slice(0, 1).squeeze().pow(4))
      // this.timestepLength * ( this.SIGMA * this.groundTemp⁴ - 2 * this.EPSILON * this.SIGMA * this.atmosTemp⁴) / this.HEAT_CAPACITY_ATMOS
      const dAtmosTemp = this.timestepLength.mul(pa1.sub(pa2)).div(this.HEAT_CAPACITY_ATMOS);
      return [this.groundTemp.add(dGroundTemp), this.atmosTemp.add(dAtmosTemp.expandDims(0))];
    })
    
    this.currentTime += this.timestepLength.dataSync()[0];
    
    tf.dispose([this.groundTemp, this.atmosTemp]);
    this.groundTemp = newGroundTemp;
    this.atmosTemp = newAtmosTemp;
    //tf.dispose([newGroundTemp, newAtmosTemp]);
  }
  
  exportData(layerType : 'ground' | 'atmos' | 'solar', layer? : number) : {x:number, y:number, c:number[]} {
    if (layerType === 'ground') {
      return this.tensorToChartData(this.groundTemp);
    } else if (layerType === 'solar') {
      return this.tensorToChartData(this.sTensor);
    } else {
      const selectedLayer = layer ? layer : 0;
      const selLayer = this.atmosTemp.slice(selectedLayer, 1).squeeze();
      return this.tensorToChartData(selLayer);
    }
  }

  tensorToChartData(tensor : tf.Tensor) : {x:number, y:number, c:number[]} {
    const arrayTensor = tensor.as1D().arraySync();
    return {x : tensor.shape[1], y:tensor.shape[0], c:arrayTensor}
  }
}

export {Model};