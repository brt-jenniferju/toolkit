# Formant Web SDK

A collection of open source libraries to help make custom web and 3D experiences on top of Formant using [ThreeJS](https://threejs.org/). Using these SDKs you can get information about your fleet of devices, create realtime 3D visualizations of your robots, and more.

- Embed your own application in Formant
- Create your own application that uses Formant's APIs and RealtimeSDK for data
- Create WebView's for mobile applications that show 3D visualization of your fleet

# Documentation

- [HTTP API](https://formantio.github.io/web-sdk/docs/api/)
- [Data Manager](https://formantio.github.io/web-sdk/docs/data-manager/)

# How does it work?

We understand you want complete control over your user experience, so Formant provides:

- An easy device data manager that can help get realtime and historical data
- Simple 3D elements that you can import into your ThreeJS scene
- UI custom elements to make your application visually look similar to Formant's ecosystem

# What do you have for ThreeJS?

## three-formant-urdf

This ThreeJS element will show a URDF of a robot using the zipped URDF uploaded for formant and control it's joint states in realtime.

# FAQ

## How do I get data?

This depends on the type of app you're making

### I'm making an application outside of formant

Using user login credentials or service accounts, you can use the data manager to get access to device data.

```javascript
import { DataManager } from "@formant/data-manager";

await DataManager.login("sam@robot.xyz", "12345");

// Get all devices
const allDevices = await DataManager.getDevices();

// find the device(s) you want
const device = allDevices.find((_) => _.name === "spot");

// Get data ...
const data = await device.getLatestTelemetry();
```

### I'm making an application within Formant as a custom view

The data manager will be able to figure out from url the authentication needed to access the current viewing device.

```javascript
import { DataManager } from "@formant/data-manager";

await DataManager.waitTilAuthenticated();

// Get the context of a device is passed along as a query string
const device = await DataManager.getCurrentDevice();

// Get data ...
const data = await device.getLatestTelemetry();
```

## I don't want to use these libraries, how do I use the HTTP API?

If your just interested in using our APIs, there's two main steps

### 1) Get an authorization token

```javascript
await fetch("https://api.formant.io/v1/admin/auth/login", {
  method: "POST",
  body: JSON.stringify({{email:"sam@robot.xyz", password:"12345"}}),
  headers: {
    "Content-Type": "application/json"
  }
});
```

```console
curl -X POST "https://api.formant.io/v1/admin/auth/login" \
 -H "Accept: application/json" \
 -H "Content-Type: application/json" \
 -d '{"email":"sam@robot.xyz","password":"12345"}'
```

This will return a [JWT](https://jwt.io) token.

```javascript
{
   "authentication":{
      "accessToken": "abc......xyz",
      ...
    },
    ...
}
```

### 2) Call an API with the token

```javascript
// the token from above
cons token = "abc......xyz"

await fetch("https://api.formant.io/v1/admin/device-details/query", {
  method: "POST",
  body: JSON.stringify({{enabled:true, type:"default"}}),
  headers: {
    "Content-Type": "application/json",
    "Authorization: "Bearer "+token
  }
});
```

```console
curl -X POST "https://api.formant.io/v1/admin/device-details/query" \
 -H "Accept: application/json" \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer abc......xyz" \
 -d '{"enabled":true,"type":"default"}'
```

## I don't want to use WebPack/Vite, can I just use plain JavaScript?

Yes, for the DataManager

As a ES6 module:

```html
<script type="module">
  import {DataManager} from "https://cdn.jsdelivr.net/npm/@formant/data-manager/dist/formant-data-manager.es6.js"
  ...
</script>
```

As a non-module:

```html
<script src="https://cdn.jsdelivr.net/npm/@formant/data-manager/dist/formant-data-manager.umd.js"></script>
```

## How do I take a URDF and convert it into a zip for Formant?
