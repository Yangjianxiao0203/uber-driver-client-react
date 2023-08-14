export enum Identity {
    Driver = "Driver",
    Passenger = "Passenger",
}
export const serverUrl = "http://localhost:8000";
export type IdentityType = "Driver" | "Passenger";

export interface TrackProps {
    user: string;
    long: string;
    lat: string;
    speed: string;
    action:string;
}

export interface ConnectionOptions {
    protocol: "ws" | "wss" | "mqtt" | "mqtts" | "tcp" | "ssl" | "wx" | "wxs" | undefined;
    host: string;
    port: number;
    endpoint: string;
    clean: boolean;
    connectTimeout: number;
    reconnectPeriod: number;
    clientId: string;
    username: string;
    password: string;
}

export interface Position {
    lat: number;
    lng: number;
}

export const googleAPIKey="AIzaSyAHlGuFEKxf_fu8QdgeTObUHqkFRLAMfpM"

export interface OrderCreationRequestProps {
    uid:string | undefined;
    pickUpLong:string | undefined;
    pickUpLat:string | undefined;
    pickUpResolvedAddress:string | undefined;
    desLong:string | undefined;
    desLat:string | undefined;
    desResolvedAddress:string | undefined ;
    type: 'Economy' | 'Comfort' | 'Luxury' | undefined;
    province:string | undefined;
    city:string | undefined;
    rideLength:string | undefined;
    rideTime:string | undefined;

}
