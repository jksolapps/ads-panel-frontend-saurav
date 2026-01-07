/** @format */

import { useContext } from 'react';
import { ReportContext } from '../../context/ReportContext';
import { DataContext } from '../../context/DataContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RiDraggable } from 'react-icons/ri';

const MatrixBox = ({ setPageNumber, setCurrentUnitPage, isFetching = false }) => {
	const { allMatrixData, setAllMatrixData, setMatrixBoxCheck } = useContext(ReportContext);
	const { setSharedMatrixData } = useContext(DataContext);

	const handleCheck = (item) => {
		setMatrixBoxCheck(true);
		const updatedMatrix = allMatrixData?.map((matrix) => {
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
		setCurrentUnitPage(1);
		setAllMatrixData(updatedMatrix);
		sessionStorage.setItem('matrix_items', JSON.stringify(updatedMatrix));
		setPageNumber(1);
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
		const reorderedItems = reorder(allMatrixData, result.source.index, result.destination.index);
		setAllMatrixData(reorderedItems);
		sessionStorage.setItem('matrix_items', JSON.stringify(reorderedItems));
		setSharedMatrixData({ columns: reorderedItems });
	};
	return (
		<div className='dimension-box'>
			<div className='dimension-title'>Metrics</div>
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
								{allMatrixData?.map((matrix, index) => (
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
												className={`${matrix?.matrix_checked ? 'dimension-name active' : 'dimension-name'} ${
													isFetching ? 'disabled-div' : ''
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

export default MatrixBox;
