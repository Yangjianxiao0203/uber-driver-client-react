import { useState,useMemo,useCallback,useRef, useEffect } from "react";
import { GoogleMap,Marker,DirectionsRenderer,Circle,MarkerClusterer,useLoadScript } from "@react-google-maps/api";
import { type } from "os";
import "./styles.scss";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

//https://www.youtube.com/watch?v=2po9_CIRW7I&t=1312s
interface MapProps {
    start: LatLngLiteral | undefined;
    end: LatLngLiteral | undefined;
}

const MapHome = ({start,end}:MapProps) => {
    const {isLoaded,loadError} = useLoadScript({
        googleMapsApiKey: "AIzaSyAHlGuFEKxf_fu8QdgeTObUHqkFRLAMfpM",
        libraries: ["places"]
    });
    return (
        <>
            {isLoaded ? <Map start={start} end ={end}/> : <div>Loading...</div>}
        </>
    )
}

let currentPosition:LatLngLiteral;

const Map=({start,end}:MapProps)=>{
    const mapRef = useRef<google.maps.Map>();

    // const center:LatLngLiteral = useMemo(()=>({lat: 73.7563, lng: 10.5018}),[]);
    const options:MapOptions = useMemo(()=>({
        disableDefaultUI: true,
        clickableIcons: false,
    }),[])

    const onLoad = useCallback((map:google.maps.Map) => {
        mapRef.current = map;
    },[])

    const [directions, setDirections] = useState<DirectionsResult>();

    const fetchDirections = (start: LatLngLiteral | undefined,end: LatLngLiteral | undefined) => {
        if (!start || !end) return;
    
        const service = new google.maps.DirectionsService();
        service.route(
          {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result) {
              setDirections(result);
            }
          }
        );
      };

    useEffect(() => {
        const distance = directions?.routes[0].legs[0].distance?.text;
        const duration = directions?.routes[0].legs[0].duration?.text;
        console.log("distance: ",distance);
        console.log("duration: ",duration);
    },[directions])

    //get directions
    useEffect(() => {
        if (start && end) {
            fetchDirections(start, end);
        }
    }, [start, end]);

    return (
        <div className="map map-container">
            <GoogleMap
            zoom={10}
            mapContainerClassName="map-container"
            options={options}
            onLoad={onLoad}
            >
                {start && <Marker position={start} />}
                {end && <Marker position={end} />}
                {directions && (
                    <DirectionsRenderer
                    directions={directions}
                    options={{
                        polylineOptions: {
                        zIndex: 50,
                        strokeColor: "#1976D2",
                        strokeWeight: 3,
                        },
                    }}
                    />
                )}
            </GoogleMap>
        </div>
    )
}

export default MapHome;