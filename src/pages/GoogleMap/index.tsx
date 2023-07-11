import React, {useEffect, useState, useRef} from 'react';
import './styles.scss';

interface Position {
    lat: number;
    lng: number;
}

interface GoogleMapProps {
    currentPosition: Position;
    pathCoordinates: Position[];
    startPosition: Position | null;
    endPosition: Position | null;
}

const GoogleMap = ({currentPosition, pathCoordinates, startPosition, endPosition}: GoogleMapProps) => {
    const mapRef = useRef<google.maps.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const startMarkerRef = useRef<google.maps.Marker | null>(null);
    const endMarkerRef = useRef<google.maps.Marker | null>(null);
    const pathLineRef = useRef<google.maps.Polyline | null>(null);
    const positionWatcherRef = useRef<number | null>(null);

    console.log("currentPosition: ",currentPosition);
    console.log("startPosition: ",startPosition);
    console.log("endPostion: ",endPosition);

    const initMap = () => {
        if (!mapContainerRef.current) return;  // Return if the map container is not mounted yet
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

        if (startPosition) {
            const startMarker = new google.maps.Marker({
                position: startPosition,
                map: map,
            });
            startMarkerRef.current = startMarker;
        }

        if (endPosition) {
            const endMarker = new google.maps.Marker({
                position: endPosition,
                map: map,
            });
            endMarkerRef.current = endMarker;
        }

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
            if (markerRef.current && mapRef.current && pathLineRef.current) {
                markerRef.current.setPosition(currentPosition);
                mapRef.current.setCenter(currentPosition);
                pathLineRef.current.setPath(pathCoordinates);
            }
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
                console.log("google map loading");
                initMap();
                startWatchingPosition();
            }
        } else {
            initMap();
            startWatchingPosition();
        }

        return () => {
            stopWatchingPosition();
        };
    },[]);

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setPosition(currentPosition);
        } else if (mapRef.current) {
            markerRef.current = new google.maps.Marker({
                position: currentPosition,
                map: mapRef.current,
            });
        }
    
        if (startMarkerRef.current && startPosition) {
            startMarkerRef.current.setPosition(startPosition);
        } else if (mapRef.current && startPosition) {
            startMarkerRef.current = new google.maps.Marker({
                position: startPosition,
                map: mapRef.current,
            });
        }
    
        if (endMarkerRef.current && endPosition) {
            endMarkerRef.current.setPosition(endPosition);
        } else if (mapRef.current && endPosition) {
            endMarkerRef.current = new google.maps.Marker({
                position: endPosition,
                map: mapRef.current,
            });
        }
    
        if (pathLineRef.current) {
            pathLineRef.current.setPath(pathCoordinates);
        } else if (mapRef.current) {
            pathLineRef.current = new google.maps.Polyline({
                path: pathCoordinates,
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: mapRef.current,
            });
        }
    }, [currentPosition, startPosition, endPosition, pathCoordinates]);
    

    return (
        <>
            <h1>GoogleMap</h1>
            <div ref={mapContainerRef} id='map'></div>
        </>
    );
}

export default GoogleMap;
