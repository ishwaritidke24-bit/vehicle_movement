const map = L.map("map").setView([19.985845, 73.723574], 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const busIcon = L.icon({
  iconUrl: "bus.png",
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

fetch("dummy-route.json")
  .then((response) => response.json())
  .then((data) => {
    const routeCoordinates = data.routeCoordinates.map(point => [
      point.latitude,
      point.longitude
    ]);

    const speed = data.speed || 700;
    L.marker(routeCoordinates[0]).addTo(map);
    L.marker(routeCoordinates[routeCoordinates.length - 1]).addTo(map);

    let traveledPath = [routeCoordinates[0]];
    const routeLine = L.polyline(traveledPath, { color: "red", weight: 5 }).addTo(map);
    map.fitBounds(routeCoordinates);

    const busMarker = L.marker(routeCoordinates[0], { icon: busIcon }).addTo(map);

    let index = 0;
    let isPaused = true; 

    function updateMetadata(pointIndex) {
      const point = routeCoordinates[pointIndex];
      document.getElementById("lat").innerText = point[0].toFixed(6);
      document.getElementById("lng").innerText = point[1].toFixed(6);
      document.getElementById("time").innerText = data.routeCoordinates[pointIndex].timestamp;
      document.getElementById("speed").innerText = speed;
    }

    function moveBus() {
      if (index < routeCoordinates.length && !isPaused) {
        const currentPoint = routeCoordinates[index];

        busMarker.setLatLng(currentPoint);
        traveledPath.push(currentPoint);
        routeLine.setLatLngs(traveledPath);
        updateMetadata(index);

        index++;
        setTimeout(moveBus, speed);
      }
    }

    document.getElementById("playBtn").addEventListener("click", () => {
      if (index >= routeCoordinates.length) return; 
      if (isPaused) {
        isPaused = false;
        moveBus();
      }
    });

    document.getElementById("pauseBtn").addEventListener("click", () => {
      isPaused = true;
    });
    updateMetadata(0);
  });
