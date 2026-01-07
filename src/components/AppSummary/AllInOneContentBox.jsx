/** @format */

import React, { useEffect, useMemo, useState } from 'react';
import useStickyOnScroll from '../../hooks/useStickyOnScroll';
import GeneralDateRange from '../GeneralFilters/GeneralDateRange';
import moment from 'moment';
import { Spinner } from 'react-bootstrap';
import PerformanceCalendarHeatmap from './PerformanceCalendarHeatmap';
import AllInOneAnalyticsOverview from './AllInOneAnalyticsOverview';
import AllInOneMetricsGraph from './AllInOneMetricsGraph';
import GeneralGroupBy from '../GeneralFilters/GeneralGroupBy';
import AllInOneRetentionOverview from './AllInOneRetentionOverview';
import RetentionOverview from './RetentionOverview';

const AllInOneContentBox = () => {
	const [mainData, setMainData] = useState([]);
	const [fetchFlags, setFetchFlags] = useState(false);
	const [mainLoader, setMainLoader] = useState(false);
	const [innerLoader, setInnerLoader] = useState(false);
	const [groupBy, setGroupBy] = useState('1'); // '1' = Date, '2' = Country, '3' = App Version

	//date filter
	const [filterDate, setFilterDate] = useState(() => {
		const stored = sessionStorage.getItem('allInOne_date_range');
		return stored ? JSON.parse(stored) : [];
	});
	const [isDateClicked, setIsDateClicked] = useState(false);

	//app filter
	const [filterAppList, setFilterAppList] = useState(() => {
		const stored = sessionStorage.getItem('allInOne_app_list');
		return stored ? JSON.parse(stored) : [];
	});

	const [filteredApp, setFilteredApp] = useState(() => {
		const stored = sessionStorage.getItem('allInOne_app_list');
		return stored ? JSON.parse(stored) : [];
	});

	// Memoized Values
	const selectedStartDate = useMemo(
		() => (filterDate[0]?.startDate ? moment(filterDate[0].startDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);
	const selectedEndDate = useMemo(
		() => (filterDate[0]?.endDate ? moment(filterDate[0].endDate).format('DD/MM/YYYY') : ''),
		[filterDate]
	);

	const { addClass } = useStickyOnScroll({ topSpace: 15 });

	const data = [
		{
			installDate: '2025-05-15',
			revenue: 1050,
			cost: 820,
			roas: 0.28,
			matchedRate: '91%',
			showRate: '86%',
			str: '5.3%',
			impression: 10500,
			clicks: 520,
			request: 1000,
			day1: { percent: '100.00%', users: '8750' },
			day2: { percent: '14.20%', users: '1243' },
			day3: { percent: '10.50%', users: '919' },
			day4: { percent: '9.10%', users: '796' },
			day5: { percent: '8.20%', users: '717' },
			day6: { percent: '7.80%', users: '682' },
			day7: { percent: '6.90%', users: '604' },
			day8: { percent: '6.00%', users: '525' },
			day9: { percent: '5.20%', users: '455' },
			day10: { percent: '4.50%', users: '394' },
			day11: { percent: '3.80%', users: '332' },
			day12: { percent: '3.20%', users: '280' },
			day13: { percent: '2.70%', users: '236' },
			day14: { percent: '2.30%', users: '201' },
			day15: { percent: '2.00%', users: '175' },
		},
		{
			installDate: '2025-05-16',
			revenue: 1150,
			cost: 870,
			roas: 1.32,
			matchedRate: '92%',
			showRate: '87%',
			str: '5.7%',
			impression: 11500,
			clicks: 570,
			request: 1200,
			day1: { percent: '100.00%', users: '9100' },
			day2: { percent: '13.90%', users: '1265' },
			day3: { percent: '10.30%', users: '937' },
			day4: { percent: '9.50%', users: '865' },
			day5: { percent: '8.40%', users: '764' },
			day6: { percent: '7.60%', users: '692' },
			day7: { percent: '6.70%', users: '610' },
			day8: { percent: '5.90%', users: '537' },
			day9: { percent: '5.10%', users: '464' },
			day10: { percent: '4.40%', users: '400' },
			day11: { percent: '3.70%', users: '337' },
			day12: { percent: '3.10%', users: '282' },
			day13: { percent: '2.60%', users: '237' },
			day14: { percent: '2.20%', users: '200' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-17',
			revenue: 1000,
			cost: 790,
			roas: 1.27,
			matchedRate: '90%',
			showRate: '85%',
			str: '5.0%',
			impression: 10000,
			clicks: 500,
			request: 900,
			day1: { percent: '100.00%', users: '8600' },
			day2: { percent: '14.50%', users: '1247' },
			day3: { percent: '10.80%', users: '929' },
			day4: { percent: '9.20%', users: '791' },
			day5: { percent: '8.10%', users: '697' },
			day6: { percent: '7.50%', users: '645' },
			day7: { percent: '6.60%', users: '568' },
			day8: { percent: '5.80%', users: '499' },
			day9: { percent: '5.00%', users: '430' },
			day10: { percent: '4.30%', users: '370' },
			day11: { percent: '3.60%', users: '310' },
			day12: { percent: '3.00%', users: '258' },
			day13: { percent: '2.50%', users: '215' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-18',
			revenue: 1200,
			cost: 900,
			roas: 1.33,
			matchedRate: '92%',
			showRate: '88%',
			str: '5.8%',
			impression: 12000,
			clicks: 600,
			request: 1100,
			day1: { percent: '100.00%', users: '9200' },
			day2: { percent: '13.80%', users: '1270' },
			day3: { percent: '10.40%', users: '957' },
			day4: { percent: '9.30%', users: '856' },
			day5: { percent: '8.30%', users: '764' },
			day6: { percent: '7.40%', users: '681' },
			day7: { percent: '6.50%', users: '598' },
			day8: { percent: '5.70%', users: '524' },
			day9: { percent: '4.90%', users: '451' },
			day10: { percent: '4.20%', users: '386' },
			day11: { percent: '3.50%', users: '322' },
			day12: { percent: '2.90%', users: '267' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-19',
			revenue: 1100,
			cost: 850,
			roas: 1.29,
			request: 1300,
			matchedRate: '91%',
			showRate: '86%',
			str: '5.5%',
			impression: 11000,
			clicks: 550,
			day1: { percent: '100.00%', users: '8800' },
			day2: { percent: '14.60%', users: '1285' },
			day3: { percent: '10.70%', users: '942' },
			day4: { percent: '9.40%', users: '827' },
			day5: { percent: '8.20%', users: '722' },
			day6: { percent: '7.30%', users: '642' },
			day7: { percent: '6.40%', users: '563' },
			day8: { percent: '5.60%', users: '493' },
			day9: { percent: '4.80%', users: '422' },
			day10: { percent: '4.10%', users: '361' },
			day11: { percent: '3.40%', users: '299' },
			day12: { percent: '', users: '' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-20',
			revenue: 1250,
			cost: 920,
			roas: 0.36,
			request: 1400,
			matchedRate: '93%',
			showRate: '89%',
			str: '6.0%',
			impression: 12500,
			clicks: 620,
			day1: { percent: '100.00%', users: '9300' },
			day2: { percent: '14.00%', users: '1302' },
			day3: { percent: '10.60%', users: '986' },
			day4: { percent: '9.20%', users: '856' },
			day5: { percent: '8.10%', users: '753' },
			day6: { percent: '7.20%', users: '670' },
			day7: { percent: '6.30%', users: '586' },
			day8: { percent: '5.50%', users: '512' },
			day9: { percent: '4.70%', users: '437' },
			day10: { percent: '4.00%', users: '372' },
			day11: { percent: '', users: '' },
			day12: { percent: '', users: '' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-21',
			revenue: 950,
			cost: 740,
			roas: 1.28,
			request: 1500,
			matchedRate: '90%',
			showRate: '85%',
			str: '5.1%',
			impression: 9500,
			clicks: 470,
			day1: { percent: '100.00%', users: '8700' },
			day2: { percent: '14.30%', users: '1244' },
			day3: { percent: '10.50%', users: '914' },
			day4: { percent: '9.10%', users: '791' },
			day5: { percent: '8.00%', users: '696' },
			day6: { percent: '7.10%', users: '618' },
			day7: { percent: '6.20%', users: '539' },
			day8: { percent: '5.40%', users: '470' },
			day9: { percent: '4.60%', users: '400' },
			day10: { percent: '', users: '' },
			day11: { percent: '', users: '' },
			day12: { percent: '', users: '' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-22',
			revenue: 1080,
			cost: 830,
			roas: 1.3,
			request: 1600,
			matchedRate: '91%',
			showRate: '86%',
			str: '5.4%',
			impression: 10800,
			clicks: 530,
			day1: { percent: '100.00%', users: '8900' },
			day2: { percent: '14.10%', users: '1255' },
			day3: { percent: '10.40%', users: '926' },
			day4: { percent: '9.00%', users: '801' },
			day5: { percent: '7.90%', users: '703' },
			day6: { percent: '7.00%', users: '623' },
			day7: { percent: '6.10%', users: '543' },
			day8: { percent: '5.30%', users: '472' },
			day9: { percent: '', users: '' },
			day10: { percent: '', users: '' },
			day11: { percent: '', users: '' },
			day12: { percent: '', users: '' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-23',
			revenue: 1000,
			cost: 800,
			roas: 1.25,
			request: 1700,
			matchedRate: '90%',
			showRate: '85%',
			str: '5.0%',
			impression: 10000,
			clicks: 500,
			day1: { percent: '100.00%', users: '8646' },
			day2: { percent: '13.69%', users: '1184' },
			day3: { percent: '9.82%', users: '849' },
			day4: { percent: '8.94%', users: '773' },
			day5: { percent: '8.10%', users: '700' },
			day6: { percent: '8.08%', users: '699' },
			day7: { percent: '7.14%', users: '617' },
			day8: { percent: '3.55%', users: '307' },
			day9: { percent: '', users: '' },
			day10: { percent: '', users: '' },
			day11: { percent: '', users: '' },
			day12: { percent: '', users: '' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-24',
			revenue: 1200,
			cost: 900,
			roas: 1.33,
			request: 1800,
			matchedRate: '92%',
			showRate: '88%',
			str: '6.0%',
			impression: 12000,
			clicks: 600,
			day1: { percent: '100.00%', users: '9222' },
			day2: { percent: '13.61%', users: '1255' },
			day3: { percent: '10.61%', users: '978' },
			day4: { percent: '9.40%', users: '867' },
			day5: { percent: '8.28%', users: '764' },
			day6: { percent: '7.47%', users: '689' },
			day7: { percent: '3.72%', users: '343' },
			day8: { percent: '', users: '' },
			day9: { percent: '', users: '' },
			day10: { percent: '', users: '' },
			day11: { percent: '', users: '' },
			day12: { percent: '', users: '' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
		{
			installDate: '2025-05-25',
			revenue: 1100,
			cost: 850,
			roas: 0.29,
			matchedRate: '91%',
			showRate: '86%',
			str: '5.5%',
			impression: 11000,
			clicks: 550,
			day1: { percent: '100.00%', users: '8864' },
			day2: { percent: '14.65%', users: '1296' },
			day3: { percent: '10.67%', users: '946' },
			day4: { percent: '9.34%', users: '828' },
			day5: { percent: '8.03%', users: '712' },
			day6: { percent: '3.90%', users: '346' },
			day7: { percent: '', users: '' },
			day8: { percent: '', users: '' },
			day9: { percent: '', users: '' },
			day10: { percent: '', users: '' },
			day11: { percent: '', users: '' },
			day12: { percent: '', users: '' },
			day13: { percent: '', users: '' },
			day14: { percent: '', users: '' },
			day15: { percent: '', users: '' },
		},
	];

	const [retentionCheckedApp, setRetentionCheckedApp] = useState(() => {
		const stored = sessionStorage.getItem('allIneOne_app_filter');
		return stored ? JSON.parse(stored) : [];
	});
	const isSingleAppSelected = useMemo(() => retentionCheckedApp?.length == 1, [retentionCheckedApp]);

	const [dimensionFilterList] = useState([
		{
			id: 1,
			name: 'Date',
			value: 'date',
			item_checked: true,
		},
		{
			id: 2,
			name: 'Country',
			value: 'country',
			item_checked: false,
		},
		{
			id: 3,
			name: 'App Version',
			value: 'app_version',
			item_checked: false,
		},
	]);
	const [checkedDimension, setCheckedDimension] = useState('');

	return (
		<div className={`right-box-wrap allInOne_wrap`}>
			<div className='table-box-wrap main-box-wrapper pdglr24 calendar_page heatmap_calendar revenue_dashboard'>
				<div className='userBoxWrap user-section-wrapper'>
					<div className='popup-full-wrapper reports-popup-box active analytics-page-topbar'>
						<div className={`action-bar-container report-page-topbar ${addClass ? 'sticky_filter' : ''}`}>
							<div className='middle-section'>
								<div className='filter-bar-wrap'>
									<div className='filter-box revenue_filter analytics-filter-box'>
										<GeneralDateRange
											uniqueIdentifier={'allInOne'}
											selectedStartDate={selectedStartDate}
											selectedEndDate={selectedEndDate}
											setIsTableLoaderVisible={setMainLoader}
											setMainDate={setFilterDate}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
											isDateClicked={isDateClicked}
											setIsDateClicked={setIsDateClicked}
										/>

										<GeneralGroupBy
											uniqueIdentifier={'allInOne'}
											filterName='Dimension'
											groupByFilterList={dimensionFilterList}
											groupBy={checkedDimension}
											setGroupBy={setCheckedDimension}
											setIsTableLoaderVisible={setMainLoader}
											fetchFlags={fetchFlags}
											setFetchFlags={setFetchFlags}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='popup-full-box form-box-wrap form-wizard'>
							<div className={`popup-box-wrapper report-table-popup-box`}>
								<>
									{innerLoader && (
										<div className='shimmer-spinner overlay-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									)}
									{1 !== 1 ? (
										<div className='shimmer-spinner'>
											<Spinner animation='border' variant='secondary' />
										</div>
									) : (
										<div className={`box-wrapper`}>
											<div className='table_heatmap_wrap'>
												<AllInOneAnalyticsOverview groupBy={groupBy} />
												{/* <AllInOneRetentionOverview data={data} /> */}
												<RetentionOverview data={data} />
												<AllInOneMetricsGraph data={data} />
												<PerformanceCalendarHeatmap
													startDate={selectedStartDate}
													endDate={selectedEndDate}
													data={data}
												/>
											</div>
										</div>
									)}
								</>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AllInOneContentBox;
