import { useState,useMemo,useCallback,useRef, useEffect } from "react";
import { GoogleMap,Marker,DirectionsRenderer,Circle,MarkerClusterer,useLoadScript } from "@react-google-maps/api";
import SearchBox from "./components/SearchBox";
import "./styles.scss";
import Distance from "./components/Distance";
import { googleAPIKey } from "../../constant";
import { OrderCreationRequestProps } from "../../constant";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

//https://www.youtube.com/watch?v=2po9_CIRW7I&t=1312s

interface MapProps {
    start: LatLngLiteral | undefined;
    end: LatLngLiteral | undefined;
    setStart: (position: LatLngLiteral | undefined) => void;
    setEnd: (position: LatLngLiteral | undefined) => void;
    ride?: OrderCreationRequestProps;
}

const MapHome = ({start,end,setStart,setEnd,ride}:MapProps) => {
    const {isLoaded,loadError} = useLoadScript({
        googleMapsApiKey: googleAPIKey,
        libraries: ["places"]
    });
    return (
        <>
            {isLoaded ? <Map start={start} end={end} setStart={setStart} setEnd={setEnd} ride={ride}/> : <div>Loading...</div>}
        </>
    )
}


const Map = ({start,end,setStart,setEnd,ride}:MapProps) => {
  const [selectedPoint, setSelectedPoint] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();

  const mapRef = useRef<google.maps.Map>();

  const options = useMemo<MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
    }),[]
  );
  const onLoad = useCallback((map:google.maps.Map) => {mapRef.current = map}, []);

  const fetchDirections = (start: LatLngLiteral | undefined,end:LatLngLiteral | undefined) => {
    if (!end || !start) return;

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
  //if selected directly on the map
  useEffect(()=>{
    if(selectedPoint){
      if(!start){
        setStart(selectedPoint);
      }else if(!end){
        setEnd(selectedPoint);
      }
    }
  },[selectedPoint])

  //auto set direction when start and end are set
  useEffect(()=>{
    fetchDirections(start,end)
  },[start,end])

  //set up ride after direction is set
  useEffect(()=>{
    modifyRide(ride);
  },[directions])

  const modifyRide = (ride:OrderCreationRequestProps | undefined) => {
    if(start==null || end == null || ride===undefined ) {return;}
    ride.pickUpLong=start?.lng?.toString();
    ride.pickUpLat=start?.lat?.toString();
    ride.desLong=end?.lng?.toString();
    ride.desLat=end?.lat?.toString();
    ride.pickUpResolvedAddress = directions?.routes[0].legs[0].start_address;
    ride.desResolvedAddress = directions?.routes[0].legs[0].end_address;
    const dirArray = directions?.routes[0].legs[0].start_address.split(',');
    ride.city = dirArray?dirArray[1].trim() : undefined;
    ride.province = dirArray?dirArray[2].trim().split(" ")[0] : undefined;
    ride.rideLength = directions?.routes[0].legs[0].distance?.value.toString();
  }

  //get current position for centering the map
  const [center, setCenter] = useState<LatLngLiteral>()
    useEffect(()=>{
        navigator.geolocation.getCurrentPosition((position)=>{
            const currentPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
            setCenter(currentPosition);
        })
    },[])


  return (
    <div className="container">
      <div className="controls">
        <h3>From:</h3>
        <SearchBox
          setPlace={(position) => {
            setStart(position);
            mapRef.current?.panTo(position);
          }}
        />
        <h3>To:</h3>
        <SearchBox
          setPlace={(position) => {
            setEnd(position);
          }}
        />
        {}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
      </div>
      <div className="map">
        <GoogleMap
          zoom={14}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
          onClick={(e)=>{
            setSelectedPoint(e.latLng!.toJSON())
          }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}
          {start && 
          <Marker position={start} onClick={()=>setStart(undefined)}></Marker>}
          {end && <Marker position={end} onClick={()=>{setEnd(undefined)}}></Marker>}
        </GoogleMap>
      </div>
    </div>
  );
}

export default MapHome;