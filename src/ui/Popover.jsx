/** @format */

import React, { useContext, useState, cloneElement, createContext } from 'react';
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

const PopoverContext = createContext(null);

export function Popover({
	children,
	open,
	defaultOpen = false,
	onOpenChange,
	placement = 'bottom-start',
	contentStyle = {},
	wrapperStyle = {},
	className = '',
}) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const setOpen = (v) => {
		if (!isControlled) setInternalOpen(v);
		onOpenChange?.(v);
	};

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setOpen,
		whileElementsMounted: autoUpdate,
		placement,
		middleware: [
			offset(6),
			flip(),
			shift(),
			{
				name: 'mobileCenter',
				fn(state) {
					if (typeof window !== 'undefined' && window.innerWidth <= 767) {
						const floating = state.rects.floating;
						const x = (window.innerWidth - floating.width) / 2;
						return { x };
					}
					return {};
				},
			},
		],
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context);

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

	return (
		<PopoverContext.Provider
			value={{
				isOpen,
				setOpen,
				refs,
				floatingStyles,
				getReferenceProps,
				getFloatingProps,
				contentStyle,
				wrapperStyle,
				className,
			}}
		>
			{children}
		</PopoverContext.Provider>
	);
}

/* ---------------------- TRIGGER ---------------------- */

export function PopoverTrigger({ children }) {
	const ctx = useContext(PopoverContext);
	if (!ctx) throw new Error('PopoverTrigger must be inside <Popover>');

	return cloneElement(children, {
		ref: ctx.refs.setReference,
		...ctx.getReferenceProps(),
	});
}

/* ---------------------- CONTENT ---------------------- */

export function PopoverContent({ children }) {
	const ctx = useContext(PopoverContext);
	if (!ctx) throw new Error('PopoverContent must be inside <Popover>');

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
