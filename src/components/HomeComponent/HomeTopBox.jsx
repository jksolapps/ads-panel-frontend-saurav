/** @format */

const HomeTopBox = ({ estimatedEarnings }) => {
	return (
		<div className='box-wrap pdglr16'>
			<div className='scorecard'>
				<div className='label-name'>Today so far</div>
				<div className='label-value copy-text'>
					{estimatedEarnings?.dashboard_today_so_far}
					<div className='copyMessage'>{estimatedEarnings?.dashboard_today_so_far_tooltip}</div>
				</div>
			</div>

			<div className='scorecard'>
				<div className='label-name'>Yesterday</div>
				<div className='label-value copy-text'>
					{estimatedEarnings?.dashboard_yesterday_so_far}
					<div className='copyMessage'>{estimatedEarnings?.dashboard_yesterday_so_far_tooltip}</div>
				</div>
			</div>

			<div className='scorecard'>
				<div className='label-name'>This month so far</div>
				<div className='label-value copy-text'>
					{estimatedEarnings?.dashboard_this_month_so_far}
					<div className='copyMessage'>{estimatedEarnings?.dashboard_this_month_so_far_tooltip}</div>
				</div>
			</div>

			<div className='scorecard'>
				<div className='label-name'>Last month</div>
				<div className='label-value copy-text'>
					{estimatedEarnings?.dashboard_last_month_so_far}
					<div className='copyMessage'>{estimatedEarnings?.dashboard_last_month_so_far_tooltip}</div>
				</div>
			</div>
		</div>
	);
};

export default HomeTopBox;
