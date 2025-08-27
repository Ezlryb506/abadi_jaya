'use client';

import { useState, useTransition } from 'react';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import EditProductModal from './components/EditProductModal';
import useProductsAdmin from './hooks/useProductsAdmin';
import { revalidateCatalogAction } from '../actions';

export default function AdminPage() {
  const {
    loading,
    error,
    products,
    categories,
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
    openImagePicker,
    closeImagePicker,
    selectExistingImage,
    clearSelectedExisting,
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
    <div className="min-h-screen px-4 py-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toolbar Admin */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Manajemen Produk</h1>
            <p className="text-sm text-gray-500">Tambah, ubah, dan kelola katalog produk Anda.</p>
          </div>
          <div className="flex items-center gap-3">
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
      <section id="add-product" aria-label="Tambah Produk">
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
        onOpenImagePicker={openImagePicker}
        onCloseImagePicker={closeImagePicker}
        onSelectExistingImage={selectExistingImage}
        onClearSelectedExisting={clearSelectedExisting}
      />
      </section>

      {/* Tabel produk */}
      <section aria-label="Daftar Produk">
      <ProductList
        products={products}
        onEdit={handleStartEdit}
        onToggleStatus={(id, current) => toggleActive(id, !current)}
        onDelete={handleDelete}
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
      />
      </div>
    </div>
  );
}


