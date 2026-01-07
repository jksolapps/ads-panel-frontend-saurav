/** @format */

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RiDraggable } from 'react-icons/ri';

const GeneralMatrix = ({
	uniqueIdentifier,
	tableMatrix,
	setTableMatrix,
	setTableToggleResize,
	setIsTableLoaderVisible,
	disable,
	setDisabled,
	syncTableRefScroll,
	setSharedDimensionData,
}) => {
	const handleCheck = (item) => {
		setDisabled(true);
		setIsTableLoaderVisible(true);
		setTableToggleResize(true);
		syncTableRefScroll(0);
		const updatedMatrix = tableMatrix?.map((matrix) => {
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
		setTableMatrix(updatedMatrix);
		sessionStorage.setItem(uniqueIdentifier + '_matrix_items', JSON.stringify(updatedMatrix));
		setTimeout(() => {
			setIsTableLoaderVisible(false);
			setDisabled(false);
		}, 400);
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
		const reorderedItems = reorder(tableMatrix, result.source.index, result.destination.index);
		setTableMatrix(reorderedItems);
		sessionStorage.setItem(uniqueIdentifier + '_matrix_items', JSON.stringify(reorderedItems));
		setSharedDimensionData({ columns: reorderedItems });
		setIsTableLoaderVisible(true);
		setTimeout(() => {
			setIsTableLoaderVisible(false);
		}, 400);
	};

	return (
		<div className='dimension-box'>
			<div className='dimension-title'>Matrix</div>
			<div className='dimension-value matrix-wrap'>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='allMatrixData'>
						{(provided) => (
							<div
								className='allMatrixData'
								style={{ overflow: 'hidden' }}
								{...provided.droppableProps}
								ref={provided.innerRef}
							>
								{tableMatrix?.map((matrix, index) => (
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

export default GeneralMatrix;
