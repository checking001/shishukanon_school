import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api.js';

const DataContext = createContext(null);

const COLLECTIONS = ['Students', 'Teachers', 'Fees', 'Attendance', 'Expenses', 'Salaries'];
const EMPTY = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));

export function DataProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(COLLECTIONS.map((c) => api.get(`/sheet/${c}`)));
      const next = {};
      COLLECTIONS.forEach((c, i) => { next[c] = results[i]; });
      setData(next);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Create a row in `collection`. Returns the saved row (with its server-assigned id).
  const add = useCallback(async (collection, obj) => {
    const saved = await api.post(`/sheet/${collection}`, obj);
    setData((d) => ({ ...d, [collection]: [...d[collection], saved] }));
    return saved;
  }, []);

  // Update the row whose `id` matches. `updates` is merged into the existing row.
  const update = useCallback(async (collection, id, updates) => {
    const saved = await api.put(`/sheet/${collection}/${encodeURIComponent(id)}`, updates);
    setData((d) => ({ ...d, [collection]: d[collection].map((r) => (r.id === id ? saved : r)) }));
    return saved;
  }, []);

  const remove = useCallback(async (collection, id) => {
    await api.del(`/sheet/${collection}/${encodeURIComponent(id)}`);
    setData((d) => ({ ...d, [collection]: d[collection].filter((r) => r.id !== id) }));
  }, []);

  // Attendance is saved a whole day at a time (one row per student, upserted
  // by date+studentId) — mirrors the original "Attendance Save" button.
  const saveAttendanceBulk = useCallback(async (records) => {
    const saved = await api.post('/attendance/save', { records });
    setData((d) => {
      const untouched = d.Attendance.filter(
        (a) => !records.some((r) => r.date === a.date && r.studentId === a.studentId)
      );
      return { ...d, Attendance: [...untouched, ...saved] };
    });
    return saved;
  }, []);

  return (
    <DataContext.Provider value={{ ...data, loading, error, refresh, add, update, remove, saveAttendanceBulk }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
