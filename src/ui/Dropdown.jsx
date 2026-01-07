/** @format */
// File: src/components/GeneralComponents/Dropdown.jsx

import React, { createContext, useContext, useMemo, useState, cloneElement } from 'react';
import {
	useFloating,
	offset,
	flip,
	shift,
	autoUpdate,
	useClick,
	useDismiss,
	useRole,
	useInteractions,
	FloatingPortal,
} from '@floating-ui/react';

const DropdownContext = createContext(null);

export function Dropdown({
	children,
	open,
	defaultOpen = false,
	onOpenChange,

	// positioning
	side = 'bottom', // top | bottom | left | right
	align = 'start', // start | center | end
	placement, // if provided, overrides side+align

	// middleware options
	offsetPx = 6,
	flipEnabled = true,
	shiftEnabled = true,
	shiftPadding = 8,

	// styles
	className = '',
	wrapperStyle = {},
	contentStyle = {},

	// interaction
	dismissOnOutsidePress = true,
	dismissOnEsc = true,
	toggleOnClick = true,

	// optional: same as your Popover mobile centering behavior
	centerOnMobile = false,
	mobileMaxWidth = 767,
}) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const setOpen = (v) => {
		if (!isControlled) setInternalOpen(v);
		onOpenChange?.(v);
	};

	const computedPlacement = useMemo(() => {
		if (placement) return placement; // full control
		// map side+align -> floating-ui placement
		const alignPart = align === 'center' ? '' : `-${align}`;
		return `${side}${alignPart}`; // e.g. bottom-start, right-end, top
	}, [placement, side, align]);

	const middleware = useMemo(() => {
		const list = [];

		list.push(offset(offsetPx));

		if (flipEnabled) list.push(flip());
		if (shiftEnabled) list.push(shift({ padding: shiftPadding }));

		if (centerOnMobile) {
			list.push({
				name: 'mobileCenter',
				fn(state) {
					if (typeof window !== 'undefined' && window.innerWidth <= mobileMaxWidth) {
						const floating = state.rects.floating;
						const x = (window.innerWidth - floating.width) / 2;
						return { x };
					}
					return {};
				},
			});
		}

		return list;
	}, [offsetPx, flipEnabled, shiftEnabled, shiftPadding, centerOnMobile, mobileMaxWidth]);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setOpen,
		whileElementsMounted: autoUpdate,
		placement: computedPlacement,
		middleware,
	});

	const click = useClick(context, { enabled: toggleOnClick });
	const dismiss = useDismiss(context, {
		enabled: dismissOnOutsidePress || dismissOnEsc,
		outsidePress: dismissOnOutsidePress,
		escapeKey: dismissOnEsc,
	});
	const role = useRole(context, { role: 'menu' });

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

	return (
		<DropdownContext.Provider
			value={{
				isOpen,
				setOpen,
				refs,
				floatingStyles,
				getReferenceProps,
				getFloatingProps,
				className,
				wrapperStyle,
				contentStyle,
			}}
		>
			{children}
		</DropdownContext.Provider>
	);
}

/* ---------------------- TRIGGER ---------------------- */

export function DropdownTrigger({ children }) {
	const ctx = useContext(DropdownContext);
	if (!ctx) throw new Error('DropdownTrigger must be inside <Dropdown>');

	return cloneElement(children, {
		ref: ctx.refs.setReference,
		...ctx.getReferenceProps(),
	});
}

/* ---------------------- MENU ---------------------- */

export function DropdownMenu({ children }) {
	const ctx = useContext(DropdownContext);
	if (!ctx) throw new Error('DropdownMenu must be inside <Dropdown>');

	if (!ctx.isOpen) return null;

	return (
		<FloatingPortal>
			<div
				ref={ctx.refs.setFloating}
				className={ctx.className}
				style={{
					...ctx.floatingStyles,
					zIndex: 999,
					...ctx.wrapperStyle,
				}}
				{...ctx.getFloatingProps()}
			>
				<div style={ctx.contentStyle}>
					{typeof children === 'function' ? children({ close: () => ctx.setOpen(false) }) : children}
				</div>
			</div>
		</FloatingPortal>
	);
}
