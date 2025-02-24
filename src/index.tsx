import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '../frontend/styles/main.scss';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import MainPage from './pages/MainPage';

library.add(fas)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <MainPage />
  </React.StrictMode>
);