/** @format */
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';

const RequireRole = () => {
	const { role } = React.useContext(DataContext);
	const location = useLocation();

	if (role != 1) return <Navigate to='/' replace state={{ from: location }} />;

	return <Outlet />;
};

export default RequireRole;
