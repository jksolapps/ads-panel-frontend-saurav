/** @format */

import { useEffect, useState } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { indianNumberFormat, displayNumber } from '../../utils/helper';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default function CanvasChartItem({ chartData, graphType = 'line', height = 400 }) {
	const [isDarkMode, setIsDarkMode] = useState(
		document.getElementById('root')?.classList.contains('dark_mode')
	);

	useEffect(() => {
		const root = document.getElementById('root');
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'class') {
					setIsDarkMode(root.classList.contains('dark_mode'));
				}
			});
		});

		if (root) observer.observe(root, { attributes: true });
		return () => observer.disconnect();
	}, []);

	const formatValueGraph = (value, contextValueType) => {
		const number = parseFloat(value);
		if (isNaN(number)) return '-';

		if (contextValueType === 'duration') {
			const totalSeconds = number;
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = Math.floor(totalSeconds % 60);
			return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
		}

		if (contextValueType === 'profit') {
			const absFormatted = indianNumberFormat(displayNumber(Math.abs(number)));
			return number < 0 ? `- $${absFormatted}` : `$${absFormatted}`;
		}

		if (contextValueType === 'percent' || contextValueType === 'percentage') {
			const absFormatted = indianNumberFormat(displayNumber(Math.abs(number)));
			return `${absFormatted}%`;
		}

		const absFormatted = indianNumberFormat(displayNumber(Math.abs(number)));
		return `${absFormatted}`;
	};

	const options = {
		height,
		backgroundColor: isDarkMode ? '#252728' : '#ffffff',
		animationEnabled: true,
		toolTip: {
			animationEnabled: false,
			shared: true,
			fontColor: isDarkMode ? '#ffffff' : '#333333',
			content: function (e) {
				const current = e.entries.find((entry) => entry.dataSeries.name === 'Current');
				const compare = e.entries.find((entry) => entry.dataSeries.name === 'Compare');

				return `<div class='tooltip-inner'> 
          <div class='tooltip-value'>
            <div>
              <span class='prefix ${compare?.dataPoint?.y ? 'first' : ''}'>
                ${compare?.dataPoint?.label || '-'}
              </span>
              <span>${
															(compare?.dataPoint?.value === 'estimate' || compare?.dataPoint?.value === 'ecpm') &&
															compare?.dataPoint?.y
																? '$'
																: ''
														}${
					compare?.dataPoint?.y ? formatValueGraph(compare.dataPoint.y, compare?.dataPoint?.value) : '-'
				}${compare?.dataPoint?.value === 'matchrate' ? '%' : ''}</span>
            </div>
            <div>
              <span class='prefix ${current?.dataPoint?.y ? 'second' : ''}'>
                ${current?.dataPoint?.label || '-'}
              </span>
              <span>${
															(current?.dataPoint?.value === 'estimate' || current?.dataPoint?.value === 'ecpm') &&
															current?.dataPoint?.y
																? '$'
																: ''
														}${
					current?.dataPoint?.y ? formatValueGraph(current.dataPoint.y, current?.dataPoint?.value) : '-'
				}${current?.dataPoint?.value === 'matchrate' ? '%' : ''}</span>
            </div>
          </div>
        </div>`;
			},
		},
		theme: 'light2',
		axisY: {
			includeZero: true,
			labelFormatter: () => ' ',
			gridThickness: 0,
			tickLength: 0,
			lineThickness: 0,
		},
		axisX: {
			crosshair: { enabled: true, snapToDataPoint: true },
			labelFormatter: () => ' ',
			gridThickness: 0,
			tickLength: 0,
			lineThickness: 0,
			valueFormatString: 'DD MMM',
		},
		data: [
			{
				type: graphType,
				name: 'Current',
				index: 8,
				markerSize: chartData?.current?.dataPoints?.length === 1 ? 3 : 0,
				color: '#1a73e8',
				dataPoints: chartData?.current?.dataPoints || [],
			},
			{
				type: graphType,
				name: 'Compare',
				color: isDarkMode ? '#a3c0f9' : '#1a73e835',
				markerSize: chartData?.compare?.dataPoints?.length === 1 ? 3 : 0,
				dataPoints: chartData?.compare?.dataPoints || [],
			},
		],
	};

	return <CanvasJSChart options={options} />;
}
