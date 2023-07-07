export const sortRides = (rides,currentLat, currentLon) => {
    return rides.sort((a, b) => {
        const coorA= a.startPointCoordinates.split(",");
        const coorB= b.startPointCoordinates.split(",");
        const distA = distance(coorA[0], coorA[1], currentLat, currentLon);
        const distB = distance(coorB[0], coorB[1], currentLat, currentLon);
        return distA - distB;
    });
}


export const distance = (lat1, lon1, lat2, lon2) => {
    lat1 = parseFloat(lat1);
    lon1 = parseFloat(lon1);
    lat2 = parseFloat(lat2);
    lon2 = parseFloat(lon2);
    return Math.sqrt(Math.pow(lat1-lat2,2)+Math.pow(lon1-lon2,2));
}