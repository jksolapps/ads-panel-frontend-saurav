/** @format */
import { useMemo, useEffect, useRef } from 'react';

const safeParse = (v, fallback) => {
	try {
		return v ? JSON.parse(v) : fallback;
	} catch {
		return fallback;
	}
};

const uniqInOrder = (arr) => {
	const seen = new Set();
	const out = [];
	for (const x of arr) {
		if (!x || seen.has(x)) continue;
		seen.add(x);
		out.push(x);
	}
	return out;
};

export default function useReorderedFilterOrder({
	baseOrder = [],
	activeCounts = {},
	selectedKey = '',
	storageKey = 'reportState',
	persist = true,
}) {
	const didHydrateRef = useRef(false);

	const activeKeys = useMemo(() => {
		return baseOrder.filter((k) => (activeCounts?.[k] ?? 0) > 0);
	}, [baseOrder, activeCounts]);

	// hydrate stored order once
	const storedOrder = useMemo(() => {
		const stored = safeParse(localStorage.getItem(storageKey), []);
		const valid = stored.filter((k) => baseOrder.includes(k));
		return uniqInOrder(valid);
	}, [storageKey, baseOrder]);

	// Build “preferred order” to persist
	const preferredOrder = useMemo(() => {
		let next = storedOrder;

		if (selectedKey && baseOrder.includes(selectedKey)) {
			next = [...next.filter((k) => k !== selectedKey), selectedKey];
		}

		return uniqInOrder(next);
	}, [storedOrder, selectedKey, baseOrder]);

	useEffect(() => {
		if (!persist) return;

		if (!didHydrateRef.current) {
			didHydrateRef.current = true;

			if (!localStorage.getItem(storageKey)) {
				const seed = uniqInOrder(activeKeys);
				localStorage.setItem(storageKey, JSON.stringify(seed));
			}
			return;
		}

		localStorage.setItem(storageKey, JSON.stringify(preferredOrder));
	}, [persist, preferredOrder, storageKey, activeKeys]);

	// Final computed render order
	const renderOrder = useMemo(() => {
		if (!activeKeys.length) return baseOrder;

		const preferredActive = preferredOrder.filter((k) => activeKeys.includes(k));
		const missingActive = activeKeys.filter((k) => !preferredActive.includes(k));
		const activeSection = [...preferredActive, ...missingActive];

		const inactiveSection = baseOrder.filter((k) => !activeSection.includes(k));

		return [...activeSection, ...inactiveSection];
	}, [baseOrder, activeKeys, preferredOrder]);

	return renderOrder;
}
