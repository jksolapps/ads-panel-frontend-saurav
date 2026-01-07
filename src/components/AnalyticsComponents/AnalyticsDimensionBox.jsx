/** @format */

import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { ReportContext } from '../../context/ReportContext';
import { DataContext } from '../../context/DataContext';
import filterPopupData from '../../utils/report_filter.json';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RiDraggable } from 'react-icons/ri';
import { BsPin } from 'react-icons/bs';
import { BsFillPinFill } from 'react-icons/bs';

const AnalyticsDimensionBox = ({
	setPageNumber,
	setIsReportLoaderVisible,
	setDimensionMatrix,
	setCurrentUnitPage,
	syncTableRefScroll,
	disable,
	setDisabled,
	Data,
}) => {
	const {
		popupFlags,
		setPopupFlags,
		setDimensionBoxCheck,
		pinToggle,
		setPinToggle,
		setToggleResizeAnalytics,
		analyticsDimensionValue,
		setanalyticsDimensionValue,
		setGroupData,
	} = useContext(ReportContext);
	const { sharedAnalyticsDimensionData, setAnalyticsDimensionSharedData } = useContext(DataContext);
	const initialData = filterPopupData?.analytics_dimension?.map((v, i) => ({
		...v,
		dimension_id: i + 1,
	}));
	const [allDimensionData, setAllDimensionData] = useState(initialData);
	// dimension check
	const handleCheck = (item) => {
		setDimensionBoxCheck(true);
		setDisabled(true);
		setIsReportLoaderVisible(true);
		let updatedDimensions = allDimensionData?.map((dimension) => {
			if (dimension.dimension_id === item.dimension_id) {
				return {
					...dimension,
					dimension_checked: !dimension.dimension_checked, // Toggle the checked state for the clicked dimension
					pin_key: !dimension.dimension_checked ? dimension.pin_key : false, // Unset pin_key if unchecked
				};
			} else {
				return {
					...dimension,
					dimension_checked: false, // Uncheck all other dimensions
					pin_key: false, // Unset pin_key for unchecked dimensions
				};
			}
		});
		updatedDimensions?.sort((a, b) => {
			if (a?.dimension_checked && !b?.dimension_checked) {
				return -1;
			} else if (!a.dimension_checked && b.dimension_checked) {
				return 1;
			}
			return 0;
		});
		const isCountryCheck = updatedDimensions?.some(
			(item) => item.name === 'Country' && item.dimension_checked === false
		);
		if (isCountryCheck) {
			setGroupData([]);
		}
		[...updatedDimensions].sort((a, b) => {
			if (a.pin_key && !b.pin_key) return -1;
			if (!a.pin_key && b.pin_key) return 1;
			if (a.pin_key && b.pin_key) {
				return (
					analyticsDimensionValue.findIndex((item) => item.name === a.name) -
					analyticsDimensionValue.findIndex((item) => item.name === b.name)
				);
			}
			return 0;
		});
		setanalyticsDimensionValue(updatedDimensions);
		setAnalyticsDimensionSharedData({ columns: updatedDimensions });
		setDimensionMatrix(updatedDimensions?.map((item) => item.dimension_checked));
		setAllDimensionData(updatedDimensions);
		setToggleResizeAnalytics(true);
	};
	//reorder
	const reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};
	const onDragEnd = (result) => {
		if (!result.destination) {
			return;
		}

		const { source, destination } = result;
		const startIndex = source.index;
		const endIndex = destination.index;

		let sourceArray;
		if (source.droppableId === 'checkedPinned') {
			sourceArray = filterDimensions(true, true);
		} else if (source.droppableId === 'checkedNotPinned') {
			sourceArray = filterDimensions(true, false);
		} else {
			sourceArray = filterDimensions(false, false);
		}
		const reorderedItems = reorder(sourceArray, startIndex, endIndex);
		const firstHalf = allDimensionData.filter((dim) => dim.dimension_checked && dim.pin_key);
		const secondHalf = allDimensionData.filter((dim) => dim.dimension_checked && !dim.pin_key);
		const thirdHalf = allDimensionData.filter((dim) => !dim.dimension_checked);

		let updatedAllDimensionData = [];

		if (source.droppableId === 'checkedPinned') {
			updatedAllDimensionData = [reorderedItems, secondHalf, thirdHalf];
		} else if (source.droppableId === 'checkedNotPinned') {
			updatedAllDimensionData = [firstHalf, reorderedItems, thirdHalf];
		} else {
			updatedAllDimensionData = [firstHalf, secondHalf, reorderedItems];
		}
		updatedAllDimensionData = updatedAllDimensionData.flat();
		setToggleResizeAnalytics(true);
		setAnalyticsDimensionSharedData({ columns: updatedAllDimensionData });
		setAllDimensionData(updatedAllDimensionData);
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 400);
	};
	//unpin and pin
	const handlePinClick = (value) => {
		setPinToggle(!pinToggle);
		const updatedDimensions = analyticsDimensionValue?.map((dimension) => {
			if (dimension.data_column_id === value) {
				return {
					...dimension,
					pin_key: true,
				};
			}
			return dimension;
		});
		updatedDimensions.sort((a, b) => {
			if (a.pin_key && !b.pin_key) return -1;
			if (!a.pin_key && b.pin_key) return 1;
			return 0;
		});
		setToggleResizeAnalytics(true);
		setAnalyticsDimensionSharedData({ columns: updatedDimensions });
		setanalyticsDimensionValue(updatedDimensions);
		const updatedAllDimensionData = allDimensionData.map((dimension) => {
			if (dimension.data_column_id === value) {
				return {
					...dimension,
					pin_key: true,
				};
			}
			return dimension;
		});
		// Sort allDimensionData based on pin_key
		updatedAllDimensionData.sort((a, b) => {
			if (a.pin_key && !b.pin_key) return -1;
			if (!a.pin_key && b.pin_key) return 1;
			return 0;
		});
		setAllDimensionData(updatedAllDimensionData);
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 400);
	};
	const handlePinCloseClick = (value) => {
		setPinToggle(!pinToggle);
		const updatedDimensions = analyticsDimensionValue?.map((dimension) => {
			if (dimension.data_column_id === value) {
				return {
					...dimension,
					pin_key: false,
				};
			}
			return dimension;
		});
		updatedDimensions.sort((a, b) => {
			if (a.pin_key && !b.pin_key) return -1;
			if (!a.pin_key && b.pin_key) return 1;
			return 0;
		});
		setToggleResizeAnalytics(true);
		setanalyticsDimensionValue(updatedDimensions);
		setAnalyticsDimensionSharedData({ columns: updatedDimensions });
		const updatedAllDimensionData = allDimensionData.map((dimension) => {
			if (dimension.data_column_id === value) {
				return {
					...dimension,
					pin_key: false,
				};
			}
			return dimension;
		});
		// Sort allDimensionData based on pin_key
		updatedAllDimensionData.sort((a, b) => {
			if (a.pin_key && !b.pin_key) return -1;
			if (!a.pin_key && b.pin_key) return 1;
			return 0;
		});
		setAllDimensionData(updatedAllDimensionData);
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 400);
	};
	//filter by dimension and pin_key
	const filterDimensions = (checked, pinned) => {
		return allDimensionData.filter(
			(dim) =>
				dim?.dimension_checked === checked &&
				dim?.pin_key === pinned &&
				dim?.id !== 'NewColumn' &&
				dim?.id !== 'ExtraColumn'
		);
	};

	useEffect(() => {
		setAnalyticsDimensionSharedData({ columns: analyticsDimensionValue });
		setanalyticsDimensionValue(analyticsDimensionValue);
	}, [Data?.length > 0]);
	return (
		<div className='dimension-box custom-dimension-wrap'>
			<div className='dimension-title'>Dimensions</div>
			<div className='dimension-value dimension-wrap'>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='checkedPinned'>
						{(provided) => (
							<div className='droppable-area' {...provided.droppableProps} ref={provided.innerRef}>
								{filterDimensions(true, true).map((dimension, index) => (
									<Draggable
										key={dimension.dimension_id}
										draggableId={`${dimension.dimension_id}`}
										data-rbd-draggable-context-id={dimension.dimension_id}
										index={index}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												className={` ${
													dimension?.dimension_checked ? 'dimension-name active' : 'dimension-name'
												} ${disable ? 'disabled-div' : ''}`}
												key={index}
											>
												<div className='omit-class' onClick={(e) => handleCheck(dimension)}>
													<div {...provided.dragHandleProps} className={`padding-non-draggable`}>
														{dimension?.dimension_checked && (
															<RiDraggable
																className='drag-icon'
																style={{
																	marginRight: '5px',
																	marginLeft: '2px',
																}}
															/>
														)}
													</div>
													<div>{dimension.name}</div>
												</div>
												{dimension?.dimension_checked && (
													<div className='pin-item-box'>
														<div className='pin-icon'>
															{!dimension.pin_key ? (
																<BsPin
																	onClick={() => handlePinClick(dimension.data_column_id)}
																	className='pin-empty'
																/>
															) : (
																<BsFillPinFill
																	onClick={() => handlePinCloseClick(dimension.data_column_id)}
																	className='pin-fill'
																/>
															)}
														</div>
													</div>
												)}
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='checkedNotPinned'>
						{(provided) => (
							<div className='droppable-area' {...provided.droppableProps} ref={provided.innerRef}>
								{filterDimensions(true, false).map((dimension, index) => (
									<Draggable
										key={dimension.dimension_id}
										draggableId={`${dimension.dimension_id}`}
										data-rbd-draggable-context-id={dimension.dimension_id}
										index={index}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												className={` ${
													dimension?.dimension_checked ? 'dimension-name active' : 'dimension-name'
												} ${disable ? 'disabled-div' : ''}`}
												key={index}
											>
												<div className='omit-class' onClick={(e) => handleCheck(dimension)}>
													<div {...provided.dragHandleProps} className={`padding-non-draggable`}>
														{dimension?.dimension_checked && (
															<RiDraggable
																className='drag-icon'
																style={{
																	marginRight: '5px',
																	marginLeft: '2px',
																}}
															/>
														)}
													</div>
													<div>{dimension.name}</div>
												</div>
												{dimension?.dimension_checked && (
													<div className='pin-item-box'>
														<div className='pin-icon'>
															{!dimension.pin_key ? (
																<BsPin
																	onClick={() => handlePinClick(dimension.data_column_id)}
																	className='pin-empty'
																/>
															) : (
																<BsFillPinFill
																	onClick={() => handlePinCloseClick(dimension.data_column_id)}
																	className='pin-fill'
																/>
															)}
														</div>
													</div>
												)}
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='notChecked'>
						{(provided) => (
							<div className='droppable-area' {...provided.droppableProps} ref={provided.innerRef}>
								{filterDimensions(false, false).map((dimension, index) => (
									<Draggable
										key={dimension.dimension_id}
										draggableId={`${dimension.dimension_id}`}
										data-rbd-draggable-context-id={dimension.dimension_id}
										index={index}
										isDragDisabled={!dimension.dimension_checked}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												className={` ${
													dimension?.dimension_checked ? 'dimension-name active' : 'dimension-name'
												} ${disable ? 'disabled-div' : ''}`}
												key={index}
											>
												<div className='omit-class' onClick={(e) => handleCheck(dimension)}>
													<div {...provided.dragHandleProps} className={`padding-non-draggable`}>
														{dimension?.dimension_checked && (
															<RiDraggable
																className='drag-icon'
																style={{
																	marginRight: '5px',
																	marginLeft: '2px',
																}}
															/>
														)}
													</div>
													<div>{dimension.name}</div>
												</div>
												{dimension?.dimension_checked && (
													<div className='pin-item-box'>
														<div className='pin-icon'>
															{!dimension.pin_key ? (
																<BsPin
																	onClick={() => handlePinClick(dimension.data_column_id)}
																	className='pin-empty'
																/>
															) : (
																<BsFillPinFill
																	onClick={() => handlePinCloseClick(dimension.data_column_id)}
																	className='pin-fill'
																/>
															)}
														</div>
													</div>
												)}
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
		</div>
	);
};

export default AnalyticsDimensionBox;
