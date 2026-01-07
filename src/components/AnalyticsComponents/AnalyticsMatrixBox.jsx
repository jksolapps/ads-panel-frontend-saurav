/** @format */

import React, { useContext, useState } from 'react';
import { ReportContext } from '../../context/ReportContext';
import { DataContext } from '../../context/DataContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RiDraggable } from 'react-icons/ri';

const AnalyticsMatrixBox = ({
	setPageNumber,
	handleClick,
	setIsReportLoaderVisible,
	setCurrentUnitPage,
	syncTableRefScroll,
	disable,
	setDisabled,
}) => {
	const {
		allAnalyticsMatrixData,
		setallAnalyticsMatrixData,
		popupFlags,
		setPopupFlags,
		MatrixBoxCheck,
		setMatrixBoxCheck,
		setToggleResizeAnalytics,
	} = useContext(ReportContext);
	const { sharedAnalyticsMatrixData, setSharedAnalyticsMatrixData } = useContext(DataContext);
	//All Filter Popup Data

	const handleCheck = (item) => {
		setToggleResizeAnalytics(true);
		setMatrixBoxCheck(true);
		setDisabled(true);
		setIsReportLoaderVisible(true);
		let updatedMatrix = allAnalyticsMatrixData?.map((matrix) => {
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
		setIsReportLoaderVisible(true);
		setallAnalyticsMatrixData(updatedMatrix);
		sessionStorage.setItem('analytics_matrix', JSON.stringify(updatedMatrix));
		setToggleResizeAnalytics(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
			setDisabled(false);
		}, 250);
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
		const reorderedItems = reorder(
			allAnalyticsMatrixData,
			result.source.index,
			result.destination.index
		);
		setallAnalyticsMatrixData(reorderedItems);
		sessionStorage.setItem('analytics_matrix', JSON.stringify(reorderedItems));
		setSharedAnalyticsMatrixData({ columns: reorderedItems });
		setIsReportLoaderVisible(true);
		setTimeout(() => {
			setIsReportLoaderVisible(false);
		}, 400);
	};

	return (
		<div className='dimension-box'>
			<div className='dimension-title'>Matrix</div>
			<div className='dimension-value dimension-wrap'>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='allAnalyticsMatrixData'>
						{(provided) => (
							<div
								className='allAnalyticsMatrixData'
								style={{ overflow: 'hidden' }}
								{...provided.droppableProps}
								ref={provided.innerRef}
							>
								{allAnalyticsMatrixData?.map((matrix, index) => (
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
													} `}
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

export default AnalyticsMatrixBox;
