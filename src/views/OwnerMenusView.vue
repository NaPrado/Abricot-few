<script setup lang="ts">
import { useOwnerMenusView } from './scripts/OwnerMenusView'

const {
  t,
  menus,
  loading,
  expandedMenuId,
  expandedCategoryId,
  showMenuForm,
  menuFormName,
  showCategoryForm,
  categoryFormName,
  showItemForm,
  itemForm,
  savingMenu,
  savingCategory,
  savingItem,
  toggleMenu,
  toggleCategory,
  openMenuCreate,
  closeMenuForm,
  saveMenu,
  deleteMenu,
  activateMenu,
  openCategoryCreate,
  closeCategoryForm,
  saveCategory,
  deleteCategory,
  openItemCreate,
  closeItemForm,
  saveItem,
  deleteItem,
  toggleItemAvailability,
  onItemPhoto,
  BaseInput,
  BaseTextarea,
  BaseButton,
  BaseSpinner,
  EmptyState,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Check,
  ImagePlus,
} = useOwnerMenusView()
</script>

<template>
  <div class="owner-menus-view">
    <header class="owner-menus-view-header">
      <div>
        <h1 class="owner-menus-view-title">{{ t('ownerMenus.title') }}</h1>
        <p class="owner-menus-view-subtitle">{{ t('ownerMenus.subtitle') }}</p>
      </div>
      <BaseButton variant="primary" @click="openMenuCreate">
        <Plus :size="15" />
        {{ t('ownerMenus.new') }}
      </BaseButton>
    </header>

    <div v-if="loading" class="owner-menus-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="menus.length === 0"
      :title="t('ownerMenus.empty')"
      :description="t('ownerMenus.emptyHint')"
    />

    <ul v-else class="owner-menus-view-menu-list">
      <li v-for="menu in menus" :key="menu.id" class="owner-menus-view-menu-item">
        <!-- Menu header -->
        <div class="owner-menus-view-menu-header" @click="toggleMenu(menu.id)">
          <div class="owner-menus-view-menu-header-left">
            <component :is="expandedMenuId === menu.id ? ChevronDown : ChevronRight" :size="16" />
            <span class="owner-menus-view-menu-name">{{ menu.name }}</span>
            <span v-if="menu.isActive" class="owner-menus-view-badge--active">{{ t('ownerMenus.active') }}</span>
          </div>
          <div class="owner-menus-view-menu-actions" @click.stop>
            <button type="button" class="owner-menus-view-icon-btn" @click="activateMenu(menu)">
              <Check :size="14" />
            </button>
            <button type="button" class="owner-menus-view-icon-btn" @click="openMenuCreate(menu)">
              <Pencil :size="14" />
            </button>
            <button type="button" class="owner-menus-view-icon-btn owner-menus-view-icon-btn--danger" @click="deleteMenu(menu.id)">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>

        <!-- Categories (expanded) -->
        <div v-if="expandedMenuId === menu.id" class="owner-menus-view-categories">
          <ul class="owner-menus-view-category-list">
            <li v-for="cat in menu.categories" :key="cat.id" class="owner-menus-view-category-item">
              <!-- Category header -->
              <div class="owner-menus-view-category-header" @click="toggleCategory(cat.id)">
                <div class="owner-menus-view-category-header-left">
                  <component :is="expandedCategoryId === cat.id ? ChevronDown : ChevronRight" :size="14" />
                  <span class="owner-menus-view-category-name">{{ cat.name }}</span>
                  <span class="owner-menus-view-category-count">{{ cat.items.length }}</span>
                </div>
                <div class="owner-menus-view-category-actions" @click.stop>
                  <button type="button" class="owner-menus-view-icon-btn" @click="openCategoryCreate(menu.id, cat)">
                    <Pencil :size="13" />
                  </button>
                  <button type="button" class="owner-menus-view-icon-btn owner-menus-view-icon-btn--danger" @click="deleteCategory(menu.id, cat.id)">
                    <Trash2 :size="13" />
                  </button>
                </div>
              </div>

              <!-- Items (expanded) -->
              <ul v-if="expandedCategoryId === cat.id" class="owner-menus-view-items-list">
                <li v-for="item in cat.items" :key="item.id" class="owner-menus-view-item-row">
                  <img
                    v-if="item.photoUrl"
                    :src="item.photoUrl"
                    class="owner-menus-view-item-photo"
                    alt=""
                  />
                  <div class="owner-menus-view-item-photo-placeholder" v-else>
                    <ImagePlus :size="14" />
                  </div>
                  <div class="owner-menus-view-item-info">
                    <p class="owner-menus-view-item-name">{{ item.name }}</p>
                    <p class="owner-menus-view-item-price">${{ item.price }}</p>
                  </div>
                  <div class="owner-menus-view-item-actions">
                    <label class="owner-menus-view-toggle-small">
                      <input
                        type="checkbox"
                        :checked="item.isAvailable"
                        @change="toggleItemAvailability(item)"
                      />
                      {{ t('ownerMenus.itemAvailable') }}
                    </label>
                    <label class="owner-menus-view-photo-upload-btn">
                      <input type="file" accept="image/*" class="owner-menus-view-file-input" @change="onItemPhoto(item.id, $event)" />
                      <ImagePlus :size="13" />
                    </label>
                    <button type="button" class="owner-menus-view-icon-btn" @click="openItemCreate(cat.id, item)">
                      <Pencil :size="13" />
                    </button>
                    <button type="button" class="owner-menus-view-icon-btn owner-menus-view-icon-btn--danger" @click="deleteItem(cat.id, item.id)">
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </li>

                <li class="owner-menus-view-add-item-row">
                  <button type="button" class="owner-menus-view-add-item-btn" @click="openItemCreate(cat.id)">
                    <Plus :size="13" />
                    {{ t('ownerMenus.newItem') }}
                  </button>
                </li>
              </ul>
            </li>
          </ul>

          <button type="button" class="owner-menus-view-add-category-btn" @click="openCategoryCreate(menu.id)">
            <Plus :size="14" />
            {{ t('ownerMenus.newCategory') }}
          </button>
        </div>
      </li>
    </ul>

    <!-- Menu create/edit modal -->
    <Teleport to="body">
      <div v-if="showMenuForm" class="owner-menus-view-modal-overlay" @click.self="closeMenuForm">
        <div class="owner-menus-view-modal">
          <h3 class="owner-menus-view-modal-title">{{ t('ownerMenus.menuName') }}</h3>
          <BaseInput v-model="menuFormName" :label="t('ownerMenus.menuName')" required />
          <div class="owner-menus-view-modal-actions">
            <BaseButton variant="ghost" @click="closeMenuForm">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="primary" :loading="savingMenu" @click="saveMenu">{{ t('common.save') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Category create/edit modal -->
    <Teleport to="body">
      <div v-if="showCategoryForm" class="owner-menus-view-modal-overlay" @click.self="closeCategoryForm">
        <div class="owner-menus-view-modal">
          <h3 class="owner-menus-view-modal-title">{{ t('ownerMenus.categoryName') }}</h3>
          <BaseInput v-model="categoryFormName" :label="t('ownerMenus.categoryName')" required />
          <div class="owner-menus-view-modal-actions">
            <BaseButton variant="ghost" @click="closeCategoryForm">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="primary" :loading="savingCategory" @click="saveCategory">{{ t('common.save') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Item create/edit modal -->
    <Teleport to="body">
      <div v-if="showItemForm" class="owner-menus-view-modal-overlay" @click.self="closeItemForm">
        <div class="owner-menus-view-modal">
          <h3 class="owner-menus-view-modal-title">{{ t('ownerMenus.itemName') }}</h3>
          <BaseInput v-model="itemForm.name" :label="t('ownerMenus.itemName')" required />
          <BaseTextarea v-model="itemForm.description" :label="t('ownerMenus.itemDescription')" />
          <BaseInput v-model="itemForm.price" :label="t('ownerMenus.itemPrice')" required />
          <label class="owner-menus-view-checkbox-row">
            <input type="checkbox" v-model="itemForm.isAvailable" />
            {{ t('ownerMenus.itemAvailable') }}
          </label>
          <div class="owner-menus-view-modal-actions">
            <BaseButton variant="ghost" @click="closeItemForm">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="primary" :loading="savingItem" @click="saveItem">{{ t('common.save') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/OwnerMenusView.css" scoped></style>
