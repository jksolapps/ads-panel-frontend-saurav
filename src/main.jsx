/** @format */

import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'tippy.js/dist/tippy.css';
import './style.css';
import './styles/DarkMode.css';
import './styles/TanStackTable.css';
import './styles/Main.css';
import './responsive.css';
import App from './App';
import DataContextProvider from './context/DataContext';
import ReportContextProvider from './context/ReportContext';
import ReactQueryProvider from './services/ReactQueryProvider';
import { GroupSettingsProvider } from './context/GroupSettingsContext';
import { AppListProvider } from './context/AppListContext';

ReactDOM.createRoot(document.getElementById('root')).render(
	<ReactQueryProvider>
		<DataContextProvider>
			<ReportContextProvider>
				<GroupSettingsProvider>
					<AppListProvider>
						<App />
					</AppListProvider>
				</GroupSettingsProvider>
			</ReportContextProvider>
		</DataContextProvider>
	</ReactQueryProvider>
);
