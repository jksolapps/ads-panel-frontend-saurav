/** @format */

import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RiDraggable } from 'react-icons/ri';
import { BsPin } from 'react-icons/bs';
import { BsFillPinFill } from 'react-icons/bs';
import { ReportContext } from '../../context/ReportContext';
import { DataContext } from '../../context/DataContext';

const GeneralDimension = ({
	uniqueIdentifier,
	tableDimension,
	setTableDimension,
	setTableToggleResize,
	setIsTableLoaderVisible,
	disable,
	setDisabled,
	fetchFlags,
	setFetchFlags,
	syncTableRefScroll,
	setPageNumber,
	setSharedDimensionData,
}) => {
	// dimension check
	const handleCheck = (item) => {
		setIsTableLoaderVisible(true);
		// setFetchFlags(!fetchFlags);
		setTableToggleResize(true);
		setDisabled(true);
		syncTableRefScroll(0);
		setPageNumber(1);
		let updatedItem = tableDimension?.map((matrix) => {
			if (matrix.item_id === item.item_id && matrix.item_checked) {
				return {
					...matrix,
					item_checked: false,
				};
			} else if (matrix.item_id === item.item_id) {
				return {
					...matrix,
					item_checked: true,
				};
			}
			{
				return {
					...matrix,
				};
			}
		});
		updatedItem?.sort((a, b) => {
			if (a?.item_checked && !b?.item_checked) {
				return -1;
			} else if (!a.item_checked && b.item_checked) {
				return 1;
			}
			return 0;
		});

		setTableDimension(updatedItem);
		sessionStorage.setItem(uniqueIdentifier + '_dimension_items', JSON.stringify(updatedItem));
		setTimeout(() => {
			setDisabled(false);
		}, 400);
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
		const reorderedItems = reorder(tableDimension, result.source.index, result.destination.index);
		setTableDimension(reorderedItems);
		sessionStorage.setItem(uniqueIdentifier + '_dimension_items', JSON.stringify(reorderedItems));
		setSharedDimensionData({ columns: reorderedItems });
		setIsTableLoaderVisible(true);
		setTimeout(() => {
			setIsTableLoaderVisible(false);
		}, 400);
	};

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
								{tableDimension?.map((matrix, index) => (
									<Draggable
										key={String(matrix.item_id)}
										draggableId={String(matrix.item_id)}
										index={index}
										isDragDisabled={!matrix.item_checked}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												className={`${matrix?.item_checked ? 'dimension-name active' : 'dimension-name'} ${
													disable ? 'disabled-div' : ''
												} `}
												key={index}
												onClick={() => handleCheck(matrix)}
											>
												<span
													{...provided.dragHandleProps}
													className={`${'padding-non-draggable matrix-table-box'}`}
												>
													{matrix?.item_checked && (
														<RiDraggable
															className='drag-icon-matrix'
															style={{ marginRight: '5px', marginLeft: '2px' }}
														/>
													)}
												</span>
												{matrix.display_name}
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

export default GeneralDimension;
