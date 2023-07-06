import React, {useEffect,useState,useRef} from 'react';
import './styles.scss';

interface Position {
    lat: number;
    lng: number;
}

const GoogleMap = () => {
    const [currentPosition, setCurrentPosition] = useState<Position>({ lat: 0, lng: 0});
    const [pathCoordinates, setPathCoordinates] = useState<Position[]>([]);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const pathLineRef = useRef<google.maps.Polyline | null>(null);
    const positionWatcherRef = useRef<number | null>(null);

    const initMap = () => {
        const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            zoom: 4,
            center: currentPosition,
          });
        mapRef.current = map;

        const marker = new google.maps.Marker({
            position: currentPosition,
            map: map,
          });
        markerRef.current = marker;

        const pathLine = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: map,
          });
        pathLineRef.current = pathLine;
    }

    const startWatchingPosition = () => {
        if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser');
          return;
        }
    
        positionWatcherRef.current = window.setInterval(() => {
          navigator.geolocation.getCurrentPosition((position) => {
            const newCurrentPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
            setCurrentPosition(newCurrentPosition);
    
            if (markerRef.current && mapRef.current && pathLineRef.current) {
              markerRef.current.setPosition(newCurrentPosition);
              mapRef.current.setCenter(newCurrentPosition);
              setPathCoordinates((prevPathCoordinates) => [...prevPathCoordinates, newCurrentPosition]);
              pathLineRef.current.setPath(pathCoordinates);
            }
          }, () => {
            alert('Unable to retrieve your location');
          });
        }, 2000);
    };
    const stopWatchingPosition = () => {
        if (positionWatcherRef.current) {
            window.clearInterval(positionWatcherRef.current);
            positionWatcherRef.current = null;
        }
    };

    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAHlGuFEKxf_fu8QdgeTObUHqkFRLAMfpM`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
      
            script.onload = () => {
              initMap();
              startWatchingPosition();
            }
          } else {
            initMap();
            startWatchingPosition();
          }
        
        return () => {
        stopWatchingPosition();
        }
    },[])

    return (
        <>
            <h1>GoogleMap</h1>
            <div id='map'></div>
        </>
    );
}

export default GoogleMap;
