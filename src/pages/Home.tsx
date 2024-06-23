/*
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,IonRow, IonCol, useIonViewWillEnter } from '@ionic/react';
import './Home.css';
import Map from '../components/GoogleMap';

const Home: React.FC = () => {

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRow>
            <IonCol>
              <Map />
            </IonCol>
          </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Home;
*/

// src/pages/Home.tsx
import React, { useState } from 'react';
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal } from '@ionic/react';
import Map from '../components/GoogleMap';
import NewPage from './MarkersList'; // 导入新页面组件
import './Home.css'; // 导入自定义样式

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <IonPage>
      <IonContent fullscreen className="ion-content">
        <Map />
        <IonButton
          style={{ 
            position: 'absolute', 
            top: '550px', 
            right: '10px', 
            zIndex: 10 
          }}
          onClick={() => setIsModalOpen(true)}
        >
          List
        </IonButton>
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <NewPage onClose={() => setIsModalOpen(false)} />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
