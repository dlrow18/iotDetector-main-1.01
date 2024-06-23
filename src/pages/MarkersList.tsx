import React from 'react';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons } from '@ionic/react';
import { markers } from '../data/index'; // Adjust the path as necessary
import './MarkersList.css'; // Optional: for styling

const MarkersList: React.FC = () => {
  return (
    <div className="markers-list">
      <ul>
        {markers.map((marker, index) => (
          <li key={index} className="marker-item">
            <h2>Devices {index + 1}</h2>
            <p><strong>Address:</strong> {marker.address}</p>
            <p><strong>Type:</strong> {marker.type}</p>
            <p><strong>Risk Level:</strong> {marker.level}</p>
            <p><strong>Latitude:</strong> {marker.lat}</p>
            <p><strong>Longitude:</strong> {marker.lng}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const NewPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>List of IoT Devices</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <MarkersList />
      </IonContent>
    </>
  );
};

export default NewPage;
