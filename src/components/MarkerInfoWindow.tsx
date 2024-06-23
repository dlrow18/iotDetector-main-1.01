import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonLabel, IonNote, IonRow } from '@ionic/react';
import React from 'react';
import { cameraOutline, locationOutline, warningOutline } from 'ionicons/icons';

interface Marker {
	lat: number;
	lng: number;
	address: string;
	type: string;
	level: string
  }

interface MarkerInfoWindowProps {
  marker: Marker;
  dismiss: () => void;
}

const MarkerInfoWindow: React.FC<MarkerInfoWindowProps> = ({ marker, dismiss }) => {
  return (
    <IonContent>
      <IonGrid className="ion-padding">
        <IonRow className="ion-justify-content-start ion-align-items-center">
          <IonCol size="2">
            <IonIcon icon={cameraOutline} color="primary" style={{ fontSize: "2rem" }} />
          </IonCol>
          <IonCol size="10">
            <IonLabel>
              <h2>Visual Data</h2>
            </IonLabel>
          </IonCol>
        </IonRow>
        <IonRow className="ion-padding-vertical">
          <IonCol>
            <IonLabel>Category:</IonLabel>
          </IonCol>
          <IonCol>
            <IonLabel>{marker.type}</IonLabel>
          </IonCol>
        </IonRow>
        <IonRow className="ion-padding-vertical">
          <IonCol>
            <IonLabel>Location:</IonLabel>
          </IonCol>
          <IonCol>
            <IonLabel>{marker.address}</IonLabel>
          </IonCol>
        </IonRow>
        <IonRow className="ion-padding-vertical">
          <IonCol>
            <IonLabel>Risk Level:</IonLabel>
          </IonCol>
          <IonCol>
            <IonLabel>{marker.level}</IonLabel>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default MarkerInfoWindow;