# Point Packing Simulation
A simple client-side [web application](https://calebsg225.github.io/point-packing-simulation) simulating point packing on a sphere

## Overview
All `points` are programmed to stay as far away from other `points` as possible.
This **usually results in minimal edge length disparity.

** this is not the case for smaller `point` counts

Edges are colored according to their lengths, one color per unique length.

## Usage
`Points`: number of `points` to be packed.

`Steps`: number of times the program will simulate each `point`s movement once.

`Render Steps`: Uncheck to turn rendering off until all `steps` are calculated. This saves time if you only care for the final result.
