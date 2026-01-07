/* @format */
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import RequireAuth from './components/Layout/RequireAuth';
import AppDetails from './pages/AppDetails';
import Apps from './pages/Apps';
import Home from './pages/Home';
import Login from './pages/Login';
import Reports from './pages/Reports';
import PageNotFound from './pages/PageNotFound';
import Settings from './pages/Settings';
import Accounts from './pages/Accounts';
import AnalyticsContentBox from './components/AnalyticsComponents/AnalyticsContentBox';
import ErrorLog from './pages/ErrorLog';
import HeatMap from './pages/HeatMap';
import Campaign from './pages/Campaign';
import AnalyticsMain from './pages/AnalyticsMain';
import { DataContext } from './context/DataContext';
import { useContext, useLayoutEffect } from 'react';
import AppsCost from './pages/AppsCost';
import Retention from './pages/Retention';
import OneTimePassword from './pages/OneTimePassword';
import LogTable from './pages/LogTable';
import AppInsights from './pages/AppInsights';
import ArpuRaw from './pages/ArpuRaw';
import AnalyticsMonth from './pages/AnalyticsMonth';
import RequireRole from './components/Layout/RequireRole';
import ArpuMain from './pages/ArpuMain';
import GroupPage from './pages/GroupPage';

// Redirect component for app-insights to app-details
const AppInsightsRedirect = () => {
	const { id } = useParams();
	return <Navigate to={`/app-details/${id}`} replace />;
};

function App() {
	const { isDarkMode } = useContext(DataContext);
	useLayoutEffect(() => {
		if (isDarkMode) {
			root.classList.add('dark_mode');
			document.body.classList.add('dark-tippy');
			document.body.classList.add('dark_mode');
			localStorage.setItem('theme', 'dark');
		} else {
			root.classList.remove('dark_mode');
			document.body.classList.remove('dark-tippy');
			document.body.classList.remove('dark_mode');
			localStorage.setItem('theme', 'light');
		}
	}, [isDarkMode]);

	return (
		<>
			<BrowserRouter>
				<HelmetProvider>
					<Routes>
						<Route element={<RequireAuth />}>
							<Route path='/' element={<Home />} exact />
							<Route path='*' element={<PageNotFound />} />
							<Route path='/apps' element={<Apps />} />
							<Route path='/app-details/:id' element={<AppDetails />} />
							<Route path='/single-app-insights/:id' element={<AppInsightsRedirect />} />
							<Route path='/reports' element={<Reports />} />
							<Route path='/settings' element={<Settings />} />
							<Route path='/accounts' element={<Accounts />} />
							<Route path='/apps-cost' element={<AppsCost />} />
							<Route element={<RequireRole />}>
								<Route path='/analytics' element={<AnalyticsMain />} />
								<Route path='/cohort' element={<AnalyticsMonth />} />
								<Route path='/heatmap' element={<HeatMap />} />
								<Route path='/campaign' element={<Campaign />} />
								<Route path='/error-logs' element={<ErrorLog />} />
								<Route path='/logs' element={<LogTable />} />
								<Route path='/analytics-settings' element={<AnalyticsContentBox />} />
								<Route path='/retention' element={<Retention />} />
								<Route path='/arpu' element={<ArpuMain />} />
								<Route path='/arpu-raw' element={<ArpuRaw />} />
								<Route path='/app-insights' element={<AppInsights />} />
								<Route path='/group-settings' element={<GroupPage />} />
							</Route>
						</Route>
						<Route path='/login' element={<Login />} />
						<Route path='/otp-verification' element={<OneTimePassword />} />
					</Routes>
				</HelmetProvider>
			</BrowserRouter>
		</>
	);
}

export default App;
