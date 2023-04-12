import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Routes/Login/Login';
import Callback from './Routes/Callback/Callback';
import Compare from './Routes/Compare/Compare';
import Auth from './Components/Auth/Auth';
import { UserStateProvider } from './Context/UserContext';
import './globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/compare',
    element: <Auth><Compare /></Auth>,
  },
  {
    path: '/callback',
    element: <Callback />,
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserStateProvider>
      <RouterProvider router={router} />
    </UserStateProvider>
  </React.StrictMode>,
);
