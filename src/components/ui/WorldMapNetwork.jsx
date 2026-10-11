import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const getMarkerIcon = (universeId) => {
  let color = '#4a2e1b'; 
  if (universeId === 'maracatu') color = '#d2691e';
  else if (universeId === 'samba') color = '#10b981';
  else if (universeId === 'batucada') color = '#06b6d4';
  else if (universeId === 'sambareggae') color = '#f59e0b';
  else if (universeId === 'capoeira') color = '#ef4444';

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32px" height="32px" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-md">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker bg-transparent border-none',
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function AutoFitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !markers || markers.length === 0) return;

    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 6, { animate: true });
    } else {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [map, markers]);

  return null;
}

export default function WorldMapNetwork({ associations = [] }) {
  const validAssociations = associations.filter(assoc => assoc.location?.lat && assoc.location?.lng);
  const markers = validAssociations.map(assoc => ({ lat: assoc.location.lat, lng: assoc.location.lng }));

  return (
    <div className="w-full h-80 md:h-96 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative z-0">
      <MapContainer 
        center={[48, 2]} 
        zoom={validAssociations.length > 0 ? 5 : 2} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <AutoFitBounds markers={markers} />
        {validAssociations.map(assoc => (
          <Marker 
            key={`marker-${assoc.id}`} 
            position={[assoc.location.lat, assoc.location.lng]}
            icon={getMarkerIcon(assoc.universeId)}
          >
            <Popup className="rounded-xl">
              <div className="font-sans">
                <p className="font-bold text-[#4a2e1b] m-0 text-sm mb-1">{assoc.name || assoc.nom || 'Association'}</p>
                {assoc.city && <p className="text-xs text-gray-500 m-0 mb-2">{assoc.city}</p>}
                <a 
                  href={
                    (assoc.customDomains && assoc.customDomains.length > 0) ? (assoc.customDomains[0].startsWith('http') ? assoc.customDomains[0] : `https://${assoc.customDomains[0]}`) :
                    assoc.customDomain ? (assoc.customDomain.startsWith('http') ? assoc.customDomain : `https://${assoc.customDomain}`) :
                    assoc.website ? (assoc.website.startsWith('http') ? assoc.website : `https://${assoc.website}`) :
                    `https://mostrador.o-girador.com/?tenant=${encodeURIComponent(assoc.id)}`
                  } 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-bold text-[#d2691e] hover:text-[#b05819]"
                >
                  Voir la vitrine →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
