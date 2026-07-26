<script setup lang="ts" generic="T extends SelectValue">
import { Select } from '@jtclarkjr/component-library-vue'
import type { ChoiceOption } from '@jtclarkjr/component-library-vue'
import type { SelectOption, SelectValue } from './types'

defineOptions({ inheritAttrs: false })

const model = defineModel<T>({ required: true })

interface Props {
  id?: string
  options: SelectOption<T>[]
  label?: string
  help?: string
  error?: string
  placeholder?: string
  name?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  required: false
})

const attrs = useAttrs()
const generatedId = useId()
const selectId = computed(() => props.id ?? generatedId)
const accessibleLabel = computed(() =>
  typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : undefined
)
const libraryOptions = computed(() => props.options as ChoiceOption[])
</script>

<template>
  <div
    class="ui-select"
    :class="[{ 'ui-select--invalid': error }, $attrs.class]"
    :style="$attrs.style"
  >
    <label v-if="!label && accessibleLabel" class="ui-select__sr-only" :for="selectId">
      {{ accessibleLabel }}
    </label>
    <Select
      :id="selectId"
      v-model="model"
      class="ui-select__field"
      :options="libraryOptions"
      :label="label"
      :help="help"
      :error="error"
      :placeholder="placeholder"
      :name="name"
      :disabled="disabled"
      :required="required"
    />
  </div>
</template>

<style scoped lang="scss">
.ui-select {
  display: grid;
  gap: 0.4rem;

  &__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__field {
    gap: 0.4rem;
  }

  &__field :deep(.clv-select-field__label) {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__field :deep(.clv-select) {
    padding: 8px 32px 8px 12px;
    font: inherit;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    background: var(--bg-secondary);
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
  }

  &__field :deep(.clv-select__icon) {
    flex: 0 0 auto;
    width: 0.45rem;
    height: 0.45rem;
    font-size: 0;
    line-height: 0;
    border-right: 1.5px solid currentcolor;
    border-bottom: 1.5px solid currentcolor;
    transform: translateY(-1px) rotate(45deg);
  }

  &__field :deep(.clv-select-field > span) {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  &--invalid &__field :deep(.clv-select) {
    border-color: var(--error-color);
  }

  &--invalid &__field :deep(.clv-select-field__error) {
    color: var(--error-color);
  }
}
</style>
