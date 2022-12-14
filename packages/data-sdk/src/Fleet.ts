import { Device } from "./Device";
import { Authentication } from "./Authentication";
import { FORMANT_API_URL } from "./config";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  id: string;
}

export interface TelemetryResult {
  deviceId: string;
  name: string;
  points: [number, any][];
  tags: { [key in string]: string | number };
  type: string;
}

export class Fleet {
  static defaultDeviceId: string | undefined;
  static knownContext: WeakRef<Device>[] = [];

  static async setDefaultDevice(deviceId: string) {
    Fleet.defaultDeviceId = deviceId;
  }

  static async getCurrentDevice(): Promise<Device> {
    if (!Authentication.token) {
      throw new Error("Not authenticated");
    }
    if (!Fleet.defaultDeviceId) {
      throw new Error("No known default device");
    }

    const data = await fetch(
      `${FORMANT_API_URL}/v1/admin/devices/${Fleet.defaultDeviceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Authentication.token,
        },
      }
    );
    const device = await data.json();
    const name = device.name as string;
    const context = new Device(
      Fleet.defaultDeviceId,
      name,
      device.organizationId as string
    );
    Fleet.knownContext.push(new WeakRef(context));
    return context;
  }

  static async getDevice(deviceId: string): Promise<Device> {
    if (!Authentication.token) {
      throw new Error("Not authenticated");
    }
    const data = await fetch(
      `${FORMANT_API_URL}/v1/admin/devices/${deviceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Authentication.token,
        },
      }
    );
    const device = await data.json();
    const name = device.name as string;
    const context = new Device(deviceId, name, device.organizationId);
    Fleet.knownContext.push(new WeakRef(context));
    return context;
  }

  static async getDevices(): Promise<Device[]> {
    if (!Authentication.token) {
      throw new Error("Not authenticated");
    }
    const data = await fetch(
      `${FORMANT_API_URL}/v1/admin/device-details/query`,
      {
        method: "POST",
        body: JSON.stringify({ enabled: true, type: "default" }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Authentication.token,
        },
      }
    );
    const devices = await data.json();
    devices.items;
    return devices.items.map(
      (_: any) =>
        new Device(_.id as string, _.name as string, _.organizationId as string)
    );
  }

  static async getOnlineDevices(): Promise<Device[]> {
    if (!Authentication.token) {
      throw new Error("Not authenticated");
    }
    const data = await fetch(`${FORMANT_API_URL}/v1/queries/online-devices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + Authentication.token,
      },
    });
    const devices = await data.json();
    const onlineIds = devices.items as string[];
    const allDevices = await Fleet.getDevices();
    return allDevices.filter((_) => onlineIds.includes(_.id));
  }

  static async getRealtimeDevices(): Promise<Device[]> {
    if (!Authentication.token) {
      throw new Error("Not authenticated");
    }
    const data = await fetch(`${FORMANT_API_URL}/v1/signaling/peers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + Authentication.token,
      },
    });
    const devices = await data.json();
    const onlineIds = devices.items.map(
      (_: { deviceId: string }) => _.deviceId
    ) as string[];
    const allDevices = await Fleet.getDevices();
    return allDevices.filter((_) => onlineIds.includes(_.id));
  }

  static async getLatestTelemetry(deviceIdOrDeviceIds?: string | string[]) {
    let deviceIds = deviceIdOrDeviceIds;
    if (deviceIdOrDeviceIds && !Array.isArray(deviceIdOrDeviceIds)) {
      deviceIdOrDeviceIds = [deviceIdOrDeviceIds];
    }
    const data = await fetch(
      `${FORMANT_API_URL}/v1/queries/stream-current-value`,
      {
        method: "POST",
        body: JSON.stringify({
          deviceIds,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Authentication.token,
        },
      }
    );
    const telemetry = await data.json();
    return telemetry.items;
  }

  static async getTelemetry(
    deviceIdOrDeviceIds: string | string[],
    streamNameOrStreamNames: string | string[],
    start: Date,
    end: Date,
    tags?: { [key in string]: string[] }
  ): Promise<TelemetryResult[]> {
    let deviceIds = deviceIdOrDeviceIds;
    if (!Array.isArray(deviceIdOrDeviceIds)) {
      deviceIds = [deviceIdOrDeviceIds];
    }
    let streamNames = streamNameOrStreamNames;
    if (!Array.isArray(streamNameOrStreamNames)) {
      streamNames = [streamNameOrStreamNames];
    }
    const data = await fetch(`${FORMANT_API_URL}/v1/queries/queries`, {
      method: "POST",
      body: JSON.stringify({
        deviceIds,
        end: end.toISOString(),
        names: streamNames,
        start: start.toISOString(),
        tags,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + Authentication.token,
      },
    });
    const telemetry = await data.json();
    return telemetry.items;
  }

  static async getFileUrl(uuid: string) {
    const data = await fetch(`${FORMANT_API_URL}/v1/admin/files/query`, {
      method: "POST",
      body: JSON.stringify({
        fileIds: [uuid],
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + Authentication.token,
      },
    });
    const result = await data.json();
    if (result.fileUrls.length === 0) {
      throw new Error("File not found");
    }
    return result.fileUrls[0] as string;
  }
}
