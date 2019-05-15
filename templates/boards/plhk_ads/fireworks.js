'use strict';
import React from 'react';
import * as npmFireworks from 'fireworks-canvas';

let container = '';
const options = {
  maxRockets: 5,            // max # of rockets to spawn
  rocketSpawnInterval: 100, // millisends to check if new rockets should spawn
  numParticles: 100,        // number of particles to spawn when rocket explodes (+0-10)
  explosionMinHeight: 0.2,  // percentage. min height at which rockets can explode
  explosionMaxHeight: 0.9,  // percentage. max height before a particle is exploded
  explosionChance: 0.01     // chance in each tick the rocket will explode
};

let fireworks = '';

class Fireworks extends React.Component {
  state = {};

  componentDidMount() {
    container = document.getElementById('container');
    fireworks = new npmFireworks(container, options);
    // fireworks.start();
    this.interval = setInterval(() => fireworks.fire(), 500);
  }

  // componentWillUnmount() {
  //   clearInterval(this.interval);
  // }

  render() {
    return (
      <div className='w-100 h-100 fixed-top' id='container' />
    );
  }
}

export default Fireworks;
