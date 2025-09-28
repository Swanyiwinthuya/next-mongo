'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DataGrid } from '@mui/x-data-grid';
import {
  TextField,
  Button,
  IconButton,
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const APIBASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export default function CategoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { name: '', order: '' },
  });

  const fetchRows = async () => {
    setLoading(true);
    const res = await fetch(`${APIBASE}/category`, { cache: 'no-store' });
    const data = await res.json();
    setRows(data.map(d => ({ id: d._id, name: d.name, order: d.order ?? 0 })));
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const onSubmit = async (data) => {
    if (!data.name?.trim()) return;

    const payload = { name: data.name.trim(), order: Number(data.order) || 0 };
    if (editingId) {
      await fetch(`${APIBASE}/category/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${APIBASE}/category`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    reset({ name: '', order: '' });
    setEditingId(null);
    await fetchRows();
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setValue('name', row.name);
    setValue('order', row.order);
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete category "${row.name}"?`)) return;
    await fetch(`${APIBASE}/category/${row.id}`, { method: 'DELETE' });
    await fetchRows();
  };

  const columns = useMemo(() => [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'order', headerName: 'Order', width: 120, type: 'number' },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleEdit(params.row)} aria-label="edit">
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row)} aria-label="delete">
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </>
      ),
    },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Category name:</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField label="Name" size="small" {...register('name')} />
            <TextField label="Order" size="small" type="number" {...register('order')} />
            <Button type="submit" variant="contained" color="success">
              {editingId ? 'Save' : 'Add'}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                onClick={() => { reset({ name: '', order: '' }); setEditingId(null); }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </form>
      </Paper>

      <div style={{ height: 520, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 100, page: 0 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
        />
      </div>
    </Box>
  );
}
