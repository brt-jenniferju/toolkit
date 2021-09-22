import { Authentication, Fleet } from "../src/main";
import "./style.css";
(async function () {
  const el = document.querySelector("#app");
  if (el) {
    el.innerHTML = "Connecting";
    if (await Authentication.waitTilAuthenticated()) {
      el.innerHTML = "Authenticated";
      const device = await Fleet.getCurrentDevice();
      el.innerHTML = "Starting realtime connection ...";
      await device.startRealtimeConnection();
      el.innerHTML = "Connected to realtime to device";
      const videoStreams = await device.getRealtimeVideoStreams();
      device.addRealtimeListener((peer: string, message: any) => {
        console.log(peer);
        console.log(message);
      });
      await device.startListeningToRealtimeVideo(videoStreams[0]);
    } else {
      el.innerHTML = "Not Authenticated";
    }
  }
})();
