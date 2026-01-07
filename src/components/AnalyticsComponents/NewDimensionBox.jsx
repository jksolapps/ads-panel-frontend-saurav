/** @format */

import React, { useContext } from 'react';
import { ReportContext } from '../../context/ReportContext';
import { DataContext } from '../../context/DataContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RiDraggable } from 'react-icons/ri';

const NewDimensionBox = ({ setIsReportLoaderVisible, disable, setDisabled }) => {
	const { analyticsApp, newDimensionData, setNewDimensionData, setMatrixBoxCheck, setToggleResizeAnalytics } =
		useContext(ReportContext);
	const { setSharedNewDimensionData } = useContext(DataContext);

	const handleCheck = (item) => {
		setIsReportLoaderVisible(true);
		setToggleResizeAnalytics(true);
		setMatrixBoxCheck(true);
		setDisabled(true);
		let updatedMatrix = newDimensionData?.map((matrix) => {
			if (matrix.matrix_auto_id === item.matrix_auto_id && matrix.matrix_checked) {
				return {
					...matrix,
					matrix_checked: false,
				};
			} else if (matrix.matrix_auto_id === item.matrix_auto_id) {
				return {
					...matrix,
					matrix_checked: true,
				};
			}
			{
				return {
					...matrix,
				};
			}
		});
		updatedMatrix?.sort((a, b) => {
			if (a?.matrix_checked && !b?.matrix_checked) {
				return -1;
			} else if (!a.matrix_checked && b.matrix_checked) {
				return 1;
			}
			return 0;
		});

		// setNewDimensionData(updatedMatrix);
		setSharedNewDimensionData(updatedMatrix);
		sessionStorage.setItem('new_analytics_dimension', JSON.stringify(updatedMatrix));
		setToggleResizeAnalytics(true);
	};

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
		const reorderedItems = reorder(newDimensionData, result.source.index, result.destination.index);
		// setNewDimensionData(reorderedItems);
		sessionStorage.setItem('new_analytics_dimension', JSON.stringify(reorderedItems));
		setSharedNewDimensionData({ columns: reorderedItems });
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 400);
	}

	const isDateChecked = newDimensionData.find((matrix) => matrix.value == "DATE")?.matrix_checked
	const isMonthChecked = newDimensionData.find((matrix) => matrix.value == "MONTH")?.matrix_checked

	return (
		<div className='dimension-box'>
			<div className='dimension-title'>Dimensions</div>
			<div className='dimension-value dimension-wrap'>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='analyticsDimensionData'>
						{(provided) => (
							<div
								className='allAnalyticsMatrixData'
								style={{ overflow: 'hidden' }}
								{...provided.droppableProps}
								ref={provided.innerRef}
							>
								{newDimensionData?.map((matrix, index) => {
									const isDateDisable = matrix.value == "DATE" && isMonthChecked;
									const isMonthDisable = matrix.value == "MONTH" && isDateChecked;
									return (
										<Draggable
											key={String(matrix.matrix_auto_id)}
											draggableId={String(matrix.matrix_auto_id)}
											index={index}
											isDragDisabled={!matrix.matrix_checked}
										>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													className={`${matrix?.matrix_checked ? 'dimension-name active' : 'dimension-name'} ${disable ? 'disabled-div' : ''
														}  ${analyticsApp.length != 1 && matrix.sortValue == 'CAMPAIGN_NAME' ? 'disable_dimension' : ''}
														${isDateDisable || isMonthDisable ? 'disable_dimension' : ''} 
														`}
													key={index}
													onClick={() => handleCheck(matrix)}
												>
													<span
														{...provided.dragHandleProps}
														className={`${'padding-non-draggable matrix-table-box'}`}
													>
														{matrix?.matrix_checked && (
															<RiDraggable
																className='drag-icon-matrix'
																style={{ marginRight: '5px', marginLeft: '2px' }}
															/>
														)}
													</span>
													{matrix.matrix_display_name}
												</div>
											)}
										</Draggable>
									)
								})}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
		</div>
	);
};

export default NewDimensionBox;
