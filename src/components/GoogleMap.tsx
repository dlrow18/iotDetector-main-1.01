import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap } from '@capacitor/google-maps';
import { useIonModal, useIonViewWillEnter } from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics } from '@capacitor/haptics';
import { IonButton, IonIcon, IonInput } from '@ionic/react';
import { markers } from '../data/index'; 
import MarkerInfoWindow from './MarkerInfoWindow';
import { compassOutline, chevronForwardOutline,arrowUpOutline, arrowDownOutline, arrowBackOutline, arrowForwardOutline, reloadOutline } from 'ionicons/icons';
import './GoogleMap.css';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CustomToast.css';
import {  cameraOutline,
  micOutline,
  fingerPrintOutline,
  scanCircleOutline,
  menuOutline,
  manOutline,
} from "ionicons/icons";

interface Marker {
  lat: number;
  lng: number;
  address: string;
  type: string;
  level: string;
}

const deviceTypes = [
  { type: "camera", icon: cameraOutline},
  { type: "microphone", icon: micOutline},
  { type: "face", icon: scanCircleOutline },
  { type: "biometric", icon: fingerPrintOutline },
  { type: "other", icon: menuOutline }
];

const Map: React.FC = () => {
  const apiKey = "Your_GoogleMap_API_Key"; 
  const mapRef = useRef<HTMLElement>(null);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [address, setAddress] = useState('');
  const [figurePosition, setFigurePosition] = useState({ lat: 52.517991150833616, lng: 13.393885758339065 });
  // const [figureMarker, setFigureMarker] = useState<Marker | null>(null);
  const [markerIds, setMarkerIds] = useState<string[]>([]);
  const [isFilteredView, setIsFilteredView] = useState(false);
  const [filteredMarkers, setFilteredMarkers] = useState<Marker[]>([]);


  const [presentMarkerInfo, dismissMarkerInfo] = useIonModal(MarkerInfoWindow, {
    marker: selectedMarker,
    dismiss: () => dismissMarkerInfo(),
  });

  const modalOptions = {
    initialBreakpoint: 0.4,
    breakpoints: [0, 0.4, 1],
    backdropBreakpoint: 0,
    onDidDismiss: () => dismissMarkerInfo()
  };

  const [mapConfig, setMapConfig] = useState({
    zoom: 16,
    center: {
      lat: 52.517991150833616,
      lng: 13.393885758339065
    }
  });

  const createMap = async () => {
    if (!mapRef.current) return;

    try {
      const newMap = await GoogleMap.create({
        id: "google-map",
        element: mapRef.current,
        apiKey: apiKey,
        config: mapConfig
      });

      loadMarkers(newMap, markers);

      newMap.setOnMarkerClickListener((marker) => {
        const selected = markers.find(m => m.lat === marker.latitude && m.lng === marker.longitude);
        if (selected) {
          setSelectedMarker(selected);
          centerMapOnClickedMarker(selected.lat, selected.lng);
          presentMarkerInfo(modalOptions);
          handleRiskLevel(selected.level, selected);
        }
      });
      
      /*
      // Add figure marker
      const figure = newMap.addMarker({
        coordinate: figurePosition,
        title: 'Figure',
        iconUrl: manOutline,
        iconSize: new google.maps.Size(60, 60),
        iconAnchor: new google.maps.Point(figurePosition.lat, figurePosition.lng),
      });
      */

      setMap(newMap);
    } catch (err) {
      console.error("Error creating map:", err);
    }
  };

  const loadMarkers = async (map: GoogleMap, markers: Marker[]) => {
    // Remove existing markers
    await removeAllMarkers(map);

    const newMarkerIds = [];
    for (const marker of markers) {
      const addedMarker = await map.addMarker({
        coordinate: {
          lat: marker.lat,
          lng: marker.lng
        },
        title: marker.address,
        snippet: `Type: ${marker.type}, Level: ${marker.level}`
      });
      newMarkerIds.push(addedMarker);
    }
    setMarkerIds(newMarkerIds);
  };

  const removeAllMarkers = async (map: GoogleMap) => {
    for (const id of markerIds) {
      await map.removeMarker(id);
    }
    setMarkerIds([]);
  };

  const handleRiskLevel = (level: string, marker: Marker) => {
    const showMarkerInfo = () => {
      setSelectedMarker(marker);
      presentMarkerInfo(modalOptions);
    };

    const toastContent = (
      <div className="toast-content">
        <p className="toast-message">The risk level is {level}</p>
        <IonButton onClick={showMarkerInfo} className="details-button">
          <IonIcon icon={chevronForwardOutline} />
        </IonButton>
      </div>
    );

    const toastOptions = {
      autoClose: false as false,
      closeOnClick: true,
      hideProgressBar: true,
      draggable: true
    };

    switch (level) {
      case 'low':
        toast.info(toastContent, {
          ...toastOptions,
          position: "top-center"
        });
        break;
      case 'middle':
        toast.warning(toastContent, {
          ...toastOptions,
          position: "top-center"
        });
        const audio = new Audio('/assets/new-notification.mp3'); 
        audio.play();
        break;
      case 'high':
        toast.error(toastContent, {
          ...toastOptions,
          position: "top-center"
        });
        Haptics.vibrate({ duration: 1000 });
        break;
      default:
        toast.info(toastContent, {
          ...toastOptions,
          position: "top-center"
        });
        break;
    }
  };

  const centerMapOnCurrentLocation = async () => {
    const position = await Geolocation.getCurrentPosition();
    const { latitude, longitude } = position.coords;

    if (map) {
      await map.setCamera({
        coordinate: {
          lat: latitude,
          lng: longitude
        },
        zoom: 16
      });
    }
  };

  const centerMapOnClickedMarker = async (lat: number, lng: number) => {
    if (map) {
      await map.setCamera({
        coordinate: {
          lat: lat,
          lng: lng
        },
        zoom: 16
      });
    }
  };

  const addMarker = async (lat: number, lng: number) => {
    if (map) {
      const addedMarker = await map.addMarker({
        coordinate: {
          lat,
          lng
        },
        title: 'New Marker',
        snippet: 'New marker added by search',
      });
      setMarkerIds((prev) => [...prev, addedMarker]);

      const distances = markers.map(marker => {
        const distance = calculateDistance(lat, lng, marker.lat, marker.lng);
        return { ...marker, distance };
      });

      distances.forEach(marker => {
        toast.info(`Distance to ${marker.address}: ${marker.distance.toFixed(2)} km`, {
          position: "top-center",
          autoClose: 5000
        });
        if (marker.distance < 0.5) { // Check if distance is less than 500 meters
          handleRiskLevel(marker.level, marker);
        }
      });

      setMapConfig(prev => ({
        ...prev,
        center: { lat, lng }
      }));
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (value: number) => value * Math.PI / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const handleSearch = async () => {
    if (address.trim() === '') return;

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        addMarker(lat, lng);
      } else {
        toast.error('Address not found');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Error finding address');
    }
  };

  /*
  const moveFigure = async (direction: string) => {
    const stepSize = 0.1; // Adjust the step size as needed
    let { lat, lng } = figurePosition;

    switch (direction) {
      case 'up':
        lat += stepSize;
        break;
      case 'down':
        lat -= stepSize;
        break;
      case 'left':
        lng -= stepSize;
        break;
      case 'right':
        lng += stepSize;
        break;
    }

    setFigurePosition({ lat, lng });

    if (map) {
      const figure = await map.addMarker({
        coordinate: { lat, lng },
        title: 'Figure',
        iconUrl: manOutline,
        iconSize: new google.maps.Size(60, 60),
        iconAnchor: new google.maps.Point(figurePosition.lat, figurePosition.lng),
      });

      // Check distance to existing markers
      markers.forEach(marker => {
        const distance = calculateDistance(lat, lng, marker.lat, marker.lng);
        if (distance < 0.5) {
          handleRiskLevel(marker.level, marker);
        }
      });
    }
  };
  */

  const filterMarkers = (type: string) => {
    const filtered = markers.filter(marker => marker.type === type);
    setFilteredMarkers(filtered);
    setIsFilteredView(true);
    loadMarkers(map!, filtered); 
  };

  useIonViewWillEnter(() => {
    createMap();
  });

  const BottomSheet = () => (
    <div className="bottom-sheet">
      {isFilteredView ? (
        <div>
          <IonButton onClick={() => setIsFilteredView(false)} style={{ marginBottom: "10px" }}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <div style={{ marginTop: "20px" }}>
            <h3>Filtered Devices</h3>
            <ul>
              {filteredMarkers.map((marker) => (
                <li key={marker.address}>
                Location: {marker.address}
                <br />
                Risk Level: {marker.level}
              </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gridTemplateRows: "repeat(2, auto)", 
          gap: "10px", 
          justifyItems: "center"
        }}>
          {deviceTypes.map((device) => (
            <IonButton key={device.type} onClick={() => filterMarkers(device.type)}>
              <IonIcon icon={device.icon} />
            </IonButton>
          ))}
          <IonButton onClick={() => loadMarkers(map!, markers)}>
            <IonIcon icon={reloadOutline} />
          </IonButton>
        </div>
      )}
    </div>
  );
  return (
    <div className="map-container">
      <capacitor-google-map
        ref={mapRef}
        style={{
            display: 'inline-block',
            width: "100%",
            height: "90%"
          }}
      ></capacitor-google-map>
      <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', top: '10px', width: '100%', zIndex: 10 }}>
        <IonInput
          value={address}
          placeholder="Enter your address"
          onIonChange={(e) => setAddress(e.detail.value!)}
          style={{ width: '300px', backgroundColor: 'white' }}
        />
        <IonButton onClick={handleSearch} style={{ marginLeft: '10px' }}>
          Search
        </IonButton>
      </div>
      <IonButton
        style={{ position: 'absolute', bottom: '200px', right: '10px', zIndex: 10 }}
        onClick={centerMapOnCurrentLocation}
      >
        <IonIcon icon={compassOutline} />
      </IonButton>

      {/*
      <div style={{ position: 'absolute', bottom: '100px', right: '10px', zIndex: 10 }}>
        <IonButton onClick={() => moveFigure('up')}><IonIcon icon={arrowUpOutline} /></IonButton>
        <IonButton onClick={() => moveFigure('down')}><IonIcon icon={arrowDownOutline} /></IonButton>
        <IonButton onClick={() => moveFigure('left')}><IonIcon icon={arrowBackOutline} /></IonButton>
        <IonButton onClick={() => moveFigure('right')}><IonIcon icon={arrowForwardOutline} /></IonButton>
      </div>
      */}
      
      <ToastContainer transition={Slide}/>
      <BottomSheet />
    </div>
  );
};

export default Map;