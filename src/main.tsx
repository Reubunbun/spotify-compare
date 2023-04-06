import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Routes/Login/Login';
import Callback from './Routes/Callback/Callback';
import Home from './Routes/Home/Home';
import { UserStateProvider } from './Context/UserContext';
import './globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/home',
    element: <Home />,
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
