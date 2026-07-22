<script setup lang="ts" generic="T extends SelectValue">
import type { SelectValue } from './types'

defineOptions({ inheritAttrs: false })

const model = defineModel<T>({ required: true })

interface Props {
  id?: string
  label?: string
  help?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false
})

const generatedId = useId()
const selectId = computed(() => props.id ?? generatedId)
const descriptionId = computed(() =>
  props.help || props.error ? `${selectId.value}-description` : undefined
)
</script>

<template>
  <label class="ui-select" :class="{ 'ui-select--invalid': error }" :for="selectId">
    <span v-if="label" class="ui-select__label">{{ label }}</span>
    <select
      :id="selectId"
      v-bind="$attrs"
      v-model="model"
      class="ui-select__field"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="descriptionId"
    >
      <slot />
    </select>
    <span v-if="help || error" :id="descriptionId" class="ui-select__description">
      {{ error ?? help }}
    </span>
  </label>
</template>

<style scoped lang="scss">
.ui-select {
  display: grid;
  gap: 0.4rem;

  &__label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__field {
    padding: 8px 32px 8px 12px;
    font: inherit;
    font-size: 0.9rem;
    color: var(--text-color);
    appearance: none;
    cursor: pointer;
    background: var(--bg-secondary);
    background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 12px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    option {
      color: var(--text-color);
      background: var(--bg-secondary);
    }
  }

  &__description {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  &--invalid &__field {
    border-color: var(--error-color);
  }

  &--invalid &__description {
    color: var(--error-color);
  }
}
</style>
