<img src="https://www.hypertrack.com/green.eeca143346e01b96d600.svg" alt="HyperTrack logo" title="HyperTrack" align="left" style="margin: 1.5rem; margin-right: 0.5rem" height="40" />

<h1 align="left" style="font-family: monospace;"> | Atlas </h1> 
<br/>
![](https://img.shields.io/david/hypertrack/atlas2?style=flat-square) ![](https://img.shields.io/github/license/hypertrack/atlas2?style=flat-square)

Atlas is a ReactJS sample application to visualise a Hypertrack `trip_summary` or `LineString` geoJSON. Use this web app to debug your device's trips, investigate location & activity events in your trip.

> 💬 [Check out the blog post about Atlas here](__BLOG_POST_LINK_HERE__)

## Overview

- [Hypertrack Altas](#ht-atlas)
- [Overview](#overview)
- [Features](#features)
- [Local Installation and setup](#installation-and-setup)
- [Usage](#usage)
- [Related](#related)
- [Credits](#credits)
- [License](#license)

## Features

Features of Atlas

## Local Installation and setup

After cloning or forking this repository, you should install all dependencies on your machine:

```shell
# with npm
npm install

# or with Yarn
yarn
```

With the dependencies and configuration in place, you can start the server in development mode:

```shell
# with npm
npm start

# or with Yarn
yarn start
```

## Usage

You'd be using Atlas in one of 2 ways:

1. Start afresh with no data, One would acquire a `trip_summary` or `LineString` geoJSON; either paste the JSON as text in the text field, or upload one of the JSON type through the file input field. Once validated, `Update` button, would close the modal, and plot the location data on to the map
2. Atlas is loaded with a gist URL. In such scenario, Atlas would fetch the json from the gist (both public gists, and private gists are supported) and update the text field. Once validated, `Update` button, would close the modal, and plot the location data on to the map. <br/> The gist url can be supplied as a [URL search parameter](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) `gist`. <br/> Eg: `https://hypertrack.github.io/atlas2/?gist=https://gist.github.com/SahRckr/c6ee0dd9b7bd605f8ca9d9b43561387d`

The validation of input will prohibit the input overlay to close and list out known problems in the input.

## Related

- [`trip_summary`](https://docs.hypertrack.com/#guides-apis-usage-trips-review-trip-summaries)
- [`LineString`](https://tools.ietf.org/html/rfc7946#section-3.1.4)

## Credits

This project uses the following open-source packages:

- [ajv](https://github.com/epoberezkin/ajv): The fastest JSON Schema Validator.
- [@blueprintjs/core](https://github.com/palantir/blueprint): A React-based UI toolkit for the web
- [mapbox-gl](https://github.com/mapbox/mapbox-gl-js): Interactive, thoroughly customizable maps in the browser, powered by vector tiles and WebGL

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
