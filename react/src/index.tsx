import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '../src/styles/main.scss';
import DeadlinesOrganizer from './DeadlinesOrganizer';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <DeadlinesOrganizer />
  </React.StrictMode>
);