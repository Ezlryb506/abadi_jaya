'use client';

import { useState, useTransition } from 'react';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import EditProductModal from './components/EditProductModal';
import useProductsAdmin from './hooks/useProductsAdmin';
import { revalidateCatalogAction } from '../actions';
import ConfirmDialog from './components/ConfirmDialog';

export default function AdminPage() {
  const {
    loading,
    error,
    products,
    categories,
    page,
    pageSize,
    total,
    listLoading,
    form,
    submitting,
    editing,
    setEditing,
    file,
    handleChange,
    handleFileChange,
    handleCancelForm,
    handleAddProduct,
    handleStartEdit,
    handleUpdateProduct,
    toggleActive,
    handleDelete,
    handleEditFileChange,
    // image picker
    existingImages,
    loadingImages,
    imagePickerOpen,
    selectedExistingUrl,
    usedImageUrls,
    openImagePicker,
    closeImagePicker,
    selectExistingImage,
    clearSelectedExisting,
    addTag,
    removeTag,
    // cache utilities
    refreshImageCache,
    imagesCacheTime,
    // pagination setters
    setPage,
    setPageSize,
  } = useProductsAdmin();

  // state and effects dikelola di hook useProductsAdmin

  // handler dan CRUD dipindah ke hook

  // Refresh catalog UI state (must be declared before any conditional returns)
  const [isRefreshing, startRefreshing] = useTransition();
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const handleRefreshCatalog = () => {
    startRefreshing(async () => {
      try {
        setRefreshMsg('Merefresh cache katalog...');
        const res = await revalidateCatalogAction();
        if (res.ok) {
          setRefreshMsg('Cache katalog berhasil direfresh.');
        } else {
          setRefreshMsg(res.error || 'Gagal merefresh cache katalog.');
        }
      } catch (e) {
        // Log detail untuk developer, tampilkan pesan umum ke pengguna
        console.error('[AdminPage] refresh katalog gagal', e);
        setRefreshMsg('Terjadi kesalahan saat merefresh.');
      } finally {
        setTimeout(() => setRefreshMsg(null), 3000);
      }
    });
  };

  // Konfirmasi aksi: hapus / nonaktifkan
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState<
    | { type: 'delete'; id: number; name?: string }
    | { type: 'deactivate'; id: number; name?: string }
    | null
  >(null);

  const requestDelete = (id: number, name?: string) => {
    setConfirmMeta({ type: 'delete', id, name });
    setConfirmOpen(true);
  };

  const requestToggle = (id: number, current: boolean | null, name?: string) => {
    // Konfirmasi hanya saat menonaktifkan
    if (current === true) {
      setConfirmMeta({ type: 'deactivate', id, name });
      setConfirmOpen(true);
      return;
    }
    // Jika mengaktifkan, langsung eksekusi
    toggleActive(id, true);
  };

  const handleConfirm = () => {
    if (!confirmMeta) return;
    if (confirmMeta.type === 'delete') {
      handleDelete(confirmMeta.id);
    } else if (confirmMeta.type === 'deactivate') {
      toggleActive(confirmMeta.id, false);
    }
    setConfirmOpen(false);
    setConfirmMeta(null);
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setConfirmMeta(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white px-4 py-8 md:py-10">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 md:p-8 animate-pulse">
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <div className="h-10 bg-gray-200 rounded-xl w-20"></div>
                <div className="h-10 bg-orange-200 rounded-xl w-24"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow border border-gray-100 animate-pulse">
            <div className="p-5 md:p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-64"></div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h2>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full px-3 md:px-4 lg:px-6 py-4 md:py-6 overflow-x-hidden [overflow-x:clip]">
      <div className="space-y-5 md:space-y-6 min-w-0">
        {/* Toolbar Admin */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-800">Manajemen Produk</h1>
            <p className="text-sm text-gray-500">Tambah, ubah, dan kelola katalog produk Anda.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {refreshMsg && (
              <span className="text-sm text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg">{refreshMsg}</span>
            )}
            <button
              type="button"
              onClick={handleRefreshCatalog}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-60"
            >
              {isRefreshing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.728 6.728-1.414-1.414M8.686 8.686 7.272 7.272m9.9 0-1.414 1.414M8.686 15.314l-1.414 1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>Merefresh...</span>
                </>
              ) : (
                <>
                  <span>↻</span>
                  <span>Refresh Katalog</span>
                </>
              )}
            </button>
          </div>
        </div>

      {/* Form tambah produk */}
      <section id="add-product" aria-label="Tambah Produk" className="overflow-x-hidden">
      <ProductForm
        form={form}
        categories={categories}
        editing={false}
        submitting={submitting}
        onSubmit={handleAddProduct}
        onCancel={handleCancelForm}
        onChange={handleChange}
        onFileChange={handleFileChange}
        file={file}
        // image picker props
        existingImages={existingImages}
        loadingImages={loadingImages}
        imagePickerOpen={imagePickerOpen}
        selectedExistingUrl={selectedExistingUrl}
        usedImageUrls={usedImageUrls}
        onOpenImagePicker={openImagePicker}
        onCloseImagePicker={closeImagePicker}
        onSelectExistingImage={selectExistingImage}
        onClearSelectedExisting={clearSelectedExisting}
        addTag={addTag}
        removeTag={removeTag}
        onRefreshImageCache={refreshImageCache}
        imagesCacheTime={imagesCacheTime}
      />
      </section>

      {/* Tabel produk */}
      <section aria-label="Daftar Produk" className="overflow-x-hidden">
      <ProductList
        products={products}
        total={total}
        page={page}
        pageSize={pageSize}
        listLoading={listLoading}
        onEdit={handleStartEdit}
        onToggleStatus={(id, current) => requestToggle(id, current, products.find(p => p.id === id)?.name)}
        onDelete={(id) => requestDelete(id, products.find(p => p.id === id)?.name)}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
      </section>

      {/* Modal Edit */}
      <EditProductModal
        open={!!editing}
        form={form}
        categories={categories}
        submitting={submitting}
        onChange={handleChange}
        onSubmit={handleUpdateProduct}
        onClose={() => setEditing(null)}
        onFileChange={handleEditFileChange}
        currentImageUrl={editing?.image_url ?? null}
        addTag={addTag}
        removeTag={removeTag}
      />
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmMeta?.type === 'delete' ? 'Hapus Produk' : 'Nonaktifkan Produk'}
        description={
          confirmMeta?.type === 'delete'
            ? `Produk ${confirmMeta?.name ? '"' + confirmMeta.name + '" ' : ''}akan dihapus permanen beserta file gambarnya. Lanjutkan?`
            : `Produk ${confirmMeta?.name ? '"' + confirmMeta.name + '" ' : ''}akan dinonaktifkan dan tidak tampil ke pelanggan. Lanjutkan?`
        }
        confirmText={confirmMeta?.type === 'delete' ? 'Ya, hapus' : 'Ya, nonaktifkan'}
        cancelText="Batal"
        variant={confirmMeta?.type === 'delete' ? 'danger' : 'default'}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
      </div>
    </div>
  );
}


