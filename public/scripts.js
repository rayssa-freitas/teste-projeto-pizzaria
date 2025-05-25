let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 13
  });

  const searchBox = document.getElementById('searchBox');
  const autocomplete = new google.maps.places.Autocomplete(searchBox);
  autocomplete.bindTo("bounds", map);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    map.panTo(place.geometry.location);
    map.setZoom(14);
    searchAndDisplay();
  });

  map.addListener("idle", () => {
    searchAndDisplay();
  });
}

async function searchAndDisplay() {
  document.getElementById('loading').style.display = 'block';
  const bounds = map.getBounds();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const res = await fetch(`/api/places/viewport?north=${ne.lat()}&south=${sw.lat()}&east=${ne.lng()}&west=${sw.lng()}`);
  const data = await res.json();

  clearMarkers();
  const list = document.getElementById('placesList');
  list.innerHTML = '';

  if (data.fallback) {
    const warn = document.createElement('div');
    warn.innerHTML = "<b>⚠️ Nenhuma pizzaria dentro dos critérios.<br>Mostrando todas da região.</b><br><br>";
    list.appendChild(warn);
  }

  data.results.forEach(place => {
    const li = document.createElement('li');
    li.className = 'place-item';
    li.innerHTML = `<h3>${place.name}</h3>
      ⭐ ${place.rating} (${place.total_ratings} avaliações)<br>
      ${place.address}<br>
      <a href="${place.maps_url}" target="_blank">Ver no Google Maps</a>`;
    list.appendChild(li);

    const marker = new google.maps.Marker({
      position: place.location,
      map: map,
      title: place.name
    });
    markers.push(marker);
    marker.addListener('click', () => {
      map.panTo(marker.getPosition());
    });
  });

  document.getElementById('loading').style.display = 'none';
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

window.initMap = initMap;
