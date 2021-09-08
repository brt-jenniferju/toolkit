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

# How do I get data?

This depends on the type of app you're making

## I'm making an application outside of formant

Using user login credentials or service accounts, you can use the data manager to get access to device data.

```javascript
import { DataManager } from "@formant/data-manager";

await DataManager.login("sam@robot.xyz", "passwordsecret");

// Get all devices
const allDevice = DataManager.getDevices();

// Get data ...
```

## I'm making an application within Formant

You don't need to do anything, the data manager will be able to figure out from url query strings what the authentication should be to access device data.

```javascript
import { DataManager } from "@formant/data-manager";

await DataManager.waitTilAuthenticated();

// Get the context of a device is passed along as a query string
const device = DataManager.getCurrentDevice();

// Get data ...
```
