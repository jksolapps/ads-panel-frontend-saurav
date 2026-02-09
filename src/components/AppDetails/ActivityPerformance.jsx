/** @format */

import React, { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { MdHelpOutline } from 'react-icons/md';
import { Link, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import CanvasChartItem from '../ChartComponents/AreaChartSmall';
import {
	calculateDifferenceAndPercentage,
	calculateTotals,
	microValueConvert,
} from '../../utils/helper';
import UserMetricsPerformance from './UserMetricsPerformance';
import { useQueryFetch } from '../../hooks/useQueryFetch';

const ActivityPerformance = ({
	appInfo,
	overviewSelect,
	isAppLoaderVisible,
	setIsAppLoaderVisible,
}) => {
	const { id } = useParams();

	const [activityPerformanceData, setActivityPerformanceData] = useState([]);
	const [calculatedValue, setCalculatedValue] = useState([]);
	const [currentValue, setCurrentValue] = useState([]);
	const [compareValue, setCompareValue] = useState([]);
	const [estimateEarnings, setEstimateEarnings] = useState([]);
	const [requestData, setRequestsData] = useState([]);
	const [Impression, setImpression] = useState([]);
	const [matchRate, setMatchRate] = useState([]);
	const [ecpm, setEcpm] = useState([]);
	const [roasGraph, setRoasGraph] = useState([]);
	const [costGraph, setCostGraph] = useState([]);
	const [imprPerUserGraph, setImprPerUserGraph] = useState([]);

	const formData = new FormData();
	formData.append('user_id', localStorage.getItem('id'));
	formData.append('user_token', localStorage.getItem('token'));
	formData.append('app_auto_id', id);
	formData.append('type', overviewSelect);

	const isAppProperty = useMemo(() => appInfo?.app_info?.is_app_property == 1, [appInfo]);

	function formatDate(dateValue) {
		// Parse the date string
		const year = dateValue?.substring(0, 4);
		const month = dateValue?.substring(4, 6);
		const day = dateValue?.substring(6, 8);
		const date = new Date(year, month - 1, day);

		// Format the date string
		const currentYear = new Date().getFullYear();
		const options = { day: '2-digit', month: 'short' };
		let formattedDate = '';

		if (date?.getFullYear() === currentYear) {
			formattedDate = date.toLocaleDateString('en-US', options);
		} else {
			options.year = '2-digit';
			formattedDate = date.toLocaleDateString('en-US', options);
		}
		return formattedDate;
	}

	const {
		data: apiResponse,
		isSuccess: apiSucesss,
		isLoading,
		isFetching,
	} = useQueryFetch(
		['app-activity-performance-data', id, overviewSelect],
		'get-app-info-performances',
		formData,
		{
			enabled: !!id,
			staleTime: 1000 * 60,
			refetchOnMount: 'ifStale',
		}
	);

	useEffect(() => {
		if (!apiResponse || !apiSucesss) return;
		const response = apiResponse;
		setActivityPerformanceData(response);
		setIsAppLoaderVisible((prev) => ({
			...prev,
			activityPerformance: false,
		}));
		let responseDataofCompare = [];
		const responseDataofCurrent = response?.current;
		responseDataofCompare = response?.compare;

		let dataCompare = responseDataofCompare;
		if (overviewSelect === '2') {
			const currentDate = responseDataofCurrent[0]?.row?.dimensionValues?.DATE?.value;
			const year = currentDate?.substring(0, 4);
			const month = parseInt(currentDate?.substring(4, 6)) - 1;
			const day = currentDate?.substring(6, 8);
			const currentdateObject = new Date(year, month, day);
			const oneWeekAgo = new Date(currentdateObject);
			oneWeekAgo.setDate(currentdateObject.getDate() - 7);
			const selectedRows = responseDataofCompare?.filter((item) => {
				const compareDate = item?.row?.dimensionValues?.DATE?.value;
				const year = compareDate?.substring(0, 4);
				const month = parseInt(currentDate?.substring(4, 6)) - 1;
				const day = compareDate?.substring(6, 8);
				const rowDate = new Date(year, month, day);
				return rowDate.getDate() === oneWeekAgo?.getDate();
			});
			if (selectedRows?.length > 0) {
				dataCompare = selectedRows;
			}
			responseDataofCompare = selectedRows;
		}
		const currentTotals = calculateTotals(responseDataofCurrent);
		const compareTotals = calculateTotals(responseDataofCompare);
		const calculatedValue = calculateDifferenceAndPercentage(currentTotals, compareTotals);
		setCalculatedValue(calculatedValue);
		setCurrentValue(currentTotals);
		setCompareValue(compareTotals);
		//data for graph
		const currentEstEarningDataPoints = responseDataofCurrent?.map((entry) => {
			let estcurrentValue = microValueConvert(
				entry?.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue
			);
			return {
				value: 'estimate',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: estcurrentValue,
			};
		});
		const compareEstEarningDataPoints = dataCompare?.map((entry) => {
			let estcompareValue = microValueConvert(
				entry?.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue
			);
			const estValueIndecimal = estcompareValue.toFixed(2);
			return {
				value: 'estimate',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: estcompareValue, // Convert microsValue to USD
			};
		});
		const EstEarningData = [
			{
				type: 'line',
				name: 'Current',
				markerSize: currentEstEarningDataPoints?.length === 1 ? 3 : 0,
				color: ' #1a73e8',
				dataPoints: currentEstEarningDataPoints,
			},
			{
				type: 'line',
				name: 'Previous',
				markerSize: compareEstEarningDataPoints?.length === 1 ? 3 : 0,
				color: '#1a73e835',
				dataPoints: compareEstEarningDataPoints,
			},
		];
		const currentRequestsDataDataPoints = responseDataofCurrent?.map((entry) => {
			let reqcurrentValue = entry?.row?.metricValues?.AD_REQUESTS?.integerValue;
			// const estValueIndecimal = estcurrentValue.toFixed(2)
			return {
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: Number(reqcurrentValue), // Convert microsValue to USD and round to 2 decimal places
			};
		});
		const compareRequestsDataDataPoints = dataCompare?.map((entry) => {
			let reqcompareValue = entry?.row?.metricValues?.AD_REQUESTS?.integerValue;
			// const estValueIndecimal = estcompareValue.toFixed(2)
			return {
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: Number(reqcompareValue), // Convert microsValue to USD
			};
		});
		const RequestsData = [
			{
				type: 'line',
				name: 'Current',
				markerSize: currentRequestsDataDataPoints?.length === 1 ? 3 : 0,
				color: ' #1a73e8',
				dataPoints: currentRequestsDataDataPoints,
			},
			{
				type: 'line',
				name: 'Previous',
				markerSize: compareRequestsDataDataPoints?.length === 1 ? 3 : 0,
				color: '#1a73e835',
				dataPoints: compareRequestsDataDataPoints,
			},
		];
		const currentImpressionDataPoints = responseDataofCurrent?.map((entry) => {
			let impcurrentValue = entry?.row?.metricValues?.IMPRESSIONS?.integerValue;
			// const estValueIndecimal = estcurrentValue.toFixed(2)
			return {
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: Number(impcurrentValue), // Convert microsValue to USD and round to 2 decimal places
			};
		});
		const compareImpressionDataPoints = dataCompare?.map((entry) => {
			let impcompareValue = entry?.row?.metricValues?.IMPRESSIONS?.integerValue;
			// const estValueIndecimal = estcompareValue.toFixed(2)
			return {
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: Number(impcompareValue), // Convert microsValue to USD
			};
		});
		const Impression = [
			{
				type: 'line',
				name: 'Current',
				markerSize: currentImpressionDataPoints?.length === 1 ? 3 : 0,
				color: ' #1a73e8',
				dataPoints: currentImpressionDataPoints,
			},
			{
				type: 'line',
				name: 'Previous',
				markerSize: compareImpressionDataPoints?.length === 1 ? 3 : 0,
				color: '#1a73e835',
				dataPoints: compareImpressionDataPoints,
			},
		];
		const currentMatchRateDataPoints = responseDataofCurrent?.map((entry) => {
			let matchcurrentValue = entry?.row?.metricValues?.MATCHED_REQUESTS?.integerValue;
			let reqcurrentValue = entry?.row?.metricValues?.AD_REQUESTS?.integerValue;
			const matchRate = (matchcurrentValue / reqcurrentValue) * 100;
			// const estValueIndecimal = estcurrentValue.toFixed(2)
			return {
				value: 'match_rate',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: matchRate, // Convert microsValue to USD and round to 2 decimal places
			};
		});
		const compareMatchRateDataPoints = dataCompare?.map((entry) => {
			let matchcompareValue = entry?.row?.metricValues?.MATCHED_REQUESTS?.integerValue;
			let reqcompareValue = entry?.row?.metricValues?.AD_REQUESTS?.integerValue;
			const matchRate = (matchcompareValue / reqcompareValue) * 100;
			// const estValueIndecimal = estcompareValue.toFixed(2)
			return {
				value: 'match_rate',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: matchRate, // Convert microsValue to USD
			};
		});
		const MatchRate = [
			{
				type: 'line',
				name: 'Current',
				markerSize: currentMatchRateDataPoints?.length === 1 ? 3 : 0,
				color: ' #1a73e8',
				dataPoints: currentMatchRateDataPoints,
			},
			{
				type: 'line',
				name: 'Previous',
				markerSize: compareMatchRateDataPoints?.length === 1 ? 3 : 0,
				color: '#1a73e835',
				dataPoints: compareMatchRateDataPoints,
			},
		];
		const currentEcpmDataPoints = responseDataofCurrent?.map((entry) => {
			let estcurrentValue = microValueConvert(
				entry?.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue
			);
			let imprcurrentValue = entry?.row?.metricValues?.IMPRESSIONS?.integerValue;
			const ecpmCalculated = (estcurrentValue / imprcurrentValue) * 1000;
			// const estValueIndecimal = estcurrentValue.toFixed(2)
			return {
				value: 'ecpm',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: ecpmCalculated, // Convert microsValue to USD and round to 2 decimal places
			};
		});
		const compareEcpmDataPoints = dataCompare?.map((entry) => {
			let estcurrentValue = microValueConvert(
				entry?.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue
			);
			let imprcurrentValue = entry?.row?.metricValues?.IMPRESSIONS?.integerValue;
			const ecpmCalculated = (estcurrentValue / imprcurrentValue) * 1000;
			// const estValueIndecimal = estcompareValue.toFixed(2)
			return {
				value: 'ecpm',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: ecpmCalculated, // Convert microsValue to USD
			};
		});
		const Ecpm = [
			{
				type: 'line',
				name: 'Current',
				markerSize: currentEcpmDataPoints?.length === 1 ? 3 : 0,
				color: ' #1a73e8',
				dataPoints: currentEcpmDataPoints,
			},
			{
				type: 'line',
				name: 'Previous',
				markerSize: compareEcpmDataPoints?.length === 1 ? 3 : 0,
				color: '#1a73e835',
				dataPoints: compareEcpmDataPoints,
			},
		];
		const currentROASDataPoints = responseDataofCurrent?.map((entry) => {
			let estEarningCurrentValue = microValueConvert(
				entry?.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue
			);
			let costCurrentValue =
				entry?.row?.metricValues?.COST?.doubleValue.length > 0
					? entry?.row?.metricValues?.COST?.doubleValue
					: 0;
			let currentROAS = costCurrentValue
				? Number(estEarningCurrentValue) / Number(costCurrentValue)
				: 0;
			return {
				value: 'ROAS',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: currentROAS, // Convert microsValue to USD and round to 2 decimal places
			};
		});
		const compareROASDataPoints = dataCompare?.map((entry) => {
			let estEarningCompareValue = microValueConvert(
				entry?.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue
			);
			let costCompareValue =
				entry?.row?.metricValues?.COST?.doubleValue.length > 0
					? entry?.row?.metricValues?.COST?.doubleValue
					: 0;
			let compareROAS = costCompareValue
				? +(+estEarningCompareValue / +costCompareValue).toFixed(2)
				: 0;
			return {
				value: 'ROAS',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: compareROAS, // Convert microsValue to USD
			};
		});
		const ROASData = [
			{
				type: 'line',
				name: 'Current',
				markerSize: currentROASDataPoints?.length === 1 ? 3 : 0,
				color: ' #1a73e8',
				dataPoints: currentROASDataPoints,
			},
			{
				type: 'line',
				name: 'Previous',
				markerSize: compareROASDataPoints?.length === 1 ? 3 : 0,
				color: '#1a73e835',
				dataPoints: compareROASDataPoints,
			},
		];
		//cost
		const currentCostDataPoints = responseDataofCurrent?.map((entry) => {
			const rawCurrent = entry?.row?.metricValues?.COST?.doubleValue;
			const costCurrentValue = rawCurrent && String(rawCurrent).length > 0 ? Number(rawCurrent) : 0;
			return {
				value: 'cost',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: costCurrentValue,
			};
		});
		const compareCostDataPoints = dataCompare?.map((entry) => {
			const rawCompare = entry?.row?.metricValues?.COST?.doubleValue;
			const costCompareValue = rawCompare && String(rawCompare).length > 0 ? Number(rawCompare) : 0;
			return {
				value: 'cost',
				label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
				y: costCompareValue,
			};
		});
		const costData = [
			{
				type: 'line',
				name: 'Current',
				markerSize: currentCostDataPoints?.length === 1 ? 3 : 2,
				color: '#1a73e8',
				dataPoints: currentCostDataPoints,
			},
			{
				type: 'line',
				name: 'Previous',
				markerSize: compareCostDataPoints?.length === 1 ? 3 : 2,
				color: '#1a73e835',
				dataPoints: compareCostDataPoints,
			},
		];

		 // Impressions per User
        const currentImprPerUserDataPoints = responseDataofCurrent?.map((entry) => {
          const impressions = Number(entry?.row?.metricValues?.IMPRESSIONS?.integerValue || 0);
          const activeUsers = Number(entry?.row?.metricValues?.ACTIVE_USERS?.integerValue || 0);

          const imprPerUser = activeUsers > 0 ? impressions / activeUsers : 0;

          return {
            value: "impr_per_user",
            label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
            y: +imprPerUser.toFixed(2),
          };
        });

        const compareImprPerUserDataPoints = dataCompare?.map((entry) => {
          const impressions = Number(entry?.row?.metricValues?.IMPRESSIONS?.integerValue || 0);
          const activeUsers = Number(entry?.row?.metricValues?.ACTIVE_USERS?.integerValue || 0);

          const imprPerUser = activeUsers > 0 ? impressions / activeUsers : 0;

          return {
            value: "impr_per_user",
            label: formatDate(entry?.row?.dimensionValues?.DATE?.value),
            y: +imprPerUser.toFixed(2),
          };
        });

        const ImprPerUserData = [
          {
            type: "line",
            name: "Current",
            markerSize: currentImprPerUserDataPoints?.length === 1 ? 3 : 0,
            color: "#1a73e8",
            dataPoints: currentImprPerUserDataPoints,
          },
          {
            type: "line",
            name: "Previous",
            markerSize: compareImprPerUserDataPoints?.length === 1 ? 3 : 0,
            color: "#1a73e835",
            dataPoints: compareImprPerUserDataPoints,
          },
        ];

        setImprPerUserGraph(ImprPerUserData);
		setEstimateEarnings(EstEarningData);
		setRequestsData(RequestsData);
		setImpression(Impression);
		setMatchRate(MatchRate);
		setEcpm(Ecpm);
		setRoasGraph(ROASData);
		setCostGraph(costData);
	}, [apiResponse, apiSucesss, id]);

	// const hasData = activityPerformanceData && activityPerformanceData.length > 0;
	// const showMainLoader = isLoading && !hasData;
	// const showOverlayLoader = isFetching && hasData;

	const hasData = activityPerformanceData && Object.keys(activityPerformanceData).length > 0;
const showMainLoader = (isLoading || isFetching) && !hasData;
const showOverlayLoader = (isLoading || isFetching) && hasData;

	// order-3
	return (
		<div className='box-row box2 activity-performance'>
			{showOverlayLoader && (
				<div className='shimmer-spinner overlay-spinner'>
					<Spinner animation='border' variant='secondary' />
				</div>
			)}
			<div className='sm-title'>Ads activity performance</div>
			{showMainLoader ? (
				<div className='shimmer-spinner blue-spinner activity-performance'>
					<Spinner animation='border' variant='secondary' />
				</div>
			) : (
				<div className={`card-content pdglr16 ${isAppProperty ? ' is_analytics_app' : ''}`}>
					<div className='box2 graph-est'>
						<div className='scorecard-name'>
							Est. earnings
							<div className='tooltip-row'>
								<MdHelpOutline className='help_icon' />
								<div className='tooltip-box'>
									<div className='content-container'>
										<h4>Estimated earnings</h4>
										<p>
											Your earnings accrued so far. This amount is an estimate that is subject to change when
											your earnings are verified for accuracy at the end of every month.
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className='scorecard'>
							<div className='text-box copy-text value-tooltip'>
								<div
									className='label-value'
									dangerouslySetInnerHTML={{
										__html:
											activityPerformanceData?.activity_performance?.est_earnings
												?.dashboard_performance_est_earnings,
									}}
								></div>
								<div className='copyMessage'>
									<div>
										Current :{' '}
										{
											activityPerformanceData?.activity_performance?.est_earnings
												?.total_estimated_earnings_tooltip_current
										}{' '}
									</div>
									<div>
										Previous :{' '}
										{
											activityPerformanceData?.activity_performance?.est_earnings
												?.total_estimated_earnings_tooltip_previous
										}{' '}
									</div>
								</div>
							</div>
							<div className='line-chart'>
								<div className='line-chart-box'>
									<CanvasChartItem chartData={estimateEarnings} />
								</div>
							</div>
						</div>
					</div>

					<div className='box2 graph-req'>
						<div className='scorecard-name'>
							Requests
							<div className='tooltip-row'>
								<MdHelpOutline className='help_icon' />
								<div className={`tooltip-box${isAppProperty ? '' : ' left-tool'}`}>
									<div className='content-container'>
										<h4>Requests</h4>
										<p>The total number of ad requests received from your apps.</p>
									</div>
								</div>
							</div>
						</div>
						<div className='scorecard'>
							<div className='text-box copy-text value-tooltip'>
								<div
									className='label-value'
									dangerouslySetInnerHTML={{
										__html:
											activityPerformanceData?.activity_performance?.requests?.dashboard_performance_requests,
									}}
								></div>
								<div className='copyMessage'>
									<div>
										Current :{' '}
										{
											activityPerformanceData?.activity_performance?.requests
												?.total_estimated_requests_tooltip_current
										}{' '}
									</div>
									<div>
										Previous :{' '}
										{
											activityPerformanceData?.activity_performance?.requests
												?.total_estimated_requests_tooltip_previous
										}{' '}
									</div>
								</div>
							</div>
							<div className='line-chart'>
								<div className='line-chart-box'>
									<CanvasChartItem chartData={requestData} />
								</div>
							</div>
						</div>
					</div>

					<div className='box2 graph-height'>
						<div className='scorecard-name'>
							Impr.
							<div className='tooltip-row'>
								<MdHelpOutline className='help_icon' />
								<div className={`tooltip-box${isAppProperty ? ' left-tool' : ''}`}>
									<div className='content-container'>
										<h4>Impressions</h4>
										<p>
											The total number of ads shown to users across all of your ad units and apps through
											waterfall and bidding mediation. Includes a period-over-period comparison.
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className='scorecard'>
							<div className='text-box copy-text value-tooltip'>
								<div
									className='label-value'
									dangerouslySetInnerHTML={{
										__html: activityPerformanceData?.activity_performance?.impr?.dashboard_performance_impr,
									}}
								></div>
								<div className='copyMessage'>
									<div>
										Current :{' '}
										{
											activityPerformanceData?.activity_performance?.impr?.total_estimated_impr_tooltip_current
										}{' '}
									</div>
									<div>
										Previous :{' '}
										{
											activityPerformanceData?.activity_performance?.impr
												?.total_estimated_impr_tooltip_previous
										}{' '}
									</div>
								</div>
							</div>
							<div className='line-chart'>
								<div className='line-chart-box'>
									<CanvasChartItem chartData={Impression} />
								</div>
							</div>
						</div>
					</div>

					<div className='box2 graph-height-ecpm'>
						<div className='scorecard-name'>
							Match rate
							<div className='tooltip-row ecpm-hover-box'>
								<MdHelpOutline className='help_icon' />
								<div className={`tooltip-box${isAppProperty ? '' : ' left-tool'}`}>
									<div className='content-container'>
										<h4>Match rate (%)</h4>
										<p>The percentage of ad requests that received a response from an ad source.</p>
										<p>Match rate is&nbsp;calculated by dividing matched requests by requests:</p>
										<p>
											<em>(Matched requests / Requests) * 100%</em>
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className='scorecard'>
							<div className='text-box copy-text value-tooltip'>
								<div
									className='label-value'
									dangerouslySetInnerHTML={{
										__html:
											activityPerformanceData?.activity_performance?.match_rate
												?.dashboard_performance_match_rate,
									}}
								></div>
								<div className='copyMessage'>
									<div>
										Current :{' '}
										{
											activityPerformanceData?.activity_performance?.match_rate
												?.total_estimated_match_rate_tooltip_current
										}{' '}
									</div>
									<div>
										Previous :{' '}
										{
											activityPerformanceData?.activity_performance?.match_rate
												?.total_estimated_match_rate_tooltip_previous
										}{' '}
									</div>
								</div>
							</div>
							<div className='line-chart'>
								<div className='line-chart-box'>
									<CanvasChartItem chartData={matchRate} />
								</div>
							</div>
						</div>
					</div>

					<div className='box2 graph-height-ecpm'>
						<div className='scorecard-name'>
							eCPM
							<div className='tooltip-row ecpm-hover-box'>
								<MdHelpOutline className='help_icon' />
								<div className='tooltip-box'>
									<div className='content-container'>
										<h4>eCPM</h4>
										<p>eCPM Effective cost per thousand impressions.</p>
										<p>
											An estimate of the revenue you receive for every thousand ad impressions. eCPM is
											calculated as {'('} Total Earnings / Impressions {')'} x 1000.
										</p>
										<p>
											<b>Note</b>: When optimization is enabled, this value is updated automatically by AdMob
											based on the ad network's historical eCPM data.
										</p>
										<p>Effective cost per thousand impressions.</p>
									</div>
								</div>
							</div>
						</div>
						<div className='scorecard'>
							<div className='text-box copy-text value-tooltip'>
								<div
									className='label-value'
									dangerouslySetInnerHTML={{
										__html: activityPerformanceData?.activity_performance?.ecpm?.dashboard_performance_ecpm,
									}}
								></div>
								<div className='copyMessage'>
									<div>
										Current :{' '}
										{
											activityPerformanceData?.activity_performance?.ecpm?.total_estimated_ecpm_tooltip_current
										}{' '}
									</div>
									<div>
										Previous :{' '}
										{
											activityPerformanceData?.activity_performance?.ecpm
												?.total_estimated_ecpm_tooltip_previous
										}{' '}
									</div>
								</div>
							</div>
							<div className='line-chart'>
								<div className='line-chart-box'>
									<CanvasChartItem chartData={ecpm} />
								</div>
							</div>
						</div>
					</div>

					 <div className="box2 graph-height-ecpm">
            <div className="scorecard-name">
              Impr./User
              <div className="tooltip-row ecpm-hover-box">
                <MdHelpOutline className="help_icon" />
                <div className="tooltip-box">
                  <div className="content-container">
                    <h4>Ad Impression/User</h4>
                    <>
                Ad Impression per User measures the{" "}
                average number of ads
                served to each user during the selected date range.
                <br />
                <br />
                <span>
                 It is calculated by
                dividing total ad impressions by total active users.
                </span>
                <br />
                <br />
                <span>(Total Impressions/Active Users)</span>
              </>
                  </div>
                </div>
              </div>
            </div>
            <div className="scorecard">
              <div className="text-box copy-text value-tooltip">
                <div
                  className="label-value"
                  dangerouslySetInnerHTML={{
                    __html: activityPerformanceData?.activity_performance?.impr_per_user?.dashboard_performance_impr_per_user,
                  }}
                ></div>
                <div className="copyMessage">
                  <div>Current : {activityPerformanceData?.activity_performance?.impr_per_user?.total_impr_per_user_tooltip_current} </div>
                  <div>Previous : {activityPerformanceData?.activity_performance?.impr_per_user?.total_impr_per_user_tooltip_previous} </div>
                </div>
              </div>
              <div className="line-chart">
                <div className="line-chart-box">
                  <CanvasChartItem chartData={imprPerUserGraph} />
                </div>
              </div>
            </div>
          </div>

					{isAppProperty && (
						<>
							<UserMetricsPerformance
								overviewSelect={overviewSelect}
								appInfo={appInfo}
								isAppLoaderVisible={isAppLoaderVisible}
								setIsAppLoaderVisible={setIsAppLoaderVisible}
							/>

							<div className='box2 graph-height-ecpm'>
								<div className='scorecard-name'>
									<Link to={'/apps-cost'} state={{ app_auto_id: id }}>
										Cost
									</Link>
									<div className='tooltip-row ecpm-hover-box'>
										<MdHelpOutline className='help_icon' />
										<div className='tooltip-box'>
											<div className='content-container'>
												<h4>Cost</h4>
												<p>Cost is the total amount spent on ads during the selected time period.</p>
											</div>
										</div>
									</div>
								</div>
								<div className='scorecard'>
									<Link
										to={'/apps-cost'}
										state={{ app_auto_id: id }}
										className='text-box copy-text value-tooltip'
									>
										<div
											className='label-value'
											dangerouslySetInnerHTML={{
												__html: activityPerformanceData?.activity_performance?.cost?.dashboard_performance_cost,
											}}
										></div>
										<div className='copyMessage'>
											<div>
												Current :{' '}
												{activityPerformanceData?.activity_performance?.cost?.total_cost_tooltip_current}{' '}
											</div>
											<div>
												Previous :{' '}
												{activityPerformanceData?.activity_performance?.cost?.total_cost_tooltip_previous}{' '}
											</div>
										</div>
									</Link>
									<div className='line-chart'>
										<div className='line-chart-box'>
											<CanvasChartItem chartData={costGraph} />
										</div>
									</div>
								</div>
							</div>
							<div className='box2 graph-height-ecpm'>
								<div className='scorecard-name'>
									C.ROAS
									<div className='tooltip-row ecpm-hover-box'>
										<MdHelpOutline className='help_icon' />
										<div className='tooltip-box'>
											<div className='content-container'>
												<h4>C.ROAS</h4>
												<p>
													C.ROAS is a marketing metric that measures the revenue earned for every dollar spent on
													advertising.
												</p>
												<p>C.ROAS is simple to calculate by dividing revenue by ad spend.</p>
												<p>(Revenue/Cost)</p>
											</div>
										</div>
									</div>
								</div>
								<div className='scorecard'>
									<div className='text-box copy-text value-tooltip'>
										<div
											className='label-value'
											dangerouslySetInnerHTML={{
												__html: activityPerformanceData?.activity_performance?.roas?.dashboard_performance_roas,
											}}
										></div>
										<div className='copyMessage'>
											<div>
												Current :{' '}
												{activityPerformanceData?.activity_performance?.roas?.total_roas_tooltip_current}{' '}
											</div>
											<div>
												Previous :{' '}
												{activityPerformanceData?.activity_performance?.roas?.total_roas_tooltip_previous}{' '}
											</div>
										</div>
									</div>
									<div className='line-chart'>
										<div className='line-chart-box'>
											<CanvasChartItem chartData={roasGraph} />
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default ActivityPerformance;
