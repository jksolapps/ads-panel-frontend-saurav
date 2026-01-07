/** @format */

// Tooltip.jsx
/** @format */
import React, { useId, useMemo, useRef, useState } from 'react';
import {
	useFloating,
	offset,
	flip,
	shift,
	arrow as floatingArrow,
	autoUpdate,
	FloatingPortal,
	useHover,
	useFocus,
	useDismiss,
	useRole,
	useInteractions,
	safePolygon,
} from '@floating-ui/react';

export const GeneralTooltip = ({
	children,
	content,

	// positioning
	placement = 'top',
	offsetPx = 8,

	// arrow
	arrow = true,
	arrowSize = 8,
	arrowColor, // default to bg if not passed

	// behavior
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	trigger = 'hover',
	interactive = true,
	hoverDelay = { open: 80, close: 60 },

	// styling
	bg = '#16181c',
	textColor = '#FFFFFF',
	borderColor = 'rgba(255,255,255,0.12)',
	borderWidth = 1,
	radius = 5,
	padding = '8px 10px',
	fontSize = 12,
	fontWeight = 500,
	boxShadow = '0 4px 5px #00000024, 0 1px 10px #0000001f, 0 2px 4px -1px #0003',
	maxWidth = 260,

	className = '',
	tooltipClassName = '',
	arrowClassName = '',

	// optional
	disabled = false,
}) => {
	const tooltipId = useId();
	const arrowRef = useRef(null);

	const isControlled = typeof controlledOpen === 'boolean';
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const setOpen = (v) => {
		if (!isControlled) setUncontrolledOpen(v);
		onOpenChange?.(v);
	};

	const middleware = useMemo(() => {
		const base = [offset(offsetPx), flip(), shift({ padding: 8 })];
		if (arrow) base.push(floatingArrow({ element: arrowRef, padding: 6 }));
		return base;
	}, [offsetPx, arrow]);

	const {
		refs,
		floatingStyles,
		context,
		placement: finalPlacement,
		middlewareData,
	} = useFloating({
		open: disabled ? false : open,
		onOpenChange: setOpen,
		placement,
		middleware,
		whileElementsMounted: autoUpdate,
	});

	// interactions
	const hover = useHover(context, {
		enabled: !disabled && trigger === 'hover',
		delay: hoverDelay,
		handleClose: interactive ? safePolygon({ buffer: 2 }) : undefined,
	});
	const focus = useFocus(context, {
		enabled: !disabled && (trigger === 'hover' || trigger === 'focus'),
	});
	const dismiss = useDismiss(context, { enabled: !disabled, outsidePress: true });
	const role = useRole(context, { role: 'tooltip' });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

	// click trigger support
	const handleReferenceClick = (e) => {
		if (disabled) return;
		if (trigger === 'click') {
			e.stopPropagation();
			setOpen(!open);
		}
	};

	// Arrow positioning
	const arrowData = middlewareData.arrow || {};
	const staticSide = {
		top: 'bottom',
		right: 'left',
		bottom: 'top',
		left: 'right',
	}[finalPlacement.split('-')[0]];

	const resolvedArrowColor = arrowColor || bg;

	const tooltipStyle = {
		background: bg,
		color: textColor,
		border: `${borderWidth}px solid ${borderColor}`,
		borderRadius: radius,
		padding,
		fontSize,
		fontWeight,
		boxShadow,
		maxWidth,
		// helpful defaults
		lineHeight: 1.25,
	};

	const arrowStyle = arrow
		? {
				position: 'absolute',
				width: arrowSize,
				height: arrowSize,
				background: resolvedArrowColor,
				transform: 'rotate(45deg)',
				// these come from middleware
				left: arrowData.x != null ? `${arrowData.x}px` : '',
				top: arrowData.y != null ? `${arrowData.y}px` : '',
				[staticSide]: `${Math.max(arrowSize / 2 - borderWidth, 0)}px`,
		  }
		: null;

	if (!content || disabled) {
		return React.cloneElement(React.Children.only(children), {
			className: `${children.props?.className || ''} ${className}`.trim(),
		});
	}

	const child = React.Children.only(children);

	return (
		<>
			{React.cloneElement(
				child,
				getReferenceProps({
					ref: refs.setReference,
					onClick: (e) => {
						child.props?.onClick?.(e);
						handleReferenceClick(e);
					},
					'data-tooltip-id': tooltipId,
					className: `${child.props?.className || ''} ${className}`.trim(),
				})
			)}

			<FloatingPortal>
				{open && (
					<div
						ref={refs.setFloating}
						style={{ ...floatingStyles, zIndex: 99999 }}
						{...getFloatingProps({
							className: tooltipClassName,
							'data-tooltip': true,
							'data-placement': finalPlacement,
						})}
					>
						<div style={tooltipStyle}>
							{content}
							{arrow && (
								<div ref={arrowRef} style={arrowStyle} className={arrowClassName} aria-hidden='true' />
							)}
						</div>
					</div>
				)}
			</FloatingPortal>
		</>
	);
};
