import React from 'react';
import { Outlet } from 'react-router-dom';
import TwgoldManagerNav from '../Nav/TwgoldManagerNav';
import '../TwgoldManager.css'


const ManagerLayout = () => {

  return (
    <>
      <TwgoldManagerNav />
      <main className="twgold_manager_content">
        <Outlet />
      </main>
    </>
  );
};

export default ManagerLayout;
