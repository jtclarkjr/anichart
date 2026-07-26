<script setup lang="ts">
import { Input } from '@jtclarkjr/component-library-vue'
import Button from './Button.vue'
import type { InputType } from './types'

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })

interface Props {
  id?: string
  label?: string
  help?: string
  error?: string
  type?: InputType
  placeholder?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  clearLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  clearable: false,
  clearLabel: 'Clear input'
})

const emit = defineEmits<{
  clear: []
}>()

const attrs = useAttrs()
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const accessibleLabel = computed(() =>
  typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : undefined
)

const clear = () => {
  model.value = ''
  emit('clear')
}
</script>

<template>
  <div
    class="ui-input"
    :class="[{ 'ui-input--invalid': error }, $attrs.class]"
    :style="$attrs.style"
  >
    <label v-if="label" class="ui-input__label" :for="inputId">{{ label }}</label>
    <label v-else-if="accessibleLabel" class="ui-input__sr-only" :for="inputId">
      {{ accessibleLabel }}
    </label>
    <span class="ui-input__control">
      <span v-if="$slots.leading" class="ui-input__leading"><slot name="leading" /></span>
      <Input
        :id="inputId"
        v-model="model"
        class="ui-input__field"
        :class="{
          'ui-input__field--leading': $slots.leading,
          'ui-input__field--trailing': $slots.trailing || (clearable && model)
        }"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :help="help"
        :error="error"
      />
      <span v-if="$slots.trailing || (clearable && model)" class="ui-input__trailing">
        <slot name="trailing" />
        <Button
          v-if="clearable && model"
          class="ui-input__clear"
          variant="ghost"
          size="icon"
          :aria-label="clearLabel"
          @click="clear"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Button>
      </span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.ui-input {
  display: grid;
  width: 100%;
  gap: 0.4rem;

  &__label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

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

  &__control {
    position: relative;
    display: block;
    width: 100%;
  }

  &__field {
    display: block;
  }

  &__field :deep(input) {
    width: 100%;
    padding: 12px 16px;
    font: inherit;
    font-size: 1rem;
    color: var(--text-color);
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    &::placeholder {
      color: var(--text-muted);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    &[type='search']::-webkit-search-cancel-button,
    &[type='search']::-webkit-search-decoration {
      appearance: none;
    }
  }

  &__field--leading :deep(input) {
    padding-left: 44px;
  }

  &__field--trailing :deep(input) {
    padding-right: 48px;
  }

  &__leading,
  &__trailing {
    position: absolute;
    top: calc((1lh + 28px) / 2);
    z-index: 1;
    display: inline-flex;
    align-items: center;
    transform: translateY(-50%);
  }

  &__leading {
    left: 12px;
  }

  &__trailing {
    right: 12px;
  }

  &__clear {
    width: 24px;
    min-height: 24px;
    height: 24px;
    padding: 0;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__description {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  &__field :deep(> span) {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  &--invalid &__field :deep(input) {
    border-color: var(--error-color);
  }

  &--invalid &__field :deep(.clv-input__error) {
    color: var(--error-color);
  }
}
</style>
