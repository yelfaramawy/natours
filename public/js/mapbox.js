export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

  var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/mapbox/streets-v11',
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  // Create location marker
  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`Day ${loc.day} ${loc.description}`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });

  // Load the tour page from the header
  window.scrollTo(0, 0);
};
