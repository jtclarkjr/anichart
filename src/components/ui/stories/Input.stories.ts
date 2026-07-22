import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Input from '../Input.vue'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: {
    label: 'Search',
    placeholder: 'Search anime...',
    modelValue: '',
    clearable: true
  }
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Filled: Story = { args: { modelValue: 'Cowboy Bebop' } }
export const Invalid: Story = { args: { error: 'Enter a search term.' } }
export const Disabled: Story = { args: { disabled: true } }
export const WithSlots: Story = {
  render: (args) => ({
    components: { Input },
    setup: () => ({ args }),
    template: `<Input v-bind="args">
      <template #leading><span aria-hidden="true">⌕</span></template>
      <template #trailing><span aria-hidden="true">⌘K</span></template>
    </Input>`
  })
}
