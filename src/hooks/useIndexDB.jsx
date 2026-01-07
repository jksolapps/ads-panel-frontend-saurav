/** @format */

import { useState, useEffect } from 'react';

const useIndexedDB = (dbName, storeName) => {
	const [db, setDb] = useState(null);
	const [isDBReady, setIsDBReady] = useState(false);

	// Initialize IndexedDB
	useEffect(() => {
		const request = indexedDB.open(dbName, 1);
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains(storeName)) {
				db.createObjectStore(storeName, { keyPath: 'id' });
			}
		};
		request.onsuccess = (event) => {
			setDb(event.target.result);
			setIsDBReady(!isDBReady);
		};
		request.onerror = (event) => {
			console.error('IndexedDB error:', event.target.errorCode);
		};
	}, [dbName, storeName]);

	const saveData = async (data) => {
		if (!db) return;
		try {
			const transaction = db.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			await store.put(data);
		} catch (error) {
			console.error('Error saving data:', error);
		}
	};

	const fetchDBData = async (filterKey) => {
		if (!db) return null;
		return new Promise((resolve, reject) => {
			try {
				const transaction = db.transaction([storeName], 'readonly');
				const store = transaction.objectStore(storeName);
				const request = store.getAll();

				request.onsuccess = () => {
					const allData = request.result;
					const filteredItem = allData.find((item) => item.id === filterKey);
					resolve(filteredItem ? filteredItem.value : []);
				};
				request.onerror = () => {
					reject(request.error);
				};
			} catch (error) {
				reject(error);
			}
		});
	};

	return { isDBReady, saveData, fetchDBData };
};

export default useIndexedDB;
