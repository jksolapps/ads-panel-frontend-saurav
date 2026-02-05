/** @format */

import React, { useContext, useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { ReportContext } from '../../../context/ReportContext';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/Popover';

const OrderBy = ({
	uniqueIdentifier,
	setPageNumber,
	setIsReportLoaderVisible,
	setCurrentUnitPage,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		accountOrder,
		setaccountOrder,
		accountType,
		orderToggle,
		setSelectedFilter,
	} = useContext(ReportContext);
	const initialData = [
		{
			type_auto_id: '2',
			type_auto_name: 'Revenue ↑ (ascending)',
			sorting_column: 'Revenue',
			sorting_order: 'asc',
			item_checked: false,
			order_id: '1',
		},
		{
			type_auto_id: '1',
			type_auto_name: 'Revenue ↓ (descending)',
			sorting_column: 'Revenue',
			sorting_order: 'desc',
			item_checked: false,
			order_id: '1',
		},
		{
			type_auto_id: '4',
			type_auto_name: 'eCPM ↑ (ascending)',
			sorting_column: 'eCPM',
			sorting_order: 'asc',
			item_checked: false,
			order_id: '2',
		},
		{
			type_auto_id: '3',
			type_auto_name: 'eCPM ↓ (descending)',
			sorting_column: 'eCPM',
			sorting_order: 'desc',
			item_checked: false,
			order_id: '2',
		},
		{
			type_auto_id: '6',
			type_auto_name: 'Impressions ↑ (ascending)',
			sorting_column: 'Impressions',
			sorting_order: 'asc',
			item_checked: false,
			order_id: '3',
		},
		{
			type_auto_id: '5',
			type_auto_name: 'Impressions ↓ (descending)',
			sorting_column: 'Impressions',
			sorting_order: 'desc',
			item_checked: false,
			order_id: '3',
		},
	];
	const [allPlatformData, setAllPlatformData] = useState(initialData || []);
	const [filteredPlatformData, setFilteredPlatformData] = useState(initialData || []);
	const [checkedPlatform, setCheckedPlatform] = useState([]);
	const [searchText, setSearchText] = useState('');

	// useEffect(() => {
	// 	if (orderToggle && accountType?.length > 0) {
	// 		const uniqueOrderIds = Array.from(new Set(accountType?.map((item) => item.order_id)));
	// 		const filteredInitialData = initialData?.filter((item) =>
	// 			uniqueOrderIds.includes(item.order_id)
	// 		);
	// 		const updatedInitialData = [...filteredInitialData];
	// 		updatedInitialData[1].item_checked = orderToggle;

	// 		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_order_filter'));
	// 		const finalUpdatedData = updatedInitialData?.map((item) => {
	// 			const isChecked = localData?.some((app) => app.type_auto_id == item.type_auto_id);
	// 			return {
	// 				...item,
	// 				item_checked: isChecked ? isChecked : !localData ? item?.item_checked : false,
	// 			};
	// 		});
	// 		setAllPlatformData(finalUpdatedData);
	// 		setFilteredPlatformData(finalUpdatedData);
	// 		setaccountOrder(finalUpdatedData?.filter((item) => item?.item_checked));
	// 	} else {
	// 		const uniqueOrderIds = Array.from(new Set(accountType?.map((item) => item.order_id)));
	// 		// Filter initialData based on unique order_ids
	// 		const filteredInitialData = initialData?.filter((item) =>
	// 			uniqueOrderIds.includes(item.order_id)
	// 		);
	// 		const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_order_filter'));
	// 		const finalUpdatedData = filteredInitialData?.map((item) => {
	// 			const isChecked = localData?.some((app) => app.type_auto_id == item.type_auto_id);
	// 			return { ...item, item_checked: isChecked ? isChecked : false };
	// 		});
	// 		setAllPlatformData(finalUpdatedData);
	// 		setFilteredPlatformData(finalUpdatedData);
	// 		setaccountOrder(finalUpdatedData?.filter((item) => item?.item_checked));
	// 	}
	// }, [orderToggle, accountType]);

	useEffect(() => {
  const uniqueOrderIds = accountType?.length > 0
    ? Array.from(new Set(accountType?.map((item) => item.order_id)))
    : ['1', '2', '3'];
  const filteredInitialData = initialData?.filter((item) =>
    uniqueOrderIds.includes(item.order_id)
  );

  if (orderToggle && accountType?.length > 0) {
    const updatedInitialData = [...filteredInitialData];
    updatedInitialData[1].item_checked = orderToggle;

    const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_order_filter'));
    const finalUpdatedData = updatedInitialData?.map((item) => {
      const isChecked = localData?.some((app) => app.type_auto_id == item.type_auto_id);
      return {
        ...item,
        item_checked: isChecked ? isChecked : !localData ? item?.item_checked : false,
      };
    });
    setAllPlatformData(finalUpdatedData);
    setFilteredPlatformData(finalUpdatedData);
    setaccountOrder(finalUpdatedData?.filter((item) => item?.item_checked));
  } else {
    const localData = JSON.parse(sessionStorage.getItem(uniqueIdentifier + '_order_filter'));
    const finalUpdatedData = filteredInitialData?.map((item) => {
      const isChecked = localData?.some((app) => app.type_auto_id == item.type_auto_id);
      return { ...item, item_checked: isChecked ? isChecked : false };
    });
    setAllPlatformData(finalUpdatedData);
    setFilteredPlatformData(finalUpdatedData);
    setaccountOrder(finalUpdatedData?.filter((item) => item?.item_checked));
  }
}, [orderToggle, accountType]);

	useEffect(() => {
		setCheckedPlatform(filteredPlatformData.filter((item) => item.item_checked));
	}, [allPlatformData, filteredPlatformData]);

	const handleCheckboxChange = (platform, index) => {
		const updatedFilteredData = filteredPlatformData.map((item) =>
			item.type_auto_id === platform.type_auto_id
				? { ...item, item_checked: true }
				: { ...item, item_checked: false }
		);
		setFilteredPlatformData(updatedFilteredData);
		setCheckedPlatform(updatedFilteredData?.filter((item) => item.item_checked));

		const updatedAllData = allPlatformData.map((item) =>
			item.type_auto_id === updatedFilteredData[index].type_auto_id
				? { ...updatedFilteredData[index] }
				: { ...item }
		);
		setAllPlatformData(updatedAllData);
	};

	const handleApply = (e, close) => {
		setSelectedFilter('OrderBy');
		e.preventDefault();
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 500);
		setPageNumber(1);
		setaccountOrder(checkedPlatform);
		sessionStorage.setItem(uniqueIdentifier + '_order_filter', JSON.stringify(checkedPlatform));
		setCurrentUnitPage(1);
		close();
	};

	return (
		<Popover className='check-wrapper select-account-wrapper account-orderby-filter order-by-filter'>
			<PopoverTrigger>
				<a
					className={
						accountOrder?.length > 0
							? 'popover_filter filter-btn btn-active'
							: 'popover_filter filter-btn'
					}
				>
					<span>Order By</span>
					{accountOrder?.length > 0 && (
						<>
							<ul className='selected-item'>
								<li className='selected-item-value'>:</li>
								{accountOrder
									?.map((item) => {
										return item?.type_auto_name;
									})
									?.slice(0, 2)
									?.map((item, index) => (
										<li className='selected-item-value' key={index}>
											{' '}
											{item}{' '}
										</li>
									))}
								{accountOrder?.length > 2 && <span>+{accountOrder?.length - 2} more </span>}
							</ul>
						</>
					)}
				</a>
			</PopoverTrigger>

			<PopoverContent>
				{({ close }) => (
					<div className={'checkbox_popover full-and-multi-filter'}>
						<div className='filter-title-box'>
							<span className='predicate-field-label'>Order By</span>
							<a className='close-filter' onClick={close}>
								<MdClose className='material-icons' />
							</a>
						</div>
						<div className='check-boxes-inner'>
							<div className='left-check-box box2'>
								<div className='search-input show-modal'></div>
								<div className={`all-select-row `}>
									<form id='report-account-class' onSubmit={(e) => handleApply(e, close)}>
										{filteredPlatformData?.length === 0 ? (
											<div className='noResult'>
												<p>No Result Found</p>
											</div>
										) : (
											<>
												{filteredPlatformData?.map((platform, index) => (
													<div className='box-check' key={index}>
														<label>
															<input
																type='checkbox'
																name={platform?.type_auto_id}
																value={platform.item_checked ? platform.item_checked : index == 0}
																checked={platform.item_checked || ''}
																onChange={() => handleCheckboxChange(platform, index)}
															/>
															<span>
																<span className='search-title'>{platform?.type_auto_name}</span>
															</span>
														</label>
													</div>
												))}
											</>
										)}
										<div className='apply-btn-wrap text-right'>
											<button
												type='submit'
												className='apply-btn'
												disabled={filteredPlatformData?.length === 0 ?? true}
											>
												Apply
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default OrderBy;
