<script setup lang="ts">
import { useOwnerTablesView } from './scripts/OwnerTablesView'

const {
  t,
  tables,
  loading,
  showForm,
  editing,
  form,
  showBulk,
  bulkGroups,
  savingForm,
  openCreate,
  openEdit,
  closeForm,
  onSave,
  onDelete,
  addBulkGroup,
  removeBulkGroup,
  onBulkCreate,
  BaseInput,
  BaseButton,
  BaseSpinner,
  EmptyState,
  Plus,
  Pencil,
  Trash2,
} = useOwnerTablesView()
</script>

<template>
  <div class="owner-tables-view">
    <header class="owner-tables-view-header">
      <div>
        <h1 class="owner-tables-view-title">{{ t('ownerTables.title') }}</h1>
        <p class="owner-tables-view-subtitle">{{ t('ownerTables.subtitle') }}</p>
      </div>
      <div class="owner-tables-view-header-actions">
        <BaseButton variant="secondary" @click="showBulk = true">
          <Plus :size="15" />
          {{ t('ownerTables.bulk') }}
        </BaseButton>
        <BaseButton variant="primary" @click="openCreate">
          <Plus :size="15" />
          {{ t('ownerTables.new') }}
        </BaseButton>
      </div>
    </header>

    <div v-if="loading" class="owner-tables-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="tables.length === 0"
      :message="t('ownerTables.empty')"
      :hint="t('ownerTables.emptyHint')"
    />

    <ul v-else class="owner-tables-view-list">
      <li v-for="tbl in tables" :key="tbl.id" class="owner-tables-view-card">
        <div class="owner-tables-view-card-info">
          <p class="owner-tables-view-card-number">Mesa {{ tbl.number }}</p>
          <p class="owner-tables-view-card-meta">
            {{ t('ownerTables.capacity') }}: {{ tbl.capacity }}
            <span v-if="tbl.name"> · {{ tbl.name }}</span>
            <span v-if="!tbl.isActive" class="owner-tables-view-badge--inactive">
              {{ t('common.inactive') }}
            </span>
          </p>
        </div>
        <div class="owner-tables-view-card-actions">
          <button type="button" class="owner-tables-view-icon-btn" @click="openEdit(tbl)">
            <Pencil :size="15" />
          </button>
          <button type="button" class="owner-tables-view-icon-btn owner-tables-view-icon-btn--danger" @click="onDelete(tbl.id)">
            <Trash2 :size="15" />
          </button>
        </div>
      </li>
    </ul>

    <!-- Create/Edit modal -->
    <Teleport to="body">
      <div v-if="showForm" class="owner-tables-view-modal-overlay" @click.self="closeForm">
        <div class="owner-tables-view-modal">
          <h3 class="owner-tables-view-modal-title">
            {{ editing ? t('ownerTables.edit') : t('ownerTables.new') }}
          </h3>
          <form class="owner-tables-view-form" @submit.prevent="onSave">
            <BaseInput v-model.number="form.number" :label="t('ownerTables.number')" type="number" required />
            <BaseInput v-model.number="form.capacity" :label="t('ownerTables.capacity')" type="number" required />
            <BaseInput v-model="form.name" :label="t('ownerTables.name')" />
            <label class="owner-tables-view-checkbox-row">
              <input type="checkbox" v-model="form.isJoinable" />
              {{ t('ownerTables.isJoinable') }}
            </label>
            <label class="owner-tables-view-checkbox-row">
              <input type="checkbox" v-model="form.isActive" />
              {{ t('ownerTables.isActive') }}
            </label>
            <div class="owner-tables-view-modal-actions">
              <BaseButton type="button" variant="ghost" @click="closeForm">{{ t('common.cancel') }}</BaseButton>
              <BaseButton type="submit" variant="primary" :loading="savingForm">{{ t('common.save') }}</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Bulk create modal -->
    <Teleport to="body">
      <div v-if="showBulk" class="owner-tables-view-modal-overlay" @click.self="showBulk = false">
        <div class="owner-tables-view-modal">
          <h3 class="owner-tables-view-modal-title">{{ t('ownerTables.bulkTitle') }}</h3>
          <div v-for="(grp, idx) in bulkGroups" :key="idx" class="owner-tables-view-bulk-row">
            <BaseInput v-model.number="grp.capacity" :label="t('ownerTables.bulkCapacity')" type="number" />
            <BaseInput v-model.number="grp.count" :label="t('ownerTables.bulkCount')" type="number" />
            <button type="button" class="owner-tables-view-icon-btn owner-tables-view-icon-btn--danger" @click="removeBulkGroup(idx)">
              <Trash2 :size="14" />
            </button>
          </div>
          <BaseButton variant="ghost" @click="addBulkGroup">
            <Plus :size="14" /> {{ t('ownerTables.bulkAdd') }}
          </BaseButton>
          <div class="owner-tables-view-modal-actions">
            <BaseButton variant="ghost" @click="showBulk = false">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="primary" @click="onBulkCreate">{{ t('ownerTables.bulkSubmit') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/OwnerTablesView.css" scoped></style>
